import { useState, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logo from '../assets/logo.webp';

const links = [
  { to: '/',         label: 'Home' },
  { to: '/products', label: 'Products' },
  { to: '/delivery', label: 'Delivery' },
  { to: '/gallery',  label: 'Gallery' },
  // Reviews page is temporarily unpublished — re-add once it goes live.
  // { to: '/reviews',  label: 'Reviews' },
  { to: '/contact',  label: 'Contact Us' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Shrinking the sticky nav shortens the page by up to 64px, which pulls
    // scrollY back down. A single threshold would flip-flop (flicker), so
    // shrink and expand at points further apart than that height change.
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled((prev) => (prev ? y > 10 : y > 100));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className="bg-white border-b border-brown-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between transition-all duration-300 ${
            scrolled ? 'h-16 md:h-20' : 'h-24 md:h-36'
          }`}
        >
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
            <img src={logo} alt="Crumbs & Cream" className={`object-contain rounded-full transition-all duration-300 ${
                scrolled ? 'h-12 w-12 md:h-16 md:w-16' : 'h-20 w-20 md:h-32 md:w-32'
              }`} />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-10">
            {links.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `text-lg font-medium tracking-wide uppercase transition-colors duration-200 ${
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
