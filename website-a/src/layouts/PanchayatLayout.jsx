import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, MapPin, Plus, Wallet, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/panchayat/dashboard',  label: 'Dashboard',        icon: LayoutDashboard },
  { to: '/panchayat/requests',   label: 'My Land Requests', icon: MapPin          },
  { to: '/panchayat/submit',     label: 'Submit Request',   icon: Plus            },
  { to: '/panchayat/payouts',    label: 'My Payouts',       icon: Wallet          },
];

export default function PanchayatLayout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { navigate('/login'); return; }
    try {
      const stored = localStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
    } catch { /* ignore */ }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';

  return (
    <div className="flex h-screen overflow-hidden bg-gov-navy">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gov-surface border-r border-gov-border flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gov-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#F59E0B' }}>
              <span className="text-gov-navy font-heading font-bold text-sm">CT</span>
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-text-primary tracking-tight leading-none">CARBONTRACE</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">PANCHAYAT PORTAL</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-3 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                isActive
                  ? 'flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gov-navy bg-amber-400 transition-colors'
                  : 'flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-text-secondary hover:text-text-primary hover:bg-gov-slate transition-colors'
              }
            >
              <Icon size={16} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User Section */}
        <div className="border-t border-gov-border px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 bg-gov-slate flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-semibold text-text-secondary">{initials}</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-text-primary truncate">{user?.name || 'Loading...'}</p>
                <p className="text-[10px] uppercase" style={{ color: '#F59E0B' }}>PANCHAYAT</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-text-muted hover:text-red-400 transition-colors" title="Logout">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="h-14 bg-gov-surface border-b border-gov-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-sm font-semibold text-text-primary uppercase tracking-wide">
              CARBONTRACE — Panchayat Portal
            </h2>
            <span className="text-gov-border">|</span>
            <span className="text-xs text-text-muted">{user?.name || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-text-muted">{user?.district || user?.village || '—'}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors border border-gov-border px-2 py-1"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gov-navy">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
