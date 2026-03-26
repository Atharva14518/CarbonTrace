import { useState, useEffect } from 'react';
import api from '../utils/api';
import {
  signRegisterLand,
  connectWallet,
  getConnectedAddress,
} from '../services/web3Service';

const STATUS_STYLE = {
  PENDING: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30', label: 'Pending' },
  APPROVED: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', border: 'border-accent-emerald/30', label: 'Approved' },
  REJECTED: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30', label: 'Rejected' },
  UNDER_REVIEW: { bg: 'bg-accent-blue/10', text: 'text-accent-blue', border: 'border-accent-blue/30', label: 'Under Review' },
};

export default function LandRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [actioning, setActioning] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(null);
  const [blockchainStatus, setBlockchainStatus] = useState(null);

  const refresh = (showLoading = false) => {
    if (showLoading) setLoading(true);
    api.get('/gov/land-requests')
      .then((r) => setRequests(r.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    refresh(true);
  }, []);

  const handleApprove = async (req) => {
    setActioning(req.id);
    setError('');
    setSuccess(null);
    try {
      setBlockchainStatus('Connecting wallet...');
      let walletAddress = await getConnectedAddress();
      if (!walletAddress) {
        walletAddress = await connectWallet();
      }

      setBlockchainStatus('Uploading land data to IPFS (Pinata)...');
      const prepRes = await api.post(`/gov/land-requests/${req.id}/prepare-approval`, { state: 'MH' });
      const { land_id_gov, ipfs_cid, polygon } = prepRes.data;

      setBlockchainStatus('Waiting for MetaMask signature...');
      const result = await signRegisterLand(land_id_gov, ipfs_cid, polygon);

      setBlockchainStatus('Saving to database...');
      const finalRes = await api.patch(`/gov/land-requests/${req.id}/approve-with-hash`, {
        tx_hash: result.txHash,
        land_id_gov,
        ipfs_cid,
        signer_address: result.signerAddress,
        polygon,
      });

      setBlockchainStatus(null);
      setSuccess({
        land_id: finalRes.data.land_id,
        tx_hash: result.txHash,
        explorer_url: finalRes.data.explorer_url,
        ipfs_url: finalRes.data.ipfs_url,
      });
      refresh();
    } catch (err) {
      setBlockchainStatus(null);
      if (err.code === 4001) {
        setError('Rejected in MetaMask');
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || err.message || 'Approval failed.');
      }
    } finally {
      setActioning(null);
    }
  };

  const handleReject = async (req) => {
    setActioning(req.id);
    setError('');
    setSuccess(null);
    try {
      await api.patch(`/gov/land-requests/${req.id}/reject`);
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.error || 'Rejection failed.');
    } finally {
      setActioning(null);
    }
  };

  const filtered = requests.filter((r) => {
    if (filter !== 'ALL' && r.status !== filter) return false;
    if (search && !r.owner_name.toLowerCase().includes(search.toLowerCase()) &&
        !r.panchayat?.name?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const countByStatus = requests.reduce((a, r) => { a[r.status] = (a[r.status] || 0) + 1; return a; }, {});
  const pendingCount = countByStatus.PENDING || 0;
  const activeTab = filter === 'ALL' ? 'All' : STATUS_STYLE[filter]?.label || filter;
  const setActiveTab = (tab) => {
    if (tab === 'All') setFilter('ALL');
    else if (tab === 'Pending') setFilter('PENDING');
    else if (tab === 'Approved') setFilter('APPROVED');
    else if (tab === 'Rejected') setFilter('REJECTED');
  };

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gov-navy border-b-2 border-gov-orange pb-2">
          Land Registration Requests
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Review and process land registration requests submitted by Gram Panchayats
        </p>
      </div>

      <div className="flex border-b-2 border-gov-border mb-4">
        <div className="flex">
          {['All', 'Pending', 'Approved', 'Rejected'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2 text-xs font-semibold border-b-2 -mb-0.5 transition-colors ${
                activeTab === tab
                  ? 'border-gov-orange text-gov-navy bg-gov-table'
                  : 'border-transparent text-gray-500 hover:text-gov-navy'
              }`}
            >
              {tab}
              {tab === 'Pending' && pendingCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-500 text-white text-xs font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="ml-auto flex items-center gap-2 pb-1">
          <input
            type="text"
            placeholder="Search owner or panchayat..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gov-border px-3 py-1 text-xs w-64 focus:outline-none focus:border-gov-blue bg-white"
          />
          <span className="text-xs text-gray-500">{filtered.length} records</span>
        </div>
      </div>

      {error && (
        <div className="gov-card bg-red-50 border border-red-200 text-red-700 text-sm py-2 px-3 mb-3">
          {error}
        </div>
      )}
      {success && (
        <div className="gov-card bg-green-50 border border-green-200 text-green-700 text-sm py-2 px-3 flex items-center justify-between gap-2 flex-wrap mb-3">
          <span>
            <strong>{success.land_id}</strong> approved and registered on blockchain.
          </span>
          <div className="flex gap-3">
            {success.explorer_url && (
              <a href={success.explorer_url} target="_blank" rel="noopener noreferrer" className="text-gov-blue underline text-xs">
                View on Etherscan →
              </a>
            )}
            {success.ipfs_url && (
              <a href={success.ipfs_url} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline text-xs">
                View IPFS data →
              </a>
            )}
          </div>
        </div>
      )}
      {blockchainStatus && (
        <div className="fixed bottom-6 right-6 z-50 bg-white border border-gov-border px-5 py-4 shadow-2xl min-w-72">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-4 h-4 border-2 border-gov-blue border-t-transparent rounded-full animate-spin flex-shrink-0" />
            <span className="text-gov-blue text-sm font-semibold">Blockchain Transaction</span>
          </div>
          <p className="text-gray-600 text-xs ml-7">{blockchainStatus}</p>
          <div className="mt-3 ml-7 space-y-1">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <span className="text-gray-500">Pinata IPFS storage</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-gov-blue" />
              <span className="text-gray-500">Ethereum Sepolia</span>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="gov-card flex items-center justify-center h-48">
          <p className="text-sm text-gray-500 animate-pulse">Loading requests...</p>
        </div>
      ) : (
        <div className="gov-card">
          <table className="gov-table">
            <thead>
              <tr>
                <th>Request No.</th>
                <th>Owner Name</th>
                <th>Panchayat</th>
                <th>District</th>
                <th>Area (Ha)</th>
                <th>Status</th>
                <th>Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => {
                const st = STATUS_STYLE[r.status] || STATUS_STYLE.PENDING;
                return (
                  <tr key={r.id}>
                    <td className="font-mono font-semibold text-gov-blue">REQ-{String(r.id).padStart(4, '0')}</td>
                    <td>{r.owner_name}</td>
                    <td>{r.panchayat?.name || '—'}</td>
                    <td>{r.panchayat?.district || '—'}</td>
                    <td>{r.area_hectares}</td>
                    <td>
                      <span className={
                        r.status === 'APPROVED'
                          ? 'badge-approved'
                          : r.status === 'PENDING'
                            ? 'badge-pending'
                            : 'badge-rejected'
                      }>
                        {r.status}
                      </span>
                    </td>
                    <td className="text-gray-500">
                      {new Date(r.createdAt || r.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}
                    </td>
                    <td>
                      {r.status === 'PENDING' ? (
                        <div className="flex gap-1">
                          <button
                            onClick={() => handleApprove(r)}
                            disabled={actioning === r.id}
                            className="btn-gov text-xs py-1 px-3 disabled:opacity-50"
                          >
                            {actioning === r.id ? 'Processing...' : '⛓ Approve'}
                          </button>
                          <button
                            onClick={() => handleReject(r)}
                            disabled={actioning === r.id}
                            className="btn-gov-danger text-xs py-1 px-3 disabled:opacity-50"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-xs">{st.label}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-500">No requests found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
