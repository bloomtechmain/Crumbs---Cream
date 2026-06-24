import { useState } from 'react';
import { NavLink, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, Package, ImageIcon, Star, MessageSquare, Truck, LogOut, Menu, X
} from 'lucide-react';
import logo from '../../assets/logo.jpg';

const NAV = [
  { to: '/admin',           icon: LayoutDashboard, label: 'Dashboard',   end: true },
  { to: '/admin/products',  icon: Package,         label: 'Products'              },
  { to: '/admin/gallery',   icon: ImageIcon,       label: 'Gallery'               },
  { to: '/admin/reviews',   icon: Star,            label: 'Reviews'               },
  { to: '/admin/contacts',  icon: MessageSquare,   label: 'Inquiries'             },
  { to: '/admin/delivery',  icon: Truck,           label: 'Delivery Zones'        },
];

function SidebarContent({ user, onNavClick, onLogout }) {
  return (
    <>
      <nav className="flex-1 p-4 space-y-1">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                isActive
                  ? 'bg-brown-600 text-white'
                  : 'text-brown-300 hover:bg-brown-700 hover:text-white'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-brown-700">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-8 h-8 bg-brown-600 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">{user.username[0].toUpperCase()}</span>
          </div>
          <div>
            <p className="text-white text-sm font-medium">{user.username}</p>
            <p className="text-brown-400 text-xs capitalize">{user.role}</p>
          </div>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-brown-300 hover:text-white hover:bg-brown-700 rounded-md text-sm transition-colors"
        >
          <LogOut size={16} /> Sign Out
        </button>
      </div>
    </>
  );
}

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (!user) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => { logout(); navigate('/admin/login'); };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 bg-brown-800 flex-col flex-shrink-0 min-h-screen">
        <div className="p-6 border-b border-brown-700">
          <div className="flex items-center gap-3">
            <img src={logo} alt="Crumbs & Cream" className="w-10 h-10 object-contain rounded-full bg-white" />
            <div>
              <p className="text-white font-semibold text-sm">Crumbs & Cream</p>
              <p className="text-brown-300 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>
        <SidebarContent user={user} onNavClick={() => {}} onLogout={handleLogout} />
      </aside>

      {/* Mobile sidebar overlay */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black bg-opacity-50" onClick={() => setOpen(false)} />
          <aside className="relative w-64 h-full bg-brown-800 flex flex-col">
            <div className="p-5 border-b border-brown-700 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={logo} alt="Crumbs & Cream" className="w-9 h-9 object-contain rounded-full bg-white" />
                <div>
                  <p className="text-white font-semibold text-sm">Crumbs & Cream</p>
                  <p className="text-brown-300 text-xs">Admin Panel</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="text-brown-300 hover:text-white p-1">
                <X size={20} />
              </button>
            </div>
            <SidebarContent user={user} onNavClick={() => setOpen(false)} onLogout={handleLogout} />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top bar */}
        <div className="lg:hidden bg-brown-800 px-4 py-3 flex items-center gap-3 flex-shrink-0">
          <button onClick={() => setOpen(true)} className="text-white p-1">
            <Menu size={22} />
          </button>
          <span className="text-white font-semibold text-sm">Crumbs & Cream Admin</span>
        </div>
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
