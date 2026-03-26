import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard, Trees, Upload, Wallet, LogOut,
} from 'lucide-react';

const navItems = [
  { to: '/ngo/dashboard', label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/ngo/lands',     label: 'My Lands',     icon: Trees           },
  { to: '/ngo/mrv',       label: 'MRV Upload',   icon: Upload          },
  { to: '/ngo/payments',  label: 'My Payments',  icon: Wallet          },
];

export default function NgoLayout() {
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
    <div className="flex h-screen overflow-hidden bg-gov-bg">
      {/* Sidebar */}
      <aside className="w-60 flex-shrink-0 bg-gov-surface border-r border-gov-border flex flex-col">
        {/* Logo */}
        <div className="h-14 flex items-center px-4 border-b border-gov-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center" style={{ background: '#10B981' }}>
              <span className="text-gov-navy font-heading font-bold text-sm">CT</span>
            </div>
            <div>
              <h1 className="font-heading text-sm font-bold text-text-primary tracking-tight leading-none">CARBONTRACE</h1>
              <p className="text-[10px] text-text-muted uppercase tracking-widest">NGO PORTAL</p>
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
                  ? 'flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-emerald-900 bg-emerald-100 border-l-2 border-emerald-600 transition-colors'
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
                <p className="text-[10px] uppercase" style={{ color: '#10B981' }}>NGO</p>
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
              CARBONTRACE — NGO Portal
            </h2>
            <span className="text-gov-border">|</span>
            <span className="text-xs text-text-muted">{user?.name || '—'}</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs text-text-muted hover:text-red-400 transition-colors border border-gov-border px-2 py-1"
            >
              <LogOut size={12} /> Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 bg-gov-bg">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
