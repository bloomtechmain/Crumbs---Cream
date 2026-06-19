import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ImageIcon, Star, MessageSquare, Truck, TrendingUp } from 'lucide-react';
import api from '../../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0, gallery: 0, pendingReviews: 0, unreadContacts: 0, zones: 0
  });

  useEffect(() => {
    Promise.all([
      api.get('/products/all'),
      api.get('/gallery'),
      api.get('/reviews/all'),
      api.get('/contacts'),
      api.get('/delivery/all'),
    ]).then(([prod, gal, rev, cont, del]) => {
      setStats({
        products:       prod.data.length,
        gallery:        gal.data.length,
        pendingReviews: rev.data.filter(r => !r.is_approved).length,
        unreadContacts: cont.data.filter(c => !c.is_read).length,
        zones:          del.data.length,
      });
    });
  }, []);

  const cards = [
    { to: '/admin/products', icon: Package,      label: 'Total Products',    value: stats.products,       color: 'bg-amber-50 text-amber-700 border-amber-200' },
    { to: '/admin/gallery',  icon: ImageIcon,    label: 'Gallery Photos',    value: stats.gallery,        color: 'bg-blue-50 text-blue-700 border-blue-200' },
    { to: '/admin/reviews',  icon: Star,         label: 'Pending Reviews',   value: stats.pendingReviews, color: 'bg-purple-50 text-purple-700 border-purple-200', badge: stats.pendingReviews > 0 },
    { to: '/admin/contacts', icon: MessageSquare,label: 'Unread Inquiries',  value: stats.unreadContacts, color: 'bg-red-50 text-red-700 border-red-200', badge: stats.unreadContacts > 0 },
    { to: '/admin/delivery', icon: Truck,        label: 'Delivery Zones',    value: stats.zones,          color: 'bg-green-50 text-green-700 border-green-200' },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">Welcome back! Here's an overview of your bakery.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {cards.map(({ to, icon: Icon, label, value, color, badge }) => (
          <Link key={to} to={to} className={`border rounded-lg p-6 flex items-center gap-4 hover:shadow-md transition-shadow ${color}`}>
            <div className="flex-shrink-0">
              <Icon size={28} />
            </div>
            <div>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-sm font-medium mt-0.5 opacity-80">{label}</p>
            </div>
            {badge && (
              <div className="ml-auto w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { to: '/admin/products', label: '+ Add Product',       style: 'bg-brown-600 text-white hover:bg-brown-700' },
            { to: '/admin/gallery',  label: '+ Upload Photo',       style: 'bg-brown-500 text-white hover:bg-brown-600' },
            { to: '/admin/reviews',  label: '✓ Approve Reviews',    style: 'bg-amber-500 text-white hover:bg-amber-600' },
            { to: '/admin/contacts', label: '📬 View Inquiries',    style: 'bg-gray-600 text-white hover:bg-gray-700' },
          ].map(({ to, label, style }) => (
            <Link key={to} to={to}
              className={`text-center py-3 px-4 rounded text-sm font-medium transition-colors ${style}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-6 bg-brown-50 border border-brown-200 rounded-lg p-6">
        <div className="flex items-center gap-2 mb-2">
          <TrendingUp size={20} className="text-brown-600" />
          <h2 className="font-semibold text-brown-700">Quick Tips</h2>
        </div>
        <ul className="text-brown-600 text-sm space-y-1.5">
          <li>→ Update product prices anytime from the Products page.</li>
          <li>→ New customer reviews need approval before they appear publicly.</li>
          <li>→ Toggle product availability without deleting items.</li>
          <li>→ Upload gallery photos to showcase your latest creations.</li>
        </ul>
      </div>
    </div>
  );
}
