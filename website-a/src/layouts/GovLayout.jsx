import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileCheck2,
  Satellite,
  Coins,
  Wallet,
  Shield,
  LogOut,
  Bell,
  ChevronRight,
} from 'lucide-react';
import WalletConnect from '../components/WalletConnect';

const navItems = [
  { path: '/gov/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/gov/land-requests', label: 'Land Requests', icon: MapPin },
  { path: '/gov/documents', label: 'Documents', icon: FileCheck2 },
  { path: '/gov/ndvi', label: 'NDVI Monitoring', icon: Satellite },
  { path: '/gov/credits', label: 'Credit Issuance', icon: Coins },
  { path: '/gov/payouts', label: 'Payouts', icon: Wallet },
  { path: '/gov/audit', label: 'Blockchain Audit', icon: Shield },
];

export default function GovLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
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
    ? user.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase()
    : '??';
  const currentPageTitle = navItems.find((item) => item.path === location.pathname)?.label || 'Portal';

  return (
    <div className="flex h-screen overflow-hidden bg-ct-bg">
      {/* ── SIDEBAR ─────────────────────────────── */}
      <aside className="w-64 flex-shrink-0 bg-ct-surface border-r border-ct-border flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-ct-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-cyan flex items-center justify-center shadow-glow-cyan">
              <span className="text-ct-surface font-bold text-sm">CT</span>
            </div>
            <div>
              <p className="text-ct-text font-bold text-sm leading-none">CarbonTrace</p>
              <p className="text-ct-muted text-[10px] mt-0.5 uppercase tracking-widest">
                MRV Portal
              </p>
            </div>
          </div>
        </div>

        {/* Government strip */}
        <div className="px-4 py-2.5 border-b border-ct-border bg-ct-bg/50">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-saffron flex-shrink-0" />
            <p className="text-[10px] text-ct-muted uppercase tracking-wide leading-tight">
              Govt. of India — MISHTI Mission
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          <p className="ct-section-title px-2">Main Menu</p>
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 group ${
                  isActive
                    ? 'bg-ct-cyan/10 text-ct-cyan border border-ct-cyan/20'
                    : 'text-ct-muted hover:text-ct-text hover:bg-ct-hover'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    size={16}
                    className={
                      isActive ? 'text-ct-cyan' : 'text-ct-muted group-hover:text-ct-subtle'
                    }
                  />
                  <span className="font-medium">{label}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-ct-cyan" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User card at bottom */}
        <div className="p-4 border-t border-ct-border">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-ct-bg/50 border border-ct-border">
            <div className="w-8 h-8 rounded-full bg-gradient-saffron flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-ct-text text-xs font-semibold truncate">{user?.name}</p>
              <p className="text-ct-muted text-[10px] uppercase tracking-wide">{user?.role}</p>
            </div>
            <button onClick={handleLogout} className="text-ct-muted hover:text-ct-red transition-colors">
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* ── MAIN CONTENT ────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 bg-ct-surface border-b border-ct-border flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-ct-muted">
            <span>Portal</span>
            <ChevronRight size={12} />
            <span className="text-ct-text font-medium">{currentPageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <div className="ct-live-dot" />
              <span className="text-[10px] text-ct-muted uppercase tracking-wide">Sepolia</span>
            </div>

            <div className="w-px h-4 bg-ct-border" />

            <WalletConnect />

            <button className="relative w-8 h-8 rounded-lg bg-ct-hover border border-ct-border flex items-center justify-center text-ct-muted hover:text-ct-text transition-colors">
              <Bell size={14} />
              <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-ct-saffron" />
            </button>

            <span className="ct-badge-verified text-[10px]">
              {user?.state || 'National'}
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
