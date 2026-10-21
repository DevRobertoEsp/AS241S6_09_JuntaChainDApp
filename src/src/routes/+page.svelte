<!-- PÁGINA DE INICIO — Introducción al Proyecto JuntaChain -->
<script lang="ts">
	import { walletStore, connectWallet } from '$lib/stores/wallet';

	const objetivos = [
		'Digitalizar y descentralizar las juntas de ahorro tradicionales mediante tecnología blockchain.',
		'Eliminar la necesidad de un intermediario de confianza usando Smart Contracts auditables.',
		'Garantizar transparencia total en el registro de pagos y distribución de fondos.',
		'Reducir el riesgo de fraude o incumplimiento mediante contratos autoejecutables.',
		'Fomentar la inclusión financiera en comunidades sin acceso a servicios bancarios.'
	];

	const beneficios = [
		{ icon: '🔒', titulo: 'Seguridad Máxima', desc: 'Fondos protegidos por Smart Contracts inmutables en la blockchain de Polygon.' },
		{ icon: '👁️', titulo: 'Transparencia Total', desc: 'Todos los pagos y rondas son visibles públicamente en la cadena de bloques.' },
		{ icon: '⚡', titulo: 'Pagos Instantáneos', desc: 'Las transferencias se ejecutan automáticamente sin bancos ni intermediarios.' },
		{ icon: '🌍', titulo: 'Acceso Global', desc: 'Participa desde cualquier parte del mundo con solo una wallet Web3.' },
		{ icon: '📊', titulo: 'Reputación On-Chain', desc: 'Tu historial de pagos construye un score crediticio descentralizado y verificable.' },
		{ icon: '💱', titulo: 'Multi-Red', desc: 'Compatible con múltiples redes EVM: Polygon, Ethereum, BNB Chain y más.' }
	];

	const caracteristicas = [
		{ icon: '💸', titulo: 'Transferencias P2P', desc: 'Envía fondos directamente de cuenta a cuenta con captura del hash de transacción.' },
		{ icon: '🌐', titulo: 'Cambio de Red', desc: 'Selecciona entre redes EVM y UTXO. Si la red no existe, se añade automáticamente a MetaMask.' },
		{ icon: '🔍', titulo: 'Consulta de Saldo', desc: 'Consulta el saldo de cualquier address con o sin inicio de sesión, en una o múltiples redes.' },
		{ icon: '🪙', titulo: 'Juntas Blockchain', desc: 'Crea o únete a juntas de ahorro gestionadas por Smart Contracts seguros y auditados.' },
		{ icon: '🏆', titulo: 'Trust Score', desc: 'Sistema de reputación on-chain que crece con cada pago puntual que realizas.' },
		{ icon: '📱', titulo: 'Mobile First', desc: 'Diseño responsivo optimizado para dispositivos móviles con experiencia nativa Web3.' }
	];

	const tecnologias = ['Svelte 5', 'SvelteKit', 'TypeScript', 'Ethers.js v6', 'Tailwind CSS', 'Polygon', 'MetaMask'];
</script>

<div class="max-w-5xl mx-auto px-4 py-8 space-y-20">

	<!-- ────────────────── HERO ────────────────── -->
	<section class="text-center space-y-6 py-10">
		<div class="inline-flex items-center gap-2 bg-emerald-900/40 border border-emerald-700/50 text-emerald-400 text-sm px-4 py-1.5 rounded-full">
			<span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
			Proyecto Blockchain — Innovación Web3
		</div>

		<h1 class="text-5xl md:text-6xl font-extrabold leading-tight">
			<span class="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
				JuntaChain
			</span>
		</h1>

		<p class="text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
			La primera plataforma descentralizada para <strong class="text-white">juntas de ahorro</strong>
			impulsada por <strong class="text-emerald-400">Smart Contracts</strong> en la blockchain de Polygon.
		</p>

		<div class="flex flex-wrap justify-center gap-3 pt-2">
			{#each tecnologias as tech}
				<span class="text-xs bg-gray-800 border border-gray-700 text-gray-300 px-3 py-1 rounded-full">{tech}</span>
			{/each}
		</div>

		{#if !$walletStore.isConnected}
			<button
				onclick={connectWallet}
				class="mt-4 inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/50 text-lg"
			>
				🔗 Conectar MetaMask
			</button>
		{:else}
			<div class="inline-flex items-center gap-2 bg-emerald-900/30 border border-emerald-700 text-emerald-400 px-6 py-3 rounded-xl">
				✅ Wallet Conectada — ¡Bienvenido a JuntaChain!
			</div>
		{/if}
	</section>

	<!-- ────────────────── DESCRIPCIÓN ────────────────── -->
	<section id="descripcion" class="space-y-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">📋</span>
			<h2 class="text-3xl font-bold text-white">Descripción del Proyecto</h2>
		</div>
		<div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 md:p-8 space-y-4 text-gray-300 leading-relaxed">
			<p>
				<strong class="text-white">JuntaChain</strong> es una DApp (Aplicación Descentralizada) construida sobre la blockchain de
				<strong class="text-purple-400">Polygon</strong>, diseñada para digitalizar y potenciar las
				<em>juntas de ahorro</em>, un sistema financiero colectivo ampliamente utilizado en América Latina y otras partes del mundo.
			</p>
			<p>
				En una junta tradicional, un grupo de personas aporta una cuota periódica y cada ronda uno de los participantes recibe el pozo acumulado. Sin embargo, este sistema depende de la <strong class="text-white">confianza en un organizador central</strong>, lo que genera riesgos de fraude e incumplimiento.
			</p>
			<p>
				JuntaChain reemplaza al intermediario con <strong class="text-emerald-400">Smart Contracts auditables</strong>: el código es la ley. Las reglas se definen al crear la junta y se ejecutan automáticamente, sin que ninguna parte pueda alterarlas. Cada transacción queda registrada permanentemente en la cadena de bloques.
			</p>
			<p>
				La plataforma integra un sistema de <strong class="text-cyan-400">reputación on-chain</strong> (Trust Score) que permite a los usuarios construir historial crediticio descentralizado basado en su comportamiento de pago real.
			</p>
		</div>
	</section>

	<!-- ────────────────── OBJETIVOS ────────────────── -->
	<section id="objetivos" class="space-y-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">🎯</span>
			<h2 class="text-3xl font-bold text-white">Objetivos</h2>
		</div>
		<div class="space-y-3">
			{#each objetivos as obj, i}
				<div class="flex items-start gap-4 bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:border-emerald-700/50 transition-colors">
					<span class="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
						{i + 1}
					</span>
					<p class="text-gray-300 leading-relaxed">{obj}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ────────────────── BENEFICIOS ────────────────── -->
	<section id="beneficios" class="space-y-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">✨</span>
			<h2 class="text-3xl font-bold text-white">Beneficios</h2>
		</div>
		<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
			{#each beneficios as ben}
				<div class="bg-gray-800/50 border border-gray-700 rounded-2xl p-5 hover:border-emerald-600/50 hover:-translate-y-0.5 transition-all duration-200 group">
					<div class="text-4xl mb-3">{ben.icon}</div>
					<h3 class="text-white font-semibold text-lg mb-2 group-hover:text-emerald-400 transition-colors">{ben.titulo}</h3>
					<p class="text-gray-400 text-sm leading-relaxed">{ben.desc}</p>
				</div>
			{/each}
		</div>
	</section>

	<!-- ────────────────── CARACTERÍSTICAS ────────────────── -->
	<section id="caracteristicas" class="space-y-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">⚙️</span>
			<h2 class="text-3xl font-bold text-white">Características de la DApp</h2>
		</div>
		<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
			{#each caracteristicas as car}
				<div class="flex items-start gap-4 bg-gray-800/40 border border-gray-700/50 rounded-xl p-5 hover:bg-gray-800/70 transition-all">
					<span class="text-3xl flex-shrink-0">{car.icon}</span>
					<div>
						<h3 class="text-white font-semibold mb-1">{car.titulo}</h3>
						<p class="text-gray-400 text-sm leading-relaxed">{car.desc}</p>
					</div>
				</div>
			{/each}
		</div>
	</section>

	<!-- ────────────────── DESARROLLADOR ────────────────── -->
	<section id="desarrollador" class="space-y-6">
		<div class="flex items-center gap-3">
			<span class="text-3xl">👨‍💻</span>
			<h2 class="text-3xl font-bold text-white">Desarrollador</h2>
		</div>
		<div class="bg-gradient-to-br from-gray-800/70 via-gray-800/50 to-emerald-900/20 border border-gray-700 rounded-2xl p-6 md:p-10">
			<div class="flex flex-col md:flex-row items-center md:items-start gap-8">
				<!-- Foto del desarrollador -->
				<div class="flex-shrink-0 relative">
					<div class="w-36 h-36 rounded-full overflow-hidden ring-4 ring-emerald-500/50 shadow-2xl shadow-emerald-900/50">
						<img
							src="/developer.jpg"
							alt="Roberto Espinoza"
							class="w-full h-full object-cover"
							onerror={(e) => {
								const target = e.currentTarget as HTMLElement;
								target.style.display = 'none';
								if (target.nextElementSibling) {
									(target.nextElementSibling as HTMLElement).style.display = 'flex';
								}
							}}
						/>
						<div class="hidden w-full h-full bg-gradient-to-br from-emerald-600 to-cyan-600 items-center justify-center text-5xl">
							👤
						</div>
					</div>
					<div class="absolute -bottom-1 -right-1 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-sm border-2 border-gray-900">
						✅
					</div>
				</div>

				<!-- Info -->
				<div class="flex-1 text-center md:text-left space-y-4">
					<div>
						<h3 class="text-2xl font-bold text-white">Roberto Espinoza</h3>
						<p class="text-emerald-400 font-medium">Desarrollador Blockchain & Web3</p>
						<p class="text-gray-500 text-sm mt-1">Estudiante — Valle Grande Instituto Tecnológico</p>
					</div>

					<p class="text-gray-300 leading-relaxed max-w-lg">
						Apasionado por la tecnología blockchain y el desarrollo de aplicaciones descentralizadas.
						Especializado en Svelte, TypeScript y Solidity para la construcción de DApps modernas
						que resuelven problemas reales de inclusión financiera.
					</p>

					<div class="flex flex-wrap justify-center md:justify-start gap-2">
						{#each ['Svelte', 'TypeScript', 'Ethers.js', 'Solidity', 'Polygon', 'Web3'] as skill}
							<span class="text-xs bg-emerald-900/50 text-emerald-300 border border-emerald-700/50 px-3 py-1 rounded-full">
								{skill}
							</span>
						{/each}
					</div>

					<div class="flex flex-wrap justify-center md:justify-start gap-3 pt-2">
						<a href="https://github.com" target="_blank" rel="noopener noreferrer"
							class="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all">
							GitHub
						</a>
						<a href="https://linkedin.com" target="_blank" rel="noopener noreferrer"
							class="flex items-center gap-2 text-sm text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-lg transition-all">
							LinkedIn
						</a>
					</div>
				</div>

				<!-- Stats -->
				<div class="flex-shrink-0 grid grid-cols-2 gap-3 md:min-w-[180px]">
					{#each [
						{ label: 'Trust Score', value: '98/100', color: 'text-emerald-400' },
						{ label: 'Juntas', value: '4 ✅', color: 'text-cyan-400' },
						{ label: 'Cuotas', value: '24/24', color: 'text-purple-400' },
						{ label: 'Nivel', value: '🥇 Oro', color: 'text-yellow-400' }
					] as stat}
						<div class="bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-center">
							<p class="text-xs text-gray-500 mb-1">{stat.label}</p>
							<p class="font-bold {stat.color}">{stat.value}</p>
						</div>
					{/each}
				</div>
			</div>
		</div>
	</section>

	<!-- ────────────────── CTA NAVEGACIÓN ────────────────── -->
	<section class="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-8">
		{#each [
			{ href: '/transacciones', icon: '💸', label: 'Transferencias', desc: 'Envía ETH/MATIC entre cuentas' },
			{ href: '/redes', icon: '🌐', label: 'Cambiar Red', desc: 'EVM y UTXO Networks' },
			{ href: '/saldo', icon: '💰', label: 'Consultar Saldo', desc: 'Balance por address y red' }
		] as card}
			<a
				href={card.href}
				class="group bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700 hover:border-emerald-600/50
					rounded-2xl p-6 text-center transition-all hover:-translate-y-1 duration-200"
			>
				<span class="text-4xl block mb-3">{card.icon}</span>
				<h3 class="text-white font-semibold text-lg group-hover:text-emerald-400 transition-colors">{card.label}</h3>
				<p class="text-gray-400 text-sm mt-1">{card.desc}</p>
			</a>
		{/each}
	</section>
</div>
