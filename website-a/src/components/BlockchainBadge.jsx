import { ExternalLink } from 'lucide-react';

export default function BlockchainBadge({ hash }) {
  if (!hash || hash === 'PENDING_CHAIN') {
    return (
      <span className="badge-pending">
        Pending Chain
      </span>
    );
  }
  if (hash.startsWith('0x') && hash.length === 66) {
    return (
      <a
        href={`https://sepolia.etherscan.io/tx/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-gov-blue text-xs underline hover:text-gov-navy flex items-center gap-1"
      >
        {hash.slice(0, 8)}...{hash.slice(-6)}
        <ExternalLink size={10} />
      </a>
    );
  }
  return (
    <span className="text-gray-400 text-xs font-mono">
      {hash?.slice(0, 16)}...
    </span>
  );
}

