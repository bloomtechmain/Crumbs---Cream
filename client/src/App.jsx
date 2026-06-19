import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import Navbar      from './components/Navbar';
import Footer      from './components/Footer';

import Home     from './pages/Home';
import Products from './pages/Products';
import Delivery from './pages/Delivery';
import Gallery  from './pages/Gallery';
import Reviews  from './pages/Reviews';
import Contact  from './pages/Contact';

import AdminLogin     from './pages/admin/AdminLogin';
import AdminLayout    from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProducts  from './pages/admin/AdminProducts';
import AdminGallery   from './pages/admin/AdminGallery';
import AdminReviews   from './pages/admin/AdminReviews';
import AdminContacts  from './pages/admin/AdminContacts';
import AdminDelivery  from './pages/admin/AdminDelivery';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
        <Routes>
          {/* Public site */}
          <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
          <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
          <Route path="/delivery" element={<PublicLayout><Delivery /></PublicLayout>} />
          <Route path="/gallery"  element={<PublicLayout><Gallery /></PublicLayout>} />
          <Route path="/reviews"  element={<PublicLayout><Reviews /></PublicLayout>} />
          <Route path="/contact"  element={<PublicLayout><Contact /></PublicLayout>} />

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index    element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="gallery"  element={<AdminGallery />} />
            <Route path="reviews"  element={<AdminReviews />} />
            <Route path="contacts" element={<AdminContacts />} />
            <Route path="delivery" element={<AdminDelivery />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
