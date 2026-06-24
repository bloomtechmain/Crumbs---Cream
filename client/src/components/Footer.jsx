import { Link } from 'react-router-dom';
import { MapPin, Mail, Phone } from 'lucide-react';
import InstagramIcon from './InstagramIcon';
import FacebookIcon from './FacebookIcon';
import TickerBanner from './TickerBanner';
import logo from '../assets/logo.jpg';

export default function Footer() {
  return (
    <footer className="bg-brown-800 text-brown-100 mt-auto">
      {/* Ticker */}
      <TickerBanner />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logo} alt="Crumbs & Cream" className="w-12 h-12 object-contain rounded-full bg-white" />
              <div>
                <p className="font-serif font-bold text-white text-xl">Crumbs & Cream</p>
                <p className="text-brown-300 text-xs tracking-widest uppercase">by Yasasi</p>
              </div>
            </div>
            <p className="text-brown-300 text-sm leading-relaxed mb-4">
              Homemade cookies, brownies & cupcakes baked with love in South East Melbourne.
              Where every crumb counts.
            </p>
            {/* Social links */}
            <div className="flex gap-3">
              <a
                href="https://instagram.com/_crumbs.and.cream_"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brown-300 hover:text-white transition-colors text-sm"
                title="Instagram"
              >
                <InstagramIcon size={18} />
              </a>
              <a
                href="https://www.facebook.com/p/Crumbs-Cream-61577892432479"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-brown-300 hover:text-white transition-colors text-sm"
                title="Facebook"
              >
                <FacebookIcon size={18} />
              </a>
            </div>
            <div className="mt-3 space-y-1">
              <a href="https://instagram.com/_crumbs.and.cream_" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-brown-300 hover:text-white transition-colors text-sm">
                <InstagramIcon size={14} /> @_crumbs.and.cream_
              </a>
              <a href="https://www.facebook.com/p/Crumbs-Cream-61577892432479" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 text-brown-300 hover:text-white transition-colors text-sm">
                <FacebookIcon size={14} /> Crumbs & Cream
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-serif font-semibold text-white text-lg mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {[
                ['/products', 'Our Products'],
                ['/delivery', 'Delivery Info'],
                ['/gallery',  'Gallery'],
                ['/reviews',  'Reviews'],
                ['/contact',  'Contact Us'],
              ].map(([to, label]) => (
                <li key={to}>
                  <Link to={to} className="text-brown-300 hover:text-white text-sm transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-serif font-semibold text-white text-lg mb-4">Get in Touch</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-3 text-brown-300 text-sm">
                <MapPin size={16} className="mt-0.5 flex-shrink-0 text-brown-400" />
                South East Melbourne, Victoria, Australia
              </li>
              <li className="flex items-center gap-3 text-brown-300 text-sm">
                <Phone size={16} className="flex-shrink-0 text-brown-400" />
                <a href="tel:+61431879184" className="hover:text-white transition-colors">+61 431 879 184</a>
              </li>
              <li className="flex items-center gap-3 text-brown-300 text-sm">
                <InstagramIcon size={16} className="flex-shrink-0 text-brown-400" />
                <a href="https://instagram.com/_crumbs.and.cream_" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  @_crumbs.and.cream_
                </a>
              </li>
              <li className="flex items-center gap-3 text-brown-300 text-sm">
                <FacebookIcon size={16} className="flex-shrink-0 text-brown-400" />
                <a href="https://www.facebook.com/p/Crumbs-Cream-61577892432479" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  Crumbs & Cream
                </a>
              </li>
              <li className="flex items-center gap-3 text-brown-300 text-sm">
                <Mail size={16} className="flex-shrink-0 text-brown-400" />
                hello@crumbsandcream.com.au
              </li>
            </ul>
            <Link
              to="/contact"
              className="mt-6 inline-block bg-brown-500 hover:bg-brown-400 text-white text-xs tracking-widest uppercase font-medium px-6 py-3 transition-colors"
            >
              Place an Order
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-brown-700 py-4">
        <p className="text-center text-brown-400 text-xs">
          © {new Date().getFullYear()} Crumbs & Cream by Yasasi. All rights reserved. South East Melbourne, VIC.
        </p>
      </div>
    </footer>
  );
}
