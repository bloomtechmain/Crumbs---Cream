import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.jpg';

const links = [
  { to: '/',         label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/gallery',  label: 'Gallery' },
  { to: '/reviews',  label: 'Reviews' },
  { to: '/contact',  label: 'Contact Us' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-brown-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src={logo} alt="Crumbs & Cream" className="h-14 w-14 object-contain" />
            <div className="hidden sm:block">
              <p className="font-serif font-bold text-brown-700 text-xl leading-tight">Crumbs & Cream</p>
              <p className="text-brown-400 text-xs tracking-widest uppercase">by Yasasi</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-sm font-medium tracking-wide uppercase transition-colors duration-200 ${
                    isActive ? 'text-brown-600 border-b-2 border-brown-500 pb-0.5' : 'text-brown-500 hover:text-brown-700'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-brown-600"
            onClick={() => setOpen(!open)}
            aria-label="Toggle menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {open && (
          <div className="md:hidden border-t border-brown-100 py-4 space-y-1">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-4 py-3 text-sm font-medium uppercase tracking-wide transition-colors ${
                    isActive ? 'bg-brown-50 text-brown-700' : 'text-brown-500 hover:bg-brown-50'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
