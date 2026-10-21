<!-- PÁGINA 4: Consulta de Saldo -->
<script lang="ts">
	import { walletStore, connectWallet } from '$lib/stores/wallet';
	import { EVM_NETWORKS, type NetworkConfig } from '$lib/data/networks';
	import { ethers } from 'ethers';

	// ── Estado general ──────────────────────────────────────────────
	let queryAddress = $state('');
	let activeTab = $state<'single' | 'bulk'>('single');

	// ── Consulta por red única ───────────────────────────────────────
	let selectedNetwork = $state<NetworkConfig>(EVM_NETWORKS[0]);
	let singleBalance = $state('');
	let singleLoading = $state(false);
	let singleError = $state('');

	// ── Consulta masiva ──────────────────────────────────────────────
	interface BulkResult {
		network: NetworkConfig;
		balance: string;
		loading: boolean;
		error: string;
	}
	let selectedNetworks = $state<Set<number>>(new Set([1, 137, 56]));
	let bulkResults = $state<BulkResult[]>([]);
	let bulkRunning = $state(false);

	// ── Helpers ──────────────────────────────────────────────────────
	const isValidAddress = (a: string) => /^0x[0-9a-fA-F]{40}$/.test(a);
	const shortAddr = (a: string) => `${a.slice(0, 8)}...${a.slice(-6)}`;

	function targetAddress() {
		return queryAddress.trim() !== '' ? queryAddress.trim() : ($walletStore.account ?? '');
	}

	async function fetchBalance(network: NetworkConfig, address: string): Promise<string> {
		const provider = new ethers.JsonRpcProvider(
			network.rpcUrl,
			network.chainId,
			{ staticNetwork: true }
		);
		const bal = await provider.getBalance(address);
		return parseFloat(ethers.formatEther(bal)).toFixed(6);
	}

	// ── Consulta única ───────────────────────────────────────────────
	async function querySingle() {
		singleError = '';
		singleBalance = '';
		const addr = targetAddress();
		if (!isValidAddress(addr)) { singleError = 'Dirección inválida.'; return; }

		singleLoading = true;
		try {
			singleBalance = await fetchBalance(selectedNetwork, addr);
		} catch (err: unknown) {
			singleError = (err as Error).message ?? 'Error al consultar.';
		} finally {
			singleLoading = false;
		}
	}

	// ── Consulta masiva ──────────────────────────────────────────────
	async function queryBulk() {
		const addr = targetAddress();
		if (!isValidAddress(addr)) { singleError = 'Dirección inválida.'; return; }

		const networksToQuery = EVM_NETWORKS.filter((n) => selectedNetworks.has(n.chainId));
		bulkResults = networksToQuery.map((n) => ({ network: n, balance: '', loading: true, error: '' }));
		bulkRunning = true;

		// Consultas en paralelo
		await Promise.all(
			networksToQuery.map(async (net, i) => {
				try {
					const bal = await fetchBalance(net, addr);
					bulkResults[i] = { ...bulkResults[i], balance: bal, loading: false };
				} catch {
					bulkResults[i] = { ...bulkResults[i], error: 'Error', loading: false };
				}
			})
		);
		bulkRunning = false;
	}

	function toggleNetwork(chainId: number) {
		const s = new Set(selectedNetworks);
		s.has(chainId) ? s.delete(chainId) : s.add(chainId);
		selectedNetworks = s;
	}

	// Auto-fill address when wallet connects
	$effect(() => {
		if ($walletStore.account && queryAddress === '') {
			queryAddress = $walletStore.account;
		}
	});

	let resolvedAddress = $derived(targetAddress());
	let addressOk = $derived(isValidAddress(resolvedAddress));
</script>

<div class="max-w-3xl mx-auto px-4 py-8 space-y-8">

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white flex items-center gap-3">💰 Consulta de Saldo</h1>
		<p class="text-gray-400 mt-1">Consulta el saldo de cualquier dirección Ethereum en una o múltiples redes.</p>
	</div>

	<!-- Dirección a consultar -->
	<div class="bg-gray-800/60 border border-gray-700 rounded-2xl p-5 space-y-4">
		<h2 class="text-sm font-medium text-gray-300 uppercase tracking-wide">Dirección a Consultar</h2>

		<div class="space-y-2">
			<div class="relative">
				<input
					type="text"
					bind:value={queryAddress}
					placeholder="0x742d35Cc6634C0532925a3b8D4C9C... (o vacío para tu wallet)"
					class="w-full bg-gray-900 border rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono text-sm
						focus:outline-none transition-colors pr-24
						{queryAddress.length > 0
							? (isValidAddress(queryAddress) ? 'border-emerald-500' : 'border-red-500')
							: 'border-gray-600'}"
				/>
				{#if $walletStore.isConnected && queryAddress !== $walletStore.account}
					<button
						onclick={() => { queryAddress = $walletStore.account ?? ''; }}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 hover:text-emerald-300
							bg-emerald-900/40 px-2 py-1 rounded transition-colors"
					>
						Mi wallet
					</button>
				{/if}
			</div>

			<!-- Estado del address -->
			<div class="flex items-center justify-between text-xs">
				{#if queryAddress.length > 0 && !isValidAddress(queryAddress)}
					<span class="text-red-400">⚠ Dirección no válida</span>
				{:else if addressOk}
					<span class="text-emerald-400">✓ {shortAddr(resolvedAddress)}</span>
				{:else if !$walletStore.isConnected}
					<span class="text-gray-500">Ingresa una dirección o conecta tu wallet</span>
				{:else}
					<span class="text-gray-500">Se usará tu wallet conectada</span>
				{/if}

				{#if !$walletStore.isConnected}
					<button onclick={connectWallet}
						class="text-emerald-400 hover:text-emerald-300 underline transition-colors">
						Conectar wallet
					</button>
				{/if}
			</div>
		</div>

		<!-- Sin login: puede consultar igual -->
		{#if !$walletStore.isConnected && queryAddress.length === 0}
			<div class="bg-blue-900/20 border border-blue-700/40 rounded-xl p-3 text-blue-300 text-xs">
				💡 <strong>Sin inicio de sesión:</strong> Puedes consultar el saldo de cualquier dirección pública ingresándola manualmente. No necesitas conectar tu wallet.
			</div>
		{/if}
	</div>

	<!-- Tabs -->
	<div class="flex gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
		{#each ([['single', '🔍 Una Red'], ['bulk', '🗂 Múltiples Redes']] as const) as [tab, label]}
			<button
				onclick={() => activeTab = tab}
				class="flex-1 py-2 rounded-lg text-sm font-medium transition-all
					{activeTab === tab ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}"
			>
				{label}
			</button>
		{/each}
	</div>

	<!-- ── TAB: UNA RED ── -->
	{#if activeTab === 'single'}
		<div class="space-y-5">
			<h2 class="text-lg font-semibold text-white">Consulta por Red</h2>

			<!-- Selector de red -->
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
				{#each EVM_NETWORKS as net}
					<button
						onclick={() => { selectedNetwork = net; singleBalance = ''; singleError = ''; }}
						class="flex items-center gap-2 p-3 rounded-xl border text-left transition-all
							{selectedNetwork.chainId === net.chainId
								? 'border-emerald-500 bg-emerald-900/20 text-white'
								: 'border-gray-700 bg-gray-800/40 text-gray-400 hover:border-gray-500 hover:text-white'}"
					>
						<span class="text-lg">{net.icon}</span>
						<div class="min-w-0">
							<p class="text-xs font-medium truncate">{net.symbol}</p>
							<p class="text-xs text-gray-500 truncate">{net.name.split(' ')[0]}</p>
						</div>
					</button>
				{/each}
			</div>

			<!-- Red seleccionada info -->
			<div class="bg-gray-800/40 border border-gray-700 rounded-xl px-4 py-3 flex items-center gap-3">
				<span class="text-2xl">{selectedNetwork.icon}</span>
				<div>
					<p class="text-white font-medium">{selectedNetwork.name}</p>
					<p class="text-gray-500 text-xs">{selectedNetwork.symbol} · Chain {selectedNetwork.chainId}</p>
				</div>
			</div>

			{#if singleError}
				<div class="bg-red-900/30 border border-red-700/50 rounded-xl p-3 text-red-300 text-sm">⚠ {singleError}</div>
			{/if}

			<button
				onclick={querySingle}
				disabled={singleLoading || !addressOk}
				class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
					text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
			>
				{#if singleLoading}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Consultando...
				{:else}
					🔍 Consultar Saldo
				{/if}
			</button>

			<!-- Resultado -->
			{#if singleBalance !== ''}
				<div class="bg-gradient-to-br from-gray-800 to-gray-800/50 border border-emerald-700/50 rounded-2xl p-6 text-center space-y-2">
					<p class="text-gray-400 text-sm">Saldo de {shortAddr(resolvedAddress)} en {selectedNetwork.name}</p>
					<p class="text-4xl font-bold text-emerald-400">{singleBalance}</p>
					<p class="text-gray-300 text-xl font-medium">{selectedNetwork.symbol}</p>
					<a
						href="{selectedNetwork.explorerUrl}/address/{resolvedAddress}"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-block mt-2 text-sm text-gray-500 hover:text-emerald-400 underline transition-colors"
					>
						Ver en Explorer →
					</a>
				</div>
			{/if}
		</div>
	{/if}

	<!-- ── TAB: MÚLTIPLES REDES ── -->
	{#if activeTab === 'bulk'}
		<div class="space-y-5">
			<div class="flex items-center justify-between">
				<h2 class="text-lg font-semibold text-white">Consulta Masiva de Saldo</h2>
				<span class="text-sm text-gray-400">{selectedNetworks.size} red{selectedNetworks.size !== 1 ? 'es' : ''} seleccionada{selectedNetworks.size !== 1 ? 's' : ''}</span>
			</div>

			<!-- Selección de redes -->
			<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
				{#each EVM_NETWORKS as net}
					{@const checked = selectedNetworks.has(net.chainId)}
					<button
						onclick={() => toggleNetwork(net.chainId)}
						class="flex items-center gap-2 p-3 rounded-xl border text-left transition-all
							{checked ? 'border-emerald-500 bg-emerald-900/20' : 'border-gray-700 bg-gray-800/40 hover:border-gray-500'}"
					>
						<div class="w-4 h-4 rounded border flex items-center justify-center flex-shrink-0
							{checked ? 'bg-emerald-500 border-emerald-500' : 'border-gray-500'}">
							{#if checked}<span class="text-white text-xs leading-none">✓</span>{/if}
						</div>
						<span class="text-lg">{net.icon}</span>
						<div class="min-w-0">
							<p class="text-xs font-medium truncate {checked ? 'text-white' : 'text-gray-400'}">{net.symbol}</p>
							<p class="text-xs text-gray-600 truncate">{net.name.split(' ')[0]}</p>
						</div>
					</button>
				{/each}
			</div>

			<!-- Acciones rápidas -->
			<div class="flex gap-2">
				<button onclick={() => selectedNetworks = new Set(EVM_NETWORKS.map(n => n.chainId))}
					class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
					Seleccionar todo
				</button>
				<button onclick={() => selectedNetworks = new Set()}
					class="text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 px-3 py-1.5 rounded-lg transition-colors">
					Limpiar
				</button>
			</div>

			<button
				onclick={queryBulk}
				disabled={bulkRunning || !addressOk || selectedNetworks.size === 0}
				class="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed
					text-white font-semibold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2"
			>
				{#if bulkRunning}
					<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
					Consultando {selectedNetworks.size} redes...
				{:else}
					🗂 Consultar en {selectedNetworks.size} Redes
				{/if}
			</button>

			<!-- Resultados masivos -->
			{#if bulkResults.length > 0}
				<div class="space-y-3">
					<h3 class="text-sm font-medium text-gray-400">Resultados para {shortAddr(resolvedAddress)}</h3>
					{#each bulkResults as result}
						<div class="flex items-center gap-4 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4">
							<span class="text-2xl">{result.network.icon}</span>
							<div class="flex-1 min-w-0">
								<p class="text-white font-medium text-sm">{result.network.name}</p>
								<p class="text-gray-500 text-xs">{result.network.symbol}</p>
							</div>
							<div class="text-right">
								{#if result.loading}
									<span class="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin inline-block"></span>
								{:else if result.error}
									<span class="text-red-400 text-sm">Error</span>
								{:else}
									<p class="text-emerald-400 font-bold">{result.balance}</p>
									<p class="text-gray-500 text-xs">{result.network.symbol}</p>
								{/if}
							</div>
							{#if !result.loading && !result.error}
								<a
									href="{result.network.explorerUrl}/address/{resolvedAddress}"
									target="_blank"
									rel="noopener noreferrer"
									class="text-gray-600 hover:text-emerald-400 transition-colors text-xs"
								>
									Ver →
								</a>
							{/if}
						</div>
					{/each}

					<!-- Total estimado (en redes con resultado) -->
					{#if !bulkRunning}
						{@const withBalance = bulkResults.filter(r => !r.loading && !r.error && parseFloat(r.balance) > 0)}
						{#if withBalance.length > 0}
							<div class="bg-gray-800 border border-gray-600 rounded-xl p-4">
								<p class="text-xs text-gray-500 mb-2">Redes con saldo > 0</p>
								{#each withBalance as r}
									<div class="flex items-center justify-between text-sm">
										<span class="text-gray-300">{r.network.icon} {r.network.name}</span>
										<span class="text-emerald-400 font-semibold">{r.balance} {r.network.symbol}</span>
									</div>
								{/each}
							</div>
						{/if}
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>
