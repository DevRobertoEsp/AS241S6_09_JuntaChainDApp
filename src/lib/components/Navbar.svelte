<script lang="ts">
	import { walletStore, shortAddress, connectWallet, disconnectWallet } from '$lib/stores/wallet';
	import { getNetworkByChainId } from '$lib/data/networks';
	import { page } from '$app/state';

	const navLinks = [
		{ href: '/', label: 'Inicio', icon: '🏠' },
		{ href: '/transacciones', label: 'Transferir', icon: '💸' },
		{ href: '/redes', label: 'Redes', icon: '🌐' },
		{ href: '/saldo', label: 'Saldo', icon: '💰' }
	];

	let currentNetwork = $derived(
		$walletStore.chainId ? getNetworkByChainId($walletStore.chainId) : null
	);
</script>

<nav class="fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-700 shadow-lg">
	<div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
		<!-- Logo -->
		<a href="/" class="flex items-center gap-2 text-white font-bold text-xl">
			<span class="text-2xl">⛓️</span>
			<span class="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">JuntaChain</span>
		</a>

		<!-- Nav Links -->
		<div class="hidden md:flex items-center gap-1">
			{#each navLinks as link}
				<a
					href={link.href}
					class="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-all
						{page.url.pathname === link.href
							? 'bg-emerald-600 text-white'
							: 'text-gray-300 hover:bg-gray-700 hover:text-white'}"
				>
					<span>{link.icon}</span>
					{link.label}
				</a>
			{/each}
		</div>

		<!-- Wallet -->
		<div class="flex items-center gap-2">
			{#if $walletStore.isConnected}
				<div class="flex items-center gap-2">
					{#if currentNetwork}
						<span class="hidden sm:flex items-center gap-1 text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded-full">
							<span>{currentNetwork.icon}</span>
							{currentNetwork.name}
						</span>
					{/if}
					<span class="text-xs bg-emerald-900 text-emerald-300 px-3 py-1.5 rounded-full font-mono border border-emerald-700">
						{$shortAddress}
					</span>
					<button
						onclick={disconnectWallet}
						class="text-xs text-gray-400 hover:text-red-400 transition-colors px-2 py-1 rounded hover:bg-gray-700"
					>
						✕
					</button>
				</div>
			{:else}
				<button
					onclick={connectWallet}
					disabled={$walletStore.isConnecting}
					class="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50
						text-white text-sm font-medium px-4 py-2 rounded-lg transition-all"
				>
					{#if $walletStore.isConnecting}
						<span class="animate-spin">⟳</span> Conectando...
					{:else}
						🔗 Conectar Wallet
					{/if}
				</button>
			{/if}
		</div>
	</div>

	<!-- Mobile bottom nav -->
	<div class="md:hidden fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-700 flex">
		{#each navLinks as link}
			<a
				href={link.href}
				class="flex-1 flex flex-col items-center gap-0.5 py-2 text-xs transition-colors
					{page.url.pathname === link.href ? 'text-emerald-400' : 'text-gray-400 hover:text-white'}"
			>
				<span class="text-lg">{link.icon}</span>
				{link.label}
			</a>
		{/each}
	</div>
</nav>
