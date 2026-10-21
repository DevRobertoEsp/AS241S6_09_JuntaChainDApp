<!-- PÁGINA 2: Transferencias cuenta a cuenta con Selector de Redes -->
<script lang="ts">
	import { walletStore, connectWallet } from '$lib/stores/wallet';
	import { EVM_NETWORKS, switchOrAddNetwork, getNetworkByChainId, type NetworkConfig } from '$lib/data/networks';
	import { ethers } from 'ethers';

	let selectedNetwork = $state<NetworkConfig>(EVM_NETWORKS[0]);
	let toAddress = $state('');
	let amount = $state('');
	let sending = $state(false);
	let switchingNetwork = $state(false);
	let userBalance = $state<string | null>(null);
	let loadingBalance = $state(false);
	let error = $state('');
	let txHash = $state('');
	let txStatus = $state<'idle' | 'pending' | 'success' | 'error'>('idle');
	let isSelectorOpen = $state(false);

	interface TxRecord {
		hash: string;
		to: string;
		amount: string;
		symbol: string;
		network: string;
		explorerUrl: string;
		timestamp: number;
	}
	let txHistory = $state<TxRecord[]>([]);

	$effect(() => {
		const saved = localStorage.getItem('juntachain_txs');
		if (saved) txHistory = JSON.parse(saved);
	});

	// Sincronizar red seleccionada con wallet si cambia en MetaMask
	$effect(() => {
		if ($walletStore.chainId) {
			const net = getNetworkByChainId($walletStore.chainId);
			if (net) selectedNetwork = net;
		}
	});

	// Cargar saldo de la cuenta en la red seleccionada
	$effect(() => {
		const net = selectedNetwork;
		const acc = $walletStore.account;
		if (net && acc) {
			loadingBalance = true;
			const provider = new ethers.JsonRpcProvider(net.rpcUrl, net.chainId, { staticNetwork: true });
			provider.getBalance(acc)
				.then((bal) => {
					userBalance = parseFloat(ethers.formatEther(bal)).toFixed(6);
					loadingBalance = false;
				})
				.catch(() => {
					userBalance = null;
					loadingBalance = false;
				});
		} else {
			userBalance = null;
			loadingBalance = false;
		}
	});

	async function handleSelectNetwork(net: NetworkConfig) {
		selectedNetwork = net;
		isSelectorOpen = false;
		error = '';

		if ($walletStore.isConnected && $walletStore.chainId !== net.chainId) {
			switchingNetwork = true;
			try {
				await switchOrAddNetwork(net);
			} catch (err: unknown) {
				const e = err as { message?: string };
				error = e.message ?? 'Error al cambiar de red en MetaMask.';
			} finally {
				switchingNetwork = false;
			}
		}
	}

	function saveTx(tx: TxRecord) {
		txHistory = [tx, ...txHistory].slice(0, 10);
		localStorage.setItem('juntachain_txs', JSON.stringify(txHistory));
	}

	const isValidAddress = (addr: string) => /^0x[0-9a-fA-F]{40}$/.test(addr);

	async function sendTransaction() {
		error = '';
		txHash = '';
		txStatus = 'idle';

		if (!$walletStore.isConnected) { error = 'Conecta tu wallet primero.'; return; }
		if ($walletStore.chainId !== selectedNetwork.chainId) {
			error = `Tu wallet debe estar en la red ${selectedNetwork.name}. Haz clic en "Cambiar Red".`;
			return;
		}
		if (!isValidAddress(toAddress)) { error = 'Dirección inválida (debe ser 0x... con 42 caracteres).'; return; }
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { error = 'Ingresa un monto válido mayor a 0.'; return; }

		sending = true;
		txStatus = 'pending';
		try {
			if (!window.ethereum) { error = 'MetaMask no está disponible.'; sending = false; txStatus = 'idle'; return; }
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const parsedValue = ethers.parseEther(String(amount));
			const tx = await signer.sendTransaction({ to: toAddress, value: parsedValue });
			txHash = tx.hash;
			await tx.wait();
			txStatus = 'success';
			saveTx({
				hash: tx.hash,
				to: toAddress,
				amount: String(amount),
				symbol: selectedNetwork.symbol,
				network: selectedNetwork.name,
				explorerUrl: selectedNetwork.explorerUrl,
				timestamp: Date.now()
			});
			toAddress = '';
			amount = '';
		} catch (err: unknown) {
			txStatus = 'error';
			const e = err as { code?: string; message?: string };
			error = e.code === 'ACTION_REJECTED' ? 'Transacción rechazada por el usuario.' : (e.message ?? 'Error desconocido.');
		} finally {
			sending = false;
		}
	}

	function fillMax() {
		if (!userBalance) return;
		const num = Math.max(0, parseFloat(userBalance) - 0.001);
		amount = num > 0 ? num.toFixed(6) : '0';
	}

	const shortAddr = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`;
	const shortHash = (h: string) => `${h.slice(0, 12)}...${h.slice(-8)}`;
	function timeAgo(ts: number) {
		const s = Math.floor((Date.now() - ts) / 1000);
		if (s < 60) return `hace ${s}s`;
		if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
		return `hace ${Math.floor(s / 3600)}h`;
	}

	let addressValid = $derived(toAddress.length > 0 && isValidAddress(toAddress));
	let isWrongNetwork = $derived($walletStore.isConnected && $walletStore.chainId !== selectedNetwork.chainId);
	let canSend = $derived($walletStore.isConnected && !isWrongNetwork && addressValid && Number(amount) > 0 && !sending);
</script>

<div class="max-w-2xl mx-auto px-4 py-8 space-y-8">

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white flex items-center gap-3">💸 Transferencias Multi-Red</h1>
		<p class="text-gray-400 mt-1">Selecciona cualquier red blockchain (Ethereum, Polygon, BNB, Avalanche, etc.) y envía criptomonedas directamente.</p>
	</div>

	<!-- Selector de Red en Formulario -->
	<div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-5">

		<!-- Encabezado de Red -->
		<div class="space-y-2">
			<label class="text-sm text-gray-400 font-medium flex justify-between items-center">
				<span>Red y Moneda de Transferencia</span>
				{#if $walletStore.isConnected && userBalance !== null}
					<span class="text-xs text-emerald-400 font-mono">
						{#if loadingBalance}
							<span class="animate-spin inline-block">⟳</span> Cargando saldo...
						{:else}
							Saldo: {userBalance} {selectedNetwork.symbol}
						{/if}
					</span>
				{/if}
			</label>

			<!-- Botón selector de red -->
			<div class="relative">
				<button
					type="button"
					onclick={() => isSelectorOpen = !isSelectorOpen}
					class="w-full bg-gray-900 border border-gray-600 hover:border-gray-500 rounded-xl px-4 py-3 flex items-center justify-between text-white transition-colors"
				>
					<div class="flex items-center gap-3">
						<span class="text-2xl">{selectedNetwork.icon}</span>
						<div class="text-left">
							<p class="font-semibold text-sm leading-tight">{selectedNetwork.name}</p>
							<p class="text-xs text-gray-400 font-mono">Moneda: <strong class="text-emerald-400">{selectedNetwork.symbol}</strong> · Chain {selectedNetwork.chainId}</p>
						</div>
					</div>
					<span class="text-gray-400 text-xs bg-gray-800 border border-gray-700 px-2 py-1 rounded-lg">
						{isSelectorOpen ? '▲ Cerrar' : '▼ Seleccionar Red'}
					</span>
				</button>

				<!-- Desplegable de Redes EVM -->
				{#if isSelectorOpen}
					<div class="absolute left-0 right-0 top-full mt-2 z-20 bg-gray-900 border border-gray-700 rounded-2xl p-3 shadow-2xl space-y-2 max-h-80 overflow-y-auto">
						<div class="flex justify-between items-center px-2 py-1 text-xs text-gray-400">
							<span class="font-semibold">REDES DISPONIBLES ({EVM_NETWORKS.length})</span>
							<span>Haz clic para cambiar en MetaMask</span>
						</div>
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
							{#each EVM_NETWORKS as net}
								{@const isActiveNet = selectedNetwork.chainId === net.chainId}
								{@const isConnectedNet = $walletStore.chainId === net.chainId}
								<button
									type="button"
									onclick={() => handleSelectNetwork(net)}
									class="flex items-center gap-3 p-2.5 rounded-xl border text-left transition-all
										{isActiveNet ? 'border-emerald-500 bg-emerald-900/30 text-white' : 'border-gray-800 bg-gray-800/50 hover:bg-gray-800 text-gray-300'}"
								>
									<span class="text-xl flex-shrink-0">{net.icon}</span>
									<div class="min-w-0 flex-1">
										<p class="text-xs font-semibold truncate flex items-center gap-1">
											{net.name}
											{#if isConnectedNet}
												<span class="text-[10px] bg-emerald-900 text-emerald-300 px-1.5 py-0.2 rounded-full border border-emerald-700">Activa</span>
											{/if}
										</p>
										<p class="text-[11px] text-gray-400 font-mono">{net.symbol} · ID {net.chainId}</p>
									</div>
								</button>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		</div>

		<!-- Alerta si MetaMask está en otra red -->
		{#if isWrongNetwork}
			<div class="bg-yellow-900/30 border border-yellow-700/50 rounded-xl p-3.5 flex items-center justify-between text-yellow-300 text-xs">
				<div class="flex items-center gap-2">
					<span>⚠</span>
					<span>MetaMask está en otra red. Debes cambiar a <strong>{selectedNetwork.name}</strong>.</span>
				</div>
				<button
					type="button"
					onclick={() => handleSelectNetwork(selectedNetwork)}
					disabled={switchingNetwork}
					class="bg-yellow-600 hover:bg-yellow-500 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex-shrink-0"
				>
					{switchingNetwork ? 'Cambiando...' : 'Cambiar Red'}
				</button>
			</div>
		{/if}

		<!-- Dirección de Destino -->
		<div class="space-y-2">
			<label class="text-sm text-gray-400 font-medium" for="to-addr">Dirección de Destino</label>
			<input
				id="to-addr"
				type="text"
				bind:value={toAddress}
				placeholder="0x742d35Cc6634C0532925a3b8D4C9C..."
				class="w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono text-sm
					focus:outline-none transition-colors
					{toAddress.length > 0 ? (addressValid ? 'border-emerald-500' : 'border-red-500') : 'border-gray-600'}"
			/>
			{#if toAddress.length > 0}
				<p class="text-xs {addressValid ? 'text-emerald-400' : 'text-red-400'}">
					{addressValid ? '✓ Dirección válida' : '⚠ Dirección no válida'}
				</p>
			{/if}
		</div>

		<!-- Monto -->
		<div class="space-y-2">
			<div class="flex justify-between items-center">
				<label class="text-sm text-gray-400 font-medium" for="amount">
					Monto ({selectedNetwork.symbol})
				</label>
				{#if userBalance !== null && parseFloat(userBalance) > 0}
					<button
						type="button"
						onclick={fillMax}
						class="text-xs text-emerald-400 hover:text-emerald-300 bg-emerald-900/40 px-2 py-0.5 rounded transition-colors"
					>
						MAX ({userBalance})
					</button>
				{/if}
			</div>

			<div class="relative">
				<input
					id="amount"
					type="number"
					bind:value={amount}
					placeholder="0.001"
					min="0"
					step="0.0001"
					class="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 pr-20 text-white
						placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
				/>
				<span class="absolute right-4 top-1/2 -translate-y-1/2 text-emerald-400 text-sm font-semibold">
					{selectedNetwork.symbol}
				</span>
			</div>
		</div>

		<!-- Resumen previo -->
		{#if addressValid && Number(amount) > 0}
			<div class="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-2 text-sm">
				{#each [
					['Origen (De)', shortAddr($walletStore.account ?? '')],
					['Destino (Para)', shortAddr(toAddress)],
					['Monto a Enviar', `${amount} ${selectedNetwork.symbol}`],
					['Red Blockchain', `${selectedNetwork.icon} ${selectedNetwork.name}`]
				] as [label, value]}
					<div class="flex justify-between">
						<span class="text-gray-500">{label}:</span>
						<span class="font-mono text-white {label.includes('Monto') ? 'text-emerald-400 font-bold' : ''}">{value}</span>
					</div>
				{/each}
			</div>
		{/if}

		{#if error}
			<div class="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-300 text-sm">⚠ {error}</div>
		{/if}

		{#if !$walletStore.isConnected}
			<button onclick={connectWallet}
				class="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3.5 rounded-xl transition-all">
				🔗 Conectar Wallet para Transferir
			</button>
		{:else if isWrongNetwork}
			<button onclick={() => handleSelectNetwork(selectedNetwork)} disabled={switchingNetwork}
				class="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-semibold py-3.5 rounded-xl transition-all">
				{switchingNetwork ? 'Cambiando de Red...' : `🌐 Cambiar MetaMask a ${selectedNetwork.name}`}
			</button>
		{:else}
			<button onclick={sendTransaction} disabled={!canSend}
				class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
					text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
				{#if sending}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Procesando en la Blockchain...
				{:else}
					💸 Enviar {amount ? `${amount} ${selectedNetwork.symbol}` : 'Transferencia'}
				{/if}
			</button>
		{/if}
	</div>

	<!-- Estado de TX -->
	{#if txStatus !== 'idle'}
		<div class="rounded-2xl border p-5 space-y-4
			{txStatus === 'success' ? 'bg-emerald-900/20 border-emerald-700' :
			 txStatus === 'pending' ? 'bg-yellow-900/20 border-yellow-700' :
			 'bg-red-900/20 border-red-700'}">

			<div class="flex items-center gap-3 font-semibold">
				{#if txStatus === 'pending'}
					<span class="w-5 h-5 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin"></span>
					<span class="text-yellow-300">Confirmando en la blockchain...</span>
				{:else if txStatus === 'success'}
					<span class="text-2xl">✅</span>
					<span class="text-emerald-300">¡Transacción Confirmada!</span>
				{:else}
					<span class="text-2xl">❌</span>
					<span class="text-red-300">Error en la Transacción</span>
				{/if}
			</div>

			{#if txHash}
				<div class="space-y-3">
					<p class="text-sm text-gray-400">Hash de transacción:</p>
					<div class="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
						<span class="font-mono text-xs text-emerald-300 flex-1 break-all">{txHash}</span>
						<button onclick={() => navigator.clipboard.writeText(txHash)}
							class="flex-shrink-0 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 px-2 py-1 rounded transition-colors">
							📋 Copiar
						</button>
					</div>
					{#if selectedNetwork.explorerUrl}
						<a href="{selectedNetwork.explorerUrl}/tx/{txHash}" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline">
							🔍 Ver detalle completo en {selectedNetwork.name} Explorer →
						</a>
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Historial -->
	{#if txHistory.length > 0}
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-white">Historial Reciente</h2>
				<button onclick={() => { txHistory = []; localStorage.removeItem('juntachain_txs'); }}
					class="text-xs text-gray-500 hover:text-red-400 transition-colors">Limpiar</button>
			</div>
			<div class="space-y-3">
				{#each txHistory as tx}
					<div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 space-y-2">
						<div class="flex items-center justify-between">
							<span class="text-emerald-400 font-semibold">-{tx.amount} {tx.symbol}</span>
							<span class="text-gray-500 text-xs">{timeAgo(tx.timestamp)}</span>
						</div>
						<div class="text-sm text-gray-400 font-mono">→ {shortAddr(tx.to)}</div>
						<div class="flex items-center gap-3">
							<span class="font-mono text-xs text-gray-500">{shortHash(tx.hash)}</span>
							{#if tx.explorerUrl}
								<a href="{tx.explorerUrl}/tx/{tx.hash}" target="_blank" rel="noopener noreferrer"
									class="text-xs text-emerald-500 hover:text-emerald-400 underline">Ver →</a>
							{/if}
						</div>
						<div class="text-xs text-gray-600">{tx.network}</div>
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
