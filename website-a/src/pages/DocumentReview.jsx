import { useState } from 'react';
import { FileCheck2, Upload, CheckCircle2, XCircle, Eye, FileText, Shield } from 'lucide-react';

const MOCK_DOCS = [
  { id: 1, reqId: 'REQ-0001', owner: 'Ramesh Patil', panchayat: 'Gram Panchayat Ratnagiri', type: '7/12 Satbara Extract', cid: 'QmFake01...abc', status: 'VERIFIED', uploadedAt: '2024-12-15' },
  { id: 2, reqId: 'REQ-0001', owner: 'Ramesh Patil', panchayat: 'Gram Panchayat Ratnagiri', type: 'Plantation Plan', cid: 'QmFake02...def', status: 'VERIFIED', uploadedAt: '2024-12-15' },
  { id: 3, reqId: 'REQ-0002', owner: 'Suresh Naik', panchayat: 'Gram Panchayat Sindhudurg', type: '7/12 Satbara Extract', cid: 'QmFake03...ghi', status: 'PENDING', uploadedAt: '2024-12-18' },
  { id: 4, reqId: 'REQ-0003', owner: 'Lakshmi Menon', panchayat: 'Gram Panchayat Kannur', type: 'Land Survey Map', cid: 'QmFake04...jkl', status: 'PENDING', uploadedAt: '2024-12-20' },
  { id: 5, reqId: 'REQ-0003', owner: 'Lakshmi Menon', panchayat: 'Gram Panchayat Kannur', type: 'Plantation Plan', cid: 'QmFake05...mno', status: 'REJECTED', uploadedAt: '2024-12-20' },
  { id: 6, reqId: 'REQ-0004', owner: 'Abdul Rashid', panchayat: 'Gram Panchayat Kasaragod', type: '7/12 Satbara Extract', cid: 'QmFake06...pqr', status: 'VERIFIED', uploadedAt: '2025-01-02' },
  { id: 7, reqId: 'REQ-0005', owner: 'Bharat Solanki', panchayat: 'Gram Panchayat Kutch', type: 'Environmental Clearance', cid: 'QmFake07...stu', status: 'PENDING', uploadedAt: '2025-01-05' },
  { id: 8, reqId: 'REQ-0006', owner: 'Jaya Patel', panchayat: 'Gram Panchayat Surat', type: 'Land Survey Map', cid: 'QmFake08...vwx', status: 'VERIFIED', uploadedAt: '2025-01-10' },
];

const STATUS_MAP = {
  VERIFIED: { bg: 'bg-accent-emerald/10', text: 'text-accent-emerald', border: 'border-accent-emerald/30', icon: CheckCircle2 },
  PENDING: { bg: 'bg-accent-amber/10', text: 'text-accent-amber', border: 'border-accent-amber/30', icon: FileCheck2 },
  REJECTED: { bg: 'bg-accent-red/10', text: 'text-accent-red', border: 'border-accent-red/30', icon: XCircle },
};

export default function DocumentReview() {
  const [filter, setFilter] = useState('ALL');
  const filtered = filter === 'ALL' ? MOCK_DOCS : MOCK_DOCS.filter((d) => d.status === filter);
  const counts = MOCK_DOCS.reduce((a, d) => { a[d.status] = (a[d.status] || 0) + 1; return a; }, {});

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gov-navy border-b-2 border-gov-orange pb-2">Document Verification</h1>
        <p className="text-xs text-gray-500 mt-1">Review uploaded land ownership documents stored on IPFS</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Verified', count: counts.VERIFIED || 0, color: 'text-accent-emerald', bg: 'bg-accent-emerald/10' },
          { label: 'Pending Review', count: counts.PENDING || 0, color: 'text-accent-amber', bg: 'bg-accent-amber/10' },
          { label: 'Rejected', count: counts.REJECTED || 0, color: 'text-accent-red', bg: 'bg-accent-red/10' },
        ].map((s) => (
          <div key={s.label} className="gov-card flex items-center gap-3 p-3">
            <div className={`w-9 h-9 ${s.bg} flex items-center justify-center`}>
              <FileCheck2 size={16} className={s.color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gov-navy">{s.count}</p>
              <p className="text-xs text-gray-500">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="gov-card flex gap-1 p-2">
        {['ALL', 'PENDING', 'VERIFIED', 'REJECTED'].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${filter === s ? 'bg-gov-table text-gov-navy border border-gov-border' : 'text-gray-500 hover:text-gov-navy'}`}
          >
            {s === 'ALL' ? `All (${MOCK_DOCS.length})` : `${s.charAt(0) + s.slice(1).toLowerCase()} (${counts[s] || 0})`}
          </button>
        ))}
      </div>

      {/* Document Table */}
      <div className="gov-card">
        <table className="gov-table">
          <thead>
            <tr>
              <th>Request</th>
              <th>Owner</th>
              <th>Panchayat</th>
              <th>Document Type</th>
              <th>IPFS CID</th>
              <th>Status</th>
              <th>Uploaded</th>
            </tr>
          </thead>
          <tbody>
        {filtered.map((doc) => {
          const st = STATUS_MAP[doc.status];
          return (
            <tr key={doc.id}>
              <td className="font-mono text-gov-blue">{doc.reqId}</td>
              <td>{doc.owner}</td>
              <td>{doc.panchayat}</td>
              <td>{doc.type}</td>
              <td>
                <a href="#" className="text-gov-blue underline font-mono text-xs">{doc.cid}</a>
              </td>
              <td>
                <span className={doc.status === 'VERIFIED' ? 'badge-verified' : doc.status === 'PENDING' ? 'badge-pending' : 'badge-rejected'}>
                  {doc.status}
                </span>
              </td>
              <td>{doc.uploadedAt}</td>
            </tr>
          );
        })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
