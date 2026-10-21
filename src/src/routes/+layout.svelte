<script lang="ts">
	import './layout.css';
	import Navbar from '$lib/components/Navbar.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>JuntaChain DApp</title>
	<meta name="description" content="DApp Blockchain para juntas de ahorro descentralizadas" />
</svelte:head>

<Navbar />

<main class="pt-16 pb-16 md:pb-0 min-h-screen bg-gray-950 text-white">
	{@render children()}
</main>
