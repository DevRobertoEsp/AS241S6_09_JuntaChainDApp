<!-- PÁGINA 3: Cambio de Red (EVM + UTXO) -->
<script lang="ts">
	import { walletStore, connectWallet } from '$lib/stores/wallet';
	import { EVM_NETWORKS, UTXO_NETWORKS, switchOrAddNetwork, getNetworkByChainId, type NetworkConfig } from '$lib/data/networks';

	let switching = $state(false);
	let switchingChain = $state<number | null>(null);
	let successMsg = $state('');
	let errorMsg = $state('');
	let activeTab = $state<'EVM' | 'UTXO'>('EVM');

	let currentNetwork = $derived(
		$walletStore.chainId ? getNetworkByChainId($walletStore.chainId) : null
	);

	async function handleSwitch(network: NetworkConfig) {
		errorMsg = '';
		successMsg = '';

		if (network.type === 'UTXO') {
			errorMsg = `Las redes UTXO (${network.name}) no son compatibles con MetaMask. Utiliza una wallet UTXO nativa como Electrum o Trust Wallet.`;
			return;
		}
		if (!$walletStore.isConnected) {
			errorMsg = 'Conecta tu wallet primero.';
			return;
		}

		switching = true;
		switchingChain = network.chainId;
		try {
			await switchOrAddNetwork(network);
			successMsg = `✅ Red cambiada a ${network.name}`;
		} catch (err: unknown) {
			const e = err as { code?: number; message?: string };
			if (e.code === 4001) errorMsg = 'Cambio de red rechazado por el usuario.';
			else errorMsg = e.message ?? 'Error al cambiar la red.';
		} finally {
			switching = false;
			switchingChain = null;
		}
	}

	function isActive(network: NetworkConfig) {
		return network.type === 'EVM' && $walletStore.chainId === network.chainId;
	}
</script>

<div class="max-w-3xl mx-auto px-4 py-8 space-y-8">

	<!-- Header -->
	<div>
		<h1 class="text-3xl font-bold text-white flex items-center gap-3">🌐 Cambio de Red</h1>
		<p class="text-gray-400 mt-1">Selecciona la red blockchain. Si no existe en tu wallet, se añade automáticamente.</p>
	</div>

	<!-- Red actual -->
	{#if $walletStore.isConnected}
		<div class="bg-gray-800 border border-gray-700 rounded-2xl p-4 flex items-center gap-4">
			<div class="w-10 h-10 rounded-full flex items-center justify-center text-2xl"
				style="background-color: {currentNetwork?.color ?? '#374151'}22">
				{currentNetwork?.icon ?? '❓'}
			</div>
			<div>
				<p class="text-xs text-gray-500">Red Activa</p>
				<p class="text-white font-semibold">{currentNetwork?.name ?? `Chain ID ${$walletStore.chainId}`}</p>
				{#if currentNetwork}
					<p class="text-xs text-gray-500">{currentNetwork.symbol} · Chain {currentNetwork.chainId} · {currentNetwork.type}</p>
				{/if}
			</div>
			<div class="ml-auto">
				<span class="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-900/30 border border-emerald-700/50 px-3 py-1 rounded-full">
					<span class="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></span>
					Conectada
				</span>
			</div>
		</div>
	{/if}

	<!-- Mensajes -->
	{#if successMsg}
		<div class="bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-emerald-300 text-sm">{successMsg}</div>
	{/if}
	{#if errorMsg}
		<div class="bg-red-900/30 border border-red-700 rounded-xl p-4 text-red-300 text-sm">⚠ {errorMsg}</div>
	{/if}

	<!-- Tabs -->
	<div class="flex gap-2 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
		{#each (['EVM', 'UTXO'] as const) as tab}
			<button
				onclick={() => { activeTab = tab; errorMsg = ''; successMsg = ''; }}
				class="flex-1 py-2 rounded-lg text-sm font-medium transition-all
					{activeTab === tab ? 'bg-gray-700 text-white shadow' : 'text-gray-400 hover:text-white'}"
			>
				{tab === 'EVM' ? '⛓ EVM Networks' : '₿ UTXO Networks'}
			</button>
		{/each}
	</div>

	<!-- Info UTXO -->
	{#if activeTab === 'UTXO'}
		<div class="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-4 text-yellow-300 text-sm space-y-1">
			<p class="font-medium">ℹ️ Sobre las redes UTXO</p>
			<p class="text-yellow-400/80">Las redes UTXO (Bitcoin, Litecoin, Dogecoin) usan un modelo diferente al de Ethereum. <strong>No son compatibles con MetaMask</strong>, que solo soporta redes EVM. Para operarlas necesitas wallets nativas como Electrum (BTC) o Trust Wallet.</p>
		</div>
	{/if}

	<!-- Lista de redes EVM -->
	{#if activeTab === 'EVM'}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each EVM_NETWORKS as network}
				{@const active = isActive(network)}
				{@const isLoading = switching && switchingChain === network.chainId}
				<button
					onclick={() => handleSwitch(network)}
					disabled={switching || active}
					class="text-left bg-gray-800/50 border rounded-2xl p-4 transition-all duration-200 group
						{active ? 'border-emerald-500 bg-emerald-900/20 cursor-default' :
						 'border-gray-700 hover:border-gray-500 hover:bg-gray-700/50 disabled:opacity-60 disabled:cursor-not-allowed'}"
				>
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl flex-shrink-0"
							style="background-color: {network.color}22; border: 1px solid {network.color}44">
							{network.icon}
						</div>
						<div class="flex-1 min-w-0">
							<p class="text-white font-medium truncate group-hover:text-emerald-300 transition-colors
								{active ? 'text-emerald-300' : ''}">
								{network.name}
							</p>
							<p class="text-gray-500 text-xs">{network.symbol} · Chain {network.chainId}</p>
						</div>
						{#if active}
							<span class="flex-shrink-0 w-2 h-2 bg-emerald-400 rounded-full"></span>
						{/if}
					</div>

					<div class="flex items-center justify-between">
						<span class="text-xs px-2 py-0.5 rounded-full
							{network.name.includes('Testnet') ? 'bg-yellow-900/40 text-yellow-400 border border-yellow-700/50' :
							 'bg-blue-900/40 text-blue-400 border border-blue-700/50'}">
							{network.name.includes('Testnet') ? 'Testnet' : 'Mainnet'}
						</span>

						{#if isLoading}
							<span class="w-4 h-4 border-2 border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin"></span>
						{:else if active}
							<span class="text-xs text-emerald-400 font-medium">Activa ✓</span>
						{:else}
							<span class="text-xs text-gray-500 group-hover:text-emerald-400 transition-colors">
								{$walletStore.isConnected ? 'Cambiar →' : 'Conecta wallet'}
							</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Lista de redes UTXO -->
	{#if activeTab === 'UTXO'}
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
			{#each UTXO_NETWORKS as network}
				<div class="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-4 opacity-80">
					<div class="flex items-center gap-3 mb-3">
						<div class="w-10 h-10 rounded-full flex items-center justify-center text-xl"
							style="background-color: {network.color}22; border: 1px solid {network.color}44">
							{network.icon}
						</div>
						<div>
							<p class="text-white font-medium">{network.name}</p>
							<p class="text-gray-500 text-xs">{network.symbol} · Modelo UTXO</p>
						</div>
					</div>
					<div class="flex items-center justify-between">
						<span class="text-xs text-gray-500 bg-gray-700/50 px-2 py-0.5 rounded-full">UTXO</span>
						<a href={network.explorerUrl} target="_blank" rel="noopener noreferrer"
							class="text-xs text-gray-500 hover:text-white transition-colors">
							Explorer →
						</a>
					</div>
					<p class="text-xs text-gray-600 mt-2">No compatible con MetaMask EVM</p>
				</div>
			{/each}
		</div>
	{/if}

	<!-- Sin wallet -->
	{#if !$walletStore.isConnected}
		<div class="bg-gray-800/40 border border-gray-700 rounded-2xl p-6 text-center space-y-3">
			<p class="text-gray-400 text-sm">Conecta tu wallet para cambiar de red</p>
			<button onclick={connectWallet}
				class="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-xl transition-all">
				🔗 Conectar Wallet
			</button>
		</div>
	{/if}

	<!-- Nota auto-add -->
	<div class="bg-gray-800/30 border border-gray-700/50 rounded-xl p-4 text-sm text-gray-400 space-y-1">
		<p class="font-medium text-gray-300">ℹ️ Auto-añadir redes</p>
		<p>Si la red seleccionada no existe en tu MetaMask, la DApp la añade automáticamente usando <code class="text-emerald-400 bg-gray-900 px-1 rounded">wallet_addEthereumChain</code>. Solo debes confirmar en MetaMask.</p>
	</div>
</div>
