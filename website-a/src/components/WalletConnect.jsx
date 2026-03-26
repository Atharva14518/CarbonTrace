import { useState, useEffect } from 'react';
import { Wallet, ExternalLink, AlertCircle } from 'lucide-react';
import {
  connectWallet,
  getConnectedAddress,
  isMetaMaskInstalled,
} from '../services/web3Service';

export default function WalletConnect() {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    getConnectedAddress().then((addr) => {
      if (addr) setAddress(addr);
    });

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAddress(accounts[0] || null);
      });
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  };

  if (!isMetaMaskInstalled()) {
    return (
      <a
        href="https://metamask.io/download"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-1.5 border border-amber-300 bg-amber-50 text-amber-800 text-xs hover:bg-amber-100"
      >
        <AlertCircle size={12} />
        Install MetaMask
        <ExternalLink size={10} />
      </a>
    );
  }

  if (!address) {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="btn-gov-outline flex items-center gap-1.5 text-xs disabled:opacity-50"
        >
          <Wallet size={12} />
          {connecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
        {error && (
          <span className="text-red-700 text-xs max-w-48 text-right">
            {error}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 border border-green-300 bg-green-50 text-green-800 text-xs">
      <div className="w-2 h-2 rounded-full bg-green-500" />
      <span className="font-mono">
        {address.slice(0, 6)}...{address.slice(-4)}
      </span>
      <a
        href={`https://sepolia.etherscan.io/address/${address}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gov-blue hover:underline"
      >
        <ExternalLink size={10} />
      </a>
    </div>
  );
}
