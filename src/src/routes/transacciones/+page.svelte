<!-- PÁGINA 2: Transferencias cuenta a cuenta -->
<script lang="ts">
	import { walletStore, connectWallet } from '$lib/stores/wallet';
	import { getNetworkByChainId } from '$lib/data/networks';
	import { ethers } from 'ethers';

	let toAddress = $state('');
	let amount = $state('');
	let sending = $state(false);
	let error = $state('');
	let txHash = $state('');
	let txStatus = $state<'idle' | 'pending' | 'success' | 'error'>('idle');

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
		if (!isValidAddress(toAddress)) { error = 'Dirección inválida (debe ser 0x... con 42 caracteres).'; return; }
		if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) { error = 'Ingresa un monto válido mayor a 0.'; return; }

		sending = true;
		txStatus = 'pending';
		try {
			if (!window.ethereum) { error = 'MetaMask no está disponible.'; sending = false; txStatus = 'idle'; return; }
			const provider = new ethers.BrowserProvider(window.ethereum);
			const signer = await provider.getSigner();
			const tx = await signer.sendTransaction({ to: toAddress, value: ethers.parseEther(amount) });
			txHash = tx.hash;
			await tx.wait();
			txStatus = 'success';
			const net = getNetworkByChainId($walletStore.chainId ?? 0);
			saveTx({ hash: tx.hash, to: toAddress, amount, symbol: net?.symbol ?? 'ETH', network: net?.name ?? '—', explorerUrl: net?.explorerUrl ?? '', timestamp: Date.now() });
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

	const shortAddr = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`;
	const shortHash = (h: string) => `${h.slice(0, 12)}...${h.slice(-8)}`;
	function timeAgo(ts: number) {
		const s = Math.floor((Date.now() - ts) / 1000);
		if (s < 60) return `hace ${s}s`;
		if (s < 3600) return `hace ${Math.floor(s / 60)}m`;
		return `hace ${Math.floor(s / 3600)}h`;
	}

	let currentNetwork = $derived($walletStore.chainId ? getNetworkByChainId($walletStore.chainId) : null);
	let addressValid = $derived(toAddress.length > 0 && isValidAddress(toAddress));
	let canSend = $derived($walletStore.isConnected && addressValid && Number(amount) > 0 && !sending);
</script>

<div class="max-w-2xl mx-auto px-4 py-8 space-y-8">

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white flex items-center gap-3">💸 Transferencias</h1>
		<p class="text-gray-400 mt-1">Envía criptomonedas de cuenta a cuenta directamente en la blockchain.</p>
	</div>

	<!-- Red activa -->
	{#if $walletStore.isConnected && currentNetwork}
		<div class="flex items-center gap-2 text-sm bg-gray-800 border border-gray-700 rounded-xl px-4 py-3">
			<span>{currentNetwork.icon}</span>
			<span class="text-gray-400">Red activa:</span>
			<span class="text-white font-medium">{currentNetwork.name}</span>
			<span class="ml-auto text-gray-500 font-mono">Chain {currentNetwork.chainId}</span>
		</div>
	{/if}

	<!-- Formulario -->
	<div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-6 space-y-5">
		<h2 class="text-lg font-semibold text-white">Nueva Transferencia</h2>

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

		<div class="space-y-2">
			<label class="text-sm text-gray-400 font-medium" for="amount">
				Monto ({currentNetwork?.symbol ?? 'ETH'})
			</label>
			<div class="relative">
				<input
					id="amount"
					type="number"
					bind:value={amount}
					placeholder="0.001"
					min="0"
					step="0.0001"
					class="w-full bg-gray-900 border border-gray-600 rounded-xl px-4 py-3 pr-16 text-white
						placeholder-gray-600 focus:outline-none focus:border-emerald-500 transition-colors"
				/>
				<span class="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
					{currentNetwork?.symbol ?? 'ETH'}
				</span>
			</div>
		</div>

		<!-- Resumen previo -->
		{#if addressValid && Number(amount) > 0}
			<div class="bg-gray-900/60 border border-gray-700 rounded-xl p-4 space-y-2 text-sm">
				{#each [
					['De', shortAddr($walletStore.account ?? '')],
					['Para', shortAddr(toAddress)],
					['Monto', `${amount} ${currentNetwork?.symbol ?? 'ETH'}`],
					['Red', currentNetwork?.name ?? '—']
				] as [label, value]}
					<div class="flex justify-between">
						<span class="text-gray-500">{label}:</span>
						<span class="font-mono text-white {label === 'Monto' ? 'text-emerald-400' : ''}">{value}</span>
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
		{:else}
			<button onclick={sendTransaction} disabled={!canSend}
				class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
					text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2">
				{#if sending}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Procesando...
				{:else}
					💸 Enviar Transferencia
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
					{#if currentNetwork?.explorerUrl}
						<a href="{currentNetwork.explorerUrl}/tx/{txHash}" target="_blank" rel="noopener noreferrer"
							class="inline-flex items-center gap-2 text-sm text-emerald-400 hover:text-emerald-300 transition-colors underline">
							🔍 Ver detalle completo en {currentNetwork.name} Explorer →
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
