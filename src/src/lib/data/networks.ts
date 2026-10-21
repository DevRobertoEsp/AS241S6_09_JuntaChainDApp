export interface NetworkConfig {
	chainId: number;
	chainIdHex: string;
	name: string;
	symbol: string;
	decimals: number;
	rpcUrl: string;
	explorerUrl: string;
	type: 'EVM' | 'UTXO';
	icon: string;
	color: string;
}

export const EVM_NETWORKS: NetworkConfig[] = [
	{
		chainId: 1,
		chainIdHex: '0x1',
		name: 'Ethereum Mainnet',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://cloudflare-eth.com',
		explorerUrl: 'https://etherscan.io',
		type: 'EVM',
		icon: '🔷',
		color: '#627EEA'
	},
	{
		chainId: 137,
		chainIdHex: '0x89',
		name: 'Polygon Mainnet',
		symbol: 'POL',
		decimals: 18,
		rpcUrl: 'https://polygon-bor-rpc.publicnode.com',
		explorerUrl: 'https://polygonscan.com',
		type: 'EVM',
		icon: '🟣',
		color: '#8247E5'
	},
	{
		chainId: 56,
		chainIdHex: '0x38',
		name: 'BNB Smart Chain',
		symbol: 'BNB',
		decimals: 18,
		rpcUrl: 'https://bsc-dataseed.binance.org',
		explorerUrl: 'https://bscscan.com',
		type: 'EVM',
		icon: '🟡',
		color: '#F0B90B'
	},
	{
		chainId: 42161,
		chainIdHex: '0xA4B1',
		name: 'Arbitrum One',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://arb1.arbitrum.io/rpc',
		explorerUrl: 'https://arbiscan.io',
		type: 'EVM',
		icon: '💙',
		color: '#28A0F0'
	},
	{
		chainId: 10,
		chainIdHex: '0xA',
		name: 'OP Mainnet',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://mainnet.optimism.io',
		explorerUrl: 'https://optimistic.etherscan.io',
		type: 'EVM',
		icon: '🔴',
		color: '#FF0420'
	},
	{
		chainId: 8453,
		chainIdHex: '0x2105',
		name: 'Base Mainnet',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://mainnet.base.org',
		explorerUrl: 'https://basescan.org',
		type: 'EVM',
		icon: '🔵',
		color: '#0052FF'
	},
	{
		chainId: 43114,
		chainIdHex: '0xA86A',
		name: 'Avalanche C-Chain',
		symbol: 'AVAX',
		decimals: 18,
		rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
		explorerUrl: 'https://snowtrace.io',
		type: 'EVM',
		icon: '🔺',
		color: '#E84142'
	},
	{
		chainId: 250,
		chainIdHex: '0xFA',
		name: 'Fantom Opera',
		symbol: 'FTM',
		decimals: 18,
		rpcUrl: 'https://rpc.ankr.com/fantom',
		explorerUrl: 'https://ftmscan.com',
		type: 'EVM',
		icon: '👻',
		color: '#1969FF'
	},
	{
		chainId: 11155111,
		chainIdHex: '0xAA36A7',
		name: 'Sepolia Testnet',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://ethereum-sepolia-rpc.publicnode.com',
		explorerUrl: 'https://sepolia.etherscan.io',
		type: 'EVM',
		icon: '🧪',
		color: '#627EEA'
	},
	{
		chainId: 80002,
		chainIdHex: '0x13882',
		name: 'Polygon Amoy Testnet',
		symbol: 'MATIC',
		decimals: 18,
		rpcUrl: 'https://polygon-amoy-bor-rpc.publicnode.com',
		explorerUrl: 'https://amoy.polygonscan.com',
		type: 'EVM',
		icon: '🧪',
		color: '#8247E5'
	},
	{
		chainId: 84532,
		chainIdHex: '0x14A34',
		name: 'Base Sepolia Testnet',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'https://sepolia.base.org',
		explorerUrl: 'https://sepolia.basescan.org',
		type: 'EVM',
		icon: '🧪',
		color: '#0052FF'
	},
	{
		chainId: 97,
		chainIdHex: '0x61',
		name: 'BNB Smart Chain Testnet',
		symbol: 'tBNB',
		decimals: 18,
		rpcUrl: 'https://data-seed-prebsc-1-s1.binance.org:8545',
		explorerUrl: 'https://testnet.bscscan.com',
		type: 'EVM',
		icon: '🧪',
		color: '#F0B90B'
	},
	{
		chainId: 31337,
		chainIdHex: '0x7A69',
		name: 'Localhost / Hardhat',
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: 'http://127.0.0.1:8545',
		explorerUrl: '',
		type: 'EVM',
		icon: '💻',
		color: '#10B981'
	}
];

export const UTXO_NETWORKS: NetworkConfig[] = [
	{
		chainId: 0,
		chainIdHex: '0x0',
		name: 'Bitcoin',
		symbol: 'BTC',
		decimals: 8,
		rpcUrl: 'https://blockstream.info/api',
		explorerUrl: 'https://blockstream.info',
		type: 'UTXO',
		icon: '🟠',
		color: '#F7931A'
	},
	{
		chainId: 0,
		chainIdHex: '0x0',
		name: 'Litecoin',
		symbol: 'LTC',
		decimals: 8,
		rpcUrl: 'https://api.blockcypher.com/v1/ltc/main',
		explorerUrl: 'https://live.blockcypher.com/ltc',
		type: 'UTXO',
		icon: '⚫',
		color: '#A6A9AA'
	},
	{
		chainId: 0,
		chainIdHex: '0x0',
		name: 'Dogecoin',
		symbol: 'DOGE',
		decimals: 8,
		rpcUrl: 'https://api.blockcypher.com/v1/doge/main',
		explorerUrl: 'https://live.blockcypher.com/doge',
		type: 'UTXO',
		icon: '🐕',
		color: '#C2A633'
	}
];

export async function switchOrAddNetwork(network: NetworkConfig): Promise<void> {
	if (!window.ethereum) throw new Error('MetaMask no encontrado');
	if (network.type === 'UTXO') throw new Error('Las redes UTXO no son compatibles con MetaMask EVM');

	try {
		await window.ethereum.request({
			method: 'wallet_switchEthereumChain',
			params: [{ chainId: network.chainIdHex }]
		});
	} catch (switchError: unknown) {
		// Error 4902 = la red no existe en MetaMask, la añadimos automáticamente
		const err = switchError as { code: number };
		if (err.code === 4902) {
			await window.ethereum.request({
				method: 'wallet_addEthereumChain',
				params: [
					{
						chainId: network.chainIdHex,
						chainName: network.name,
						nativeCurrency: {
							name: network.symbol,
							symbol: network.symbol,
							decimals: network.decimals
						},
						rpcUrls: [network.rpcUrl],
						blockExplorerUrls: network.explorerUrl ? [network.explorerUrl] : []
					}
				]
			});
		} else {
			throw switchError;
		}
	}
}

export function getNetworkByChainId(chainId: number): NetworkConfig {
	const found = EVM_NETWORKS.find((n) => n.chainId === chainId);
	if (found) return found;

	// Fallback para cualquier red personalizada conectada en el wallet
	return {
		chainId,
		chainIdHex: `0x${chainId.toString(16)}`,
		name: `Red Conectada (Chain ${chainId})`,
		symbol: 'ETH',
		decimals: 18,
		rpcUrl: '',
		explorerUrl: '',
		type: 'EVM',
		icon: '🌐',
		color: '#10B981'
	};
}
