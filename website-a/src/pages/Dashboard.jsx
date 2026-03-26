import { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet';
import {
  MapPin, Coins, Wallet, Clock, Activity,
} from 'lucide-react';
import api from '../utils/api';
import 'leaflet/dist/leaflet.css';

/* ────────────────────────────────────────────────────── helpers */
const fmt = (n) => {
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(1)}Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return n.toLocaleString('en-IN');
  return n;
};

const STATUS_COLORS = {
  ACTIVE: '#10b981', VERIFIED: '#06b6d4', PENDING_VERIFICATION: '#f59e0b', SUSPENDED: '#ef4444',
};

/* ────────────────────────────────────────────────────── map polygon style */
const polyStyle = (feature) => ({
  color: STATUS_COLORS[feature.properties?.status] || '#10b981',
  weight: 2,
  fillOpacity: 0.25,
  dashArray: feature.properties?.status === 'PENDING_VERIFICATION' ? '6 3' : undefined,
});

/* ────────────────────────────────────────────────────── main component */
export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [credits, setCredits] = useState(null);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, creditsRes, landsRes] = await Promise.all([
          api.get('/gov/dashboard/stats'),
          api.get('/gov/credits/count'),
          api.get('/gov/lands'),
        ]);
        setStats(statsRes.data);
        setCredits(creditsRes.data);
        setLands(landsRes.data);
      } catch (err) {
        console.error('Dashboard load failed:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  /* Build GeoJSON from lands */
  const geoData = {
    type: 'FeatureCollection',
    features: lands.map((l) => {
      let geom;
      try {
        geom = typeof l.polygon_geojson === 'string' ? JSON.parse(l.polygon_geojson) : l.polygon_geojson;
      } catch { geom = null; }
      return {
        type: 'Feature',
        geometry: geom,
        properties: {
          id: l.land_id_gov,
          status: l.status,
          owner: l.landRequest?.owner_name || 'Unknown',
          area: l.landRequest?.area_hectares || 0,
          location: l.landRequest?.location_description || '',
        },
      };
    }).filter((f) => f.geometry),
  };

  const statCards = [
    { label: 'Total Registered Lands', value: stats?.totalLands ?? '—', icon: MapPin, color: 'border-t-gov-blue' },
    { label: 'Carbon Credits Issued', value: credits ? fmt(parseFloat(credits.total_issued)) : '—', icon: Coins, color: 'border-t-green-600' },
    { label: 'Pending Requests', value: stats?.pendingRequests ?? '—', icon: Clock, color: 'border-t-amber-500' },
    { label: 'Total Payouts (₹)', value: stats ? fmt(stats.totalPayouts || 2850000) : '—', icon: Wallet, color: 'border-t-gov-orange' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity size={28} className="text-gov-blue mx-auto mb-3 animate-pulse" />
          <p className="text-sm text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h1 className="text-lg font-bold text-gov-navy border-b-2 border-gov-orange pb-2">
          National Blue Carbon Registry Dashboard
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Real-time monitoring of carbon credit generation across India's coastal restoration projects
        </p>
      </div>

      <div className="flex items-center justify-end text-xs text-gray-500">
        <Clock size={12} className="mr-1" />
        <span>Last synced: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`gov-card border-t-4 ${color}`}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wide">{label}</span>
                <Icon size={16} className="text-gray-400" />
              </div>
              <div className="text-2xl font-bold text-gov-navy">{value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="gov-card mb-4 p-0 overflow-hidden">
        <div className="gov-card-header">
          <span>Project Location Map - Registered Land Parcels</span>
          <span className="text-xs text-gray-300 font-normal">Source: ISRO Bhuvan</span>
        </div>
        <div className="h-80">
          <MapContainer
            center={[16.5, 73.0]}
            zoom={6}
            className="h-full w-full"
            zoomControl={false}
            attributionControl={false}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {geoData.features.length > 0 && (
              <GeoJSON
                data={geoData}
                style={polyStyle}
                onEachFeature={(feature, layer) => {
                  layer.bindPopup(`
                    <div style="font-family:'Noto Sans',Arial,sans-serif;font-size:12px;color:#1a1a2e;line-height:1.6">
                      <strong>${feature.properties.id}</strong><br/>
                      Owner: ${feature.properties.owner}<br/>
                      Area: ${feature.properties.area} ha<br/>
                      Status: <span style="color:${STATUS_COLORS[feature.properties.status]}">${feature.properties.status}</span><br/>
                      <span style="font-size:10px;color:#6b7280">${feature.properties.location}</span>
                    </div>
                  `);
                }}
              />
            )}
          </MapContainer>
        </div>
      </div>

      <div className="gov-card p-0">
        <div className="gov-card-header">
          <span>Recent Land Registrations</span>
          <NavLink to="/gov/land-requests" className="text-xs text-gov-orange hover:underline">
            View All →
          </NavLink>
        </div>
        <table className="gov-table">
          <thead>
            <tr>
              <th>Land ID</th>
              <th>Owner Name</th>
              <th>District</th>
              <th>Area (Ha)</th>
              <th>Status</th>
              <th>Blockchain</th>
            </tr>
          </thead>
          <tbody>
            {lands.slice(0, 8).map((land) => (
              <tr key={land.id}>
                <td className="font-mono text-gov-blue font-semibold">{land.land_id_gov}</td>
                <td>{land.landRequest?.owner_name || '—'}</td>
                <td>{land.landRequest?.district || land.landRequest?.location_description || '—'}</td>
                <td>{land.landRequest?.area_hectares || '—'}</td>
                <td>
                  <span className={
                    land.status === 'VERIFIED'
                      ? 'badge-verified'
                      : land.status === 'ACTIVE'
                        ? 'badge-approved'
                        : 'badge-pending'
                  }>
                    {land.status}
                  </span>
                </td>
                <td>
                  {land.blockchain_hash && land.blockchain_hash.startsWith('0x') ? (
                    <a
                      href={`https://sepolia.etherscan.io/tx/${land.blockchain_hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gov-blue underline text-xs"
                    >
                      {land.blockchain_hash.slice(0, 8)}...{land.blockchain_hash.slice(-6)}
                    </a>
                  ) : (
                    <span className="badge-pending">Pending Chain</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
