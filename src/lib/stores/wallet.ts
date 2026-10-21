import { writable, derived } from 'svelte/store';
import { ethers } from 'ethers';

export interface WalletState {
	account: string | null;
	chainId: number | null;
	isConnected: boolean;
	isConnecting: boolean;
	error: string | null;
}

const initialState: WalletState = {
	account: null,
	chainId: null,
	isConnected: false,
	isConnecting: false,
	error: null
};

export const walletStore = writable<WalletState>(initialState);

export const shortAddress = derived(walletStore, ($w) => {
	if (!$w.account) return '';
	return `${$w.account.slice(0, 6)}...${$w.account.slice(-4)}`;
});

export async function connectWallet() {
	if (typeof window === 'undefined' || !window.ethereum) {
		walletStore.update((s) => ({ ...s, error: 'MetaMask no detectado. Instala MetaMask.' }));
		return;
	}

	walletStore.update((s) => ({ ...s, isConnecting: true, error: null }));

	try {
		const provider = new ethers.BrowserProvider(window.ethereum);
		const accounts = await provider.send('eth_requestAccounts', []);
		const network = await provider.getNetwork();

		walletStore.set({
			account: accounts[0],
			chainId: Number(network.chainId),
			isConnected: true,
			isConnecting: false,
			error: null
		});

		// Escuchar cambios
		window.ethereum.on('accountsChanged', (accs: string[]) => {
			if (accs.length === 0) disconnectWallet();
			else walletStore.update((s) => ({ ...s, account: accs[0] }));
		});
		window.ethereum.on('chainChanged', (chainId: string) => {
			walletStore.update((s) => ({ ...s, chainId: parseInt(chainId, 16) }));
		});
	} catch (err: unknown) {
		const msg = err instanceof Error ? err.message : 'Error al conectar';
		walletStore.update((s) => ({ ...s, isConnecting: false, error: msg }));
	}
}

export function disconnectWallet() {
	walletStore.set(initialState);
}

export function getProvider(): ethers.BrowserProvider | null {
	if (typeof window === 'undefined' || !window.ethereum) return null;
	return new ethers.BrowserProvider(window.ethereum);
}
