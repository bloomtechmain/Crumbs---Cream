import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar      from './components/Navbar';
import Footer      from './components/Footer';

import Home     from './pages/Home';
import Products from './pages/Products';
import Delivery from './pages/Delivery';
import Gallery  from './pages/Gallery';
import Reviews  from './pages/Reviews';
import Contact  from './pages/Contact';

function PublicLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><Products /></PublicLayout>} />
      <Route path="/delivery" element={<PublicLayout><Delivery /></PublicLayout>} />
      <Route path="/gallery"  element={<PublicLayout><Gallery /></PublicLayout>} />
      <Route path="/reviews"  element={<PublicLayout><Reviews /></PublicLayout>} />
      <Route path="/contact"  element={<PublicLayout><Contact /></PublicLayout>} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}
