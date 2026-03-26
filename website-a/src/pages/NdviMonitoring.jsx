import { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Satellite, TrendingUp, AlertTriangle, Loader2, Zap, Image } from 'lucide-react';
import api from '../utils/api';

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gov-border px-3 py-2 text-xs">
      <p className="text-gray-500 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: <span className="font-semibold text-gov-navy">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function NdviMonitoring() {
  const [lands, setLands] = useState([]);
  const [selectedLand, setSelectedLand] = useState(null);
  const [ndviData, setNdviData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [bhuvanStatus, setBhuvanStatus] = useState(null);
  const [scanningAll, setScanningAll] = useState(false);
  const [fullScanResult, setFullScanResult] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/gov/lands'),
      api.get('/bhuvan/status').catch(() => ({ data: { status: 'unconfigured' } })),
    ]).then(([landsRes, statusRes]) => {
      setLands(landsRes.data);
      setBhuvanStatus(statusRes.data);
      if (landsRes.data.length) setSelectedLand(landsRes.data[0]);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  // Load NDVI history for selected land
  useEffect(() => {
    if (!selectedLand) return;
    setScanResult(null);
    api.get(`/gov/lands/${selectedLand.id}/ndvi`)
      .then((r) => {
        const formatted = r.data.map((n) => ({
          date: new Date(n.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
          ndvi: parseFloat(n.ndvi_value),
          increase: parseFloat(n.greenery_increase_percent) || 0,
          source: n.satellite_source,
        }));
        setNdviData(formatted);
      })
      .catch(console.error);
  }, [selectedLand]);

  // Trigger live Bhuvan NDVI scan for selected land
  const handleBhuvanScan = async () => {
    if (!selectedLand) return;
    setScanning(true);
    setScanResult(null);
    try {
      const res = await api.get(`/bhuvan/ndvi/${selectedLand.id}`);
      setScanResult(res.data);
      // Reload NDVI history to include the new reading
      const ndviRes = await api.get(`/gov/lands/${selectedLand.id}/ndvi`);
      const formatted = ndviRes.data.map((n) => ({
        date: new Date(n.recorded_at).toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
        ndvi: parseFloat(n.ndvi_value),
        increase: parseFloat(n.greenery_increase_percent) || 0,
        source: n.satellite_source,
      }));
      setNdviData(formatted);
    } catch (err) {
      setScanResult({ error: err.response?.data?.message || err.message });
    } finally {
      setScanning(false);
    }
  };

  // Trigger full scan for all lands
  const handleFullScan = async () => {
    setScanningAll(true);
    setFullScanResult(null);
    try {
      const res = await api.post('/bhuvan/scan-all');
      setFullScanResult(res.data);
    } catch (err) {
      setFullScanResult({ error: err.response?.data?.message || err.message });
    } finally {
      setScanningAll(false);
    }
  };

  const latestNdvi = ndviData.length ? ndviData[ndviData.length - 1]?.ndvi : 0;
  const ndviStatus = latestNdvi >= 0.5 ? 'HEALTHY' : latestNdvi >= 0.3 ? 'MODERATE' : 'LOW';
  const statusColor = ndviStatus === 'HEALTHY' ? '#10b981' : ndviStatus === 'MODERATE' ? '#f59e0b' : '#ef4444';

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-lg font-bold text-gov-navy border-b-2 border-gov-orange pb-2">NDVI Monitoring</h1>
          <p className="text-xs text-gray-500 mt-1">Satellite-based vegetation index tracking via ISRO Bhuvan</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleFullScan}
            disabled={scanningAll || !bhuvanStatus?.apiKeyPresent}
            className="btn-gov-outline flex items-center gap-2 text-xs py-1.5 disabled:opacity-50"
          >
            {scanningAll ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            {scanningAll ? 'Scanning All...' : 'Scan All Parcels'}
          </button>
        </div>
      </div>

      {/* Bhuvan Status Bar */}
      <div className={`gov-card flex items-center justify-between py-2 px-3 ${
        bhuvanStatus?.apiKeyPresent ? 'border-green-300' : 'border-amber-300'
      }`}>
        <div className="flex items-center gap-3">
          <Satellite size={16} className={bhuvanStatus?.apiKeyPresent ? 'text-green-700' : 'text-amber-700'} />
          <div>
            <span className="text-xs font-semibold text-gov-navy">ISRO Bhuvan WMS</span>
            <span className={`ml-2 text-[10px] font-mono ${bhuvanStatus?.apiKeyPresent ? 'text-green-700' : 'text-amber-700'}`}>
              {bhuvanStatus?.apiKeyPresent ? '● API Key Configured' : '● Not configured'}
            </span>
          </div>
        </div>
        <span className="text-[10px] text-gray-500">API Key: {bhuvanStatus?.apiKeyPresent ? '✓ Present' : '✗ Missing'}</span>
      </div>

      {/* Full Scan Results */}
      {fullScanResult && !fullScanResult.error && (
        <div className="gov-card p-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-gov-blue" />
            <h3 className="text-sm font-semibold text-gov-navy">Full Scan Results</h3>
            <span className="text-[10px] text-gray-500 ml-auto">{fullScanResult.scannedAt}</span>
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="text-center p-2 bg-gov-table border border-gov-border">
              <p className="text-lg font-bold text-green-700">{fullScanResult.successful}</p>
              <p className="text-[10px] text-gray-500">Successful</p>
            </div>
            <div className="text-center p-2 bg-gov-table border border-gov-border">
              <p className="text-lg font-bold text-gov-navy">{fullScanResult.totalScanned}</p>
              <p className="text-[10px] text-gray-500">Total Scanned</p>
            </div>
          </div>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {fullScanResult.results?.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-gov-border/30">
                <span className="font-mono text-gov-blue">{r.landId}</span>
                {r.status === 'success' ? (
                  <span className="text-green-700">NDVI: {r.ndvi} ({r.change})</span>
                ) : (
                  <span className="text-red-700">{r.status}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Land Selector */}
        <div className="gov-card p-0 max-h-[600px] overflow-y-auto">
          <div className="px-4 py-3 border-b border-gov-border">
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider">Select Land Parcel</h3>
          </div>
          <div className="divide-y divide-gov-border/50">
            {lands.map((l) => (
              <button
                key={l.id}
                onClick={() => setSelectedLand(l)}
                className={`w-full text-left px-4 py-3 transition-colors ${
                  selectedLand?.id === l.id ? 'bg-gov-table border-l-2 border-gov-orange' : 'hover:bg-gray-50 border-l-2 border-transparent'
                }`}
              >
                <p className="text-xs font-mono text-gov-blue">{l.land_id_gov}</p>
                <p className="text-xs text-gray-700 mt-0.5 truncate">{l.landRequest?.owner_name || '—'}</p>
                <p className="text-[10px] text-gray-500 mt-0.5">{l.landRequest?.area_hectares} ha</p>
              </button>
            ))}
          </div>
        </div>

        {/* NDVI Chart + Details */}
        <div className="lg:col-span-3 space-y-3">
          {/* Stats Bar */}
          <div className="grid grid-cols-4 gap-3">
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Current NDVI</p>
              <p className="text-2xl font-bold mt-1" style={{ color: statusColor }}>{latestNdvi.toFixed(4)}</p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Vegetation Status</p>
              <p className="text-lg font-bold mt-1" style={{ color: statusColor }}>{ndviStatus}</p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Greenery Change</p>
              <p className="text-2xl font-bold text-green-700 mt-1">
                {ndviData.length > 1 ? `+${ndviData[ndviData.length - 1].increase.toFixed(1)}%` : '—'}
              </p>
            </div>
            <div className="gov-card p-3">
              <p className="text-xs text-gray-500 uppercase font-semibold">Live Scan</p>
              <button
                onClick={handleBhuvanScan}
                disabled={scanning || !selectedLand || !bhuvanStatus?.apiKeyPresent}
                className="mt-1 btn-gov text-xs py-1.5 px-3 flex items-center gap-2 disabled:opacity-50"
              >
                {scanning ? <Loader2 size={12} className="animate-spin" /> : <Satellite size={12} />}
                {scanning ? 'Scanning...' : 'Bhuvan Scan'}
              </button>
            </div>
          </div>

          {/* Bhuvan Scan Result */}
          {scanResult && (
            <div className={`gov-card p-3 ${scanResult.error ? 'border-red-300' : 'border-green-300'}`}>
              {scanResult.error ? (
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle size={14} />
                  <span className="text-xs">Scan failed: {scanResult.error}</span>
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Satellite size={14} className="text-green-700" />
                    <span className="text-xs font-semibold text-green-700">Live Bhuvan Scan Result</span>
                    <span className="text-[10px] text-gray-500 ml-auto">{scanResult.calculatedAt}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <p className="text-[10px] text-gray-500">Mean NDVI</p>
                      <p className="text-lg font-bold text-green-700">{scanResult.meanNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Min NDVI</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.minNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Max NDVI</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.maxNdvi ?? '—'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-gray-500">Samples</p>
                      <p className="text-sm font-mono text-gov-navy">{scanResult.successfulSamples}/{scanResult.sampledPoints}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* NDVI Chart */}
          <div className="gov-card p-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <TrendingUp size={14} className="text-green-700" />
                <h3 className="text-sm font-semibold text-gov-navy">
                  NDVI Time Series - {selectedLand?.land_id_gov || '—'}
                </h3>
              </div>
              <div className="flex gap-3 text-[10px] text-gray-500">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-700 inline-block" /> NDVI Value
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-amber-600 inline-block" /> Threshold (0.3)
                </span>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={ndviData}>
                <defs>
                  <linearGradient id="ndviGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <YAxis domain={[0, 1]} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                <Tooltip content={<ChartTooltip />} />
                <ReferenceLine y={0.3} stroke="#d97706" strokeDasharray="6 3" label={{ value: 'Min Threshold', fill: '#d97706', fontSize: 10, position: 'right' }} />
                <Area type="monotone" dataKey="ndvi" stroke="#1a7a3c" strokeWidth={2} fill="url(#ndviGrad)" name="NDVI" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* NDVI Satellite Image */}
          {selectedLand && bhuvanStatus?.apiKeyPresent && (
            <div className="gov-card p-3">
              <div className="flex items-center gap-2 mb-3">
                <Image size={14} className="text-gov-blue" />
                <h3 className="text-sm font-semibold text-gov-navy">Satellite NDVI Imagery</h3>
              </div>
              <div className="relative bg-white border border-gov-border aspect-video flex items-center justify-center overflow-hidden">
                <img
                  src={`/api/bhuvan/ndvi-image/${selectedLand.id}`}
                  alt={`NDVI satellite view for ${selectedLand.land_id_gov}`}
                  className="max-w-full max-h-full object-contain"
                  onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                />
                <div className="hidden items-center justify-center absolute inset-0">
                  <p className="text-xs text-gray-500">Satellite image unavailable for this parcel</p>
                </div>
              </div>
              <p className="text-[10px] text-gray-500 mt-2">Source: ISRO Bhuvan WMS - NDVI composite layer</p>
            </div>
          )}

          {/* Alerts */}
          {latestNdvi > 0 && latestNdvi < 0.3 && (
            <div className="gov-card border-red-300 flex items-center gap-3 p-3">
              <AlertTriangle size={18} className="text-red-700 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Critical: Vegetation Below Threshold</p>
                <p className="text-xs text-gray-600 mt-0.5">
                  NDVI value ({latestNdvi.toFixed(4)}) is below the minimum 0.3 threshold. 
                  Investigation required for {selectedLand?.land_id_gov}.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
