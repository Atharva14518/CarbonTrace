import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  FileCheck2,
  Satellite,
  Coins,
  Wallet,
  Globe,
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
    <div className="min-h-screen bg-gov-bg text-[#1a1a2e]">
      {/* Top strip */}
      <div className="bg-gov-dark h-8 flex items-center px-4 border-b-2 border-gov-orange">
        <div className="w-6 h-6 bg-orange-400 flex items-center justify-center text-white text-xs font-bold mr-2">
          IN
        </div>
        <span className="text-white text-xs font-semibold tracking-wide">GOVERNMENT OF INDIA</span>
        <span className="text-gray-400 text-xs mx-3">|</span>
        <span className="text-gray-300 text-xs">Ministry of Environment, Forest &amp; Climate Change</span>
        <div className="ml-auto flex items-center gap-4">
          <span className="text-gray-300 text-xs">Screen Reader Access</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-300 text-xs">Skip to Main Content</span>
          <span className="text-gray-300 text-xs">|</span>
          <span className="text-gray-300 text-xs">हिंदी</span>
        </div>
      </div>

      {/* Header */}
      <div className="bg-white h-16 flex items-center px-6 border-b-2 border-gov-orange shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gov-navy flex items-center justify-center">
            <span className="text-white text-lg font-bold">CT</span>
          </div>
          <div>
            <div className="text-gov-navy text-base font-bold tracking-wide">CarbonTrace</div>
            <div className="text-gray-500 text-xs">National Blue Carbon MRV Registry</div>
          </div>
        </div>

        <div className="mx-auto text-center hidden lg:block">
          <div className="text-gov-navy text-xs font-bold uppercase tracking-widest">
            MISHTI Mission - Mangrove Initiative
          </div>
          <div className="text-gray-400 text-xs">
            Monitoring, Reporting and Verification Platform
          </div>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <WalletConnect />
          <button className="relative text-gray-500 hover:text-gov-navy transition-colors">
            <Bell size={16} />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#c0392b] text-[9px] font-bold text-white flex items-center justify-center">
              3
            </span>
          </button>
          <div className="h-5 w-px bg-gov-border" />
          <div className="text-right">
            <div className="text-xs font-semibold text-gov-navy">{user?.name || 'Loading...'}</div>
            <div className="text-[11px] text-gray-500">{user?.state || user?.district || 'National View'}</div>
          </div>
          <button
            onClick={handleLogout}
            className="text-gray-500 hover:text-[#c0392b] transition-colors"
            title="Logout"
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* Horizontal nav */}
      <nav className="bg-gov-navy h-9 flex items-center px-4 border-b border-gov-blue overflow-x-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-1.5 px-4 h-9 text-xs font-semibold transition-colors border-b-2 whitespace-nowrap ${
                isActive
                  ? 'text-white border-gov-orange bg-gov-dark'
                  : 'text-gray-300 border-transparent hover:text-white hover:bg-[#0a2255]'
              }`
            }
          >
            <item.icon size={13} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Content shell */}
      <div className="flex min-h-[calc(100vh-68px)]">
        <aside className="w-56 bg-white border-r border-gov-border min-h-screen">
          <div className="bg-gov-table border-b border-gov-border px-4 py-3">
            <div className="text-xs text-gray-500 uppercase tracking-wide font-semibold">
              Logged in as
            </div>
            <div className="text-gov-navy font-bold text-sm mt-0.5">
              {user?.name || 'Loading...'}
            </div>
            <div className="text-xs text-gov-blue mt-0.5">
              {user?.role || '—'} - {user?.state || user?.district || 'National View'}
            </div>
          </div>

          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-xs border-b border-gray-100 transition-colors ${
                  isActive
                    ? 'bg-gov-table text-gov-navy font-bold border-l-4 border-l-gov-orange'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gov-navy'
                }`
              }
            >
              <item.icon size={14} />
              {item.label}
            </NavLink>
          ))}

          <NavLink
            to="/public"
            className="flex items-center gap-3 px-4 py-2.5 text-xs border-b border-gray-100 text-gray-600 hover:bg-gray-50 hover:text-gov-navy transition-colors"
          >
            <Globe size={14} />
            Public View
          </NavLink>
        </aside>

        <main className="flex-1 bg-gov-bg min-h-screen">
          <div className="bg-white border-b border-gov-border px-6 py-2 flex items-center gap-2 text-xs text-gray-500">
            <span>Home</span>
            <ChevronRight size={12} />
            <span className="text-gov-navy font-semibold">{currentPageTitle}</span>
          </div>
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>

      <footer className="bg-gov-dark text-gray-400 text-xs py-3 px-6 flex items-center justify-between border-t-2 border-gov-orange">
        <span>
          © 2026 CarbonTrace MRV Platform | Government of India
        </span>
        <span>
          Powered by ISRO Bhuvan | Ethereum Sepolia | Pinata IPFS
        </span>
      </footer>
    </div>
  );
}
