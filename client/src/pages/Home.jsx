import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, MapPin, Clock, Heart } from 'lucide-react';
import api from '../api/axios';
import { imageUrl } from '../api/imageUrl';
export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [reviews, setReviews]   = useState([]);

  useEffect(() => {
    api.get('/products?featured=true').then(r => setFeatured(r.data.slice(0, 6)));
    api.get('/reviews').then(r => setReviews(r.data.slice(0, 3)));
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden bg-brown-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1600&q=80')" }}
        />
        <div className="relative z-10 text-center px-4 max-w-3xl mx-auto">
          <p className="text-cream-300 text-sm tracking-[0.3em] uppercase mb-6 font-medium">
            Crumbs & Cream by Yasasi
          </p>
          <h1 className="font-serif text-5xl md:text-7xl text-white font-bold leading-tight mb-6">
            From Our Oven<br />
            <span className="text-cream-300">To Your Door</span>
          </h1>
          <p className="text-cream-200 text-lg md:text-xl mb-10 max-w-xl mx-auto leading-relaxed">
            Homemade cookies, brownies & cupcakes baked with love in South East Melbourne.
            Where every crumb counts.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/products" className="btn-primary">
              Shop Now <ArrowRight className="inline ml-2" size={16} />
            </Link>
            <Link to="/gallery" className="btn-outline border-white text-white hover:bg-white hover:text-brown-700">
              View Gallery
            </Link>
          </div>
        </div>
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center pt-1">
            <div className="w-1 h-3 bg-white rounded-full" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-cream-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            {[
              { icon: Heart, title: 'Made with Care', desc: 'Every item baked fresh to order with premium ingredients and a whole lot of love.' },
              { icon: Clock, title: 'Fresh Daily',     desc: 'No preservatives, no shortcuts. Baked the day before delivery for ultimate freshness.' },
              { icon: MapPin, title: 'Melbourne Local', desc: 'Proudly serving South East Melbourne suburbs. Local pickup also available.' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8">
                <div className="w-16 h-16 bg-brown-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={28} className="text-brown-600" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-brown-700 mb-2">{title}</h3>
                <p className="text-brown-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-brown-400 text-sm tracking-widest uppercase mb-2">Our Favourites</p>
            <h2 className="section-title">Fan Favourites</h2>
            <p className="text-brown-400 mt-3 max-w-xl mx-auto">The treats Melbourne can't stop talking about.</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featured.map((p) => (
              <div key={p.id} className="card group overflow-hidden">
                <div className="aspect-square overflow-hidden bg-cream-100">
                  {p.image_url ? (
                    <img
                      src={imageUrl(p.image_url)}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-6xl">🍪</span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <p className="text-xs text-brown-400 uppercase tracking-widest mb-1">{p.category_name}</p>
                  <h3 className="font-serif text-lg font-semibold text-brown-800 mb-1">{p.name}</h3>
                  <p className="text-brown-500 text-sm mb-3 line-clamp-2">{p.description}</p>
                  <p className="text-brown-700 font-bold text-lg">A${parseFloat(p.price).toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/products" className="btn-primary">View All Products</Link>
          </div>
        </div>
      </section>

      {/* About / Story */}
      <section className="py-20 bg-brown-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">The Maker Behind the Magic</p>
              <h2 className="font-serif text-4xl md:text-5xl font-bold mb-6">Meet Yasasi.</h2>
              <p className="text-brown-200 leading-relaxed mb-4">
                Based in South East Melbourne, Crumbs & Cream was born from a deep love of baking and the belief
                that homemade always tastes better. Every cookie, brownie, and cupcake is crafted from scratch
                using only the finest ingredients.
              </p>
              <p className="text-brown-200 leading-relaxed mb-8">
                From pistachio white chocolate cookies to rich fudge brownies — each creation is made to order,
                ensuring it arrives at its absolute freshest. Because here, every crumb counts.
              </p>
              <Link to="/contact" className="btn-primary">
                Place a Custom Order
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="aspect-square bg-brown-700 rounded-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1607478900766-efe13248b125?w=400&q=80"
                  alt="Baking"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="aspect-square bg-brown-700 rounded-sm overflow-hidden mt-8">
                <img
                  src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=400&q=80"
                  alt="Cookies"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="aspect-square bg-brown-700 rounded-sm overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=400&q=80"
                  alt="Cupcakes"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
              <div className="aspect-square bg-brown-700 rounded-sm overflow-hidden mt-8">
                <img
                  src="https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&q=80"
                  alt="Brownies"
                  className="w-full h-full object-cover opacity-80"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Reviews Snippet */}
      {reviews.length > 0 && (
        <section className="py-20 bg-cream-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-brown-400 text-sm tracking-widest uppercase mb-2">What People Are Saying</p>
              <h2 className="section-title">Customer Love</h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white p-8 shadow-sm">
                  <div className="stars flex gap-0.5 mb-3">
                    {Array.from({ length: r.rating }).map((_, i) => (
                      <Star key={i} size={16} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-brown-600 text-sm leading-relaxed mb-4 italic">"{r.review_text}"</p>
                  <p className="text-brown-800 font-semibold text-sm">— {r.customer_name}</p>
                  {r.product_name && (
                    <p className="text-brown-400 text-xs mt-1">{r.product_name}</p>
                  )}
                </div>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link to="/reviews" className="btn-outline">Read All Reviews</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-brown-600 text-white text-center">
        <div className="max-w-2xl mx-auto px-4">
          <h2 className="font-serif text-3xl md:text-4xl font-bold mb-4">Ready to Order?</h2>
          <p className="text-cream-200 mb-8 text-lg">
            DM us on Instagram or Facebook, or send us a message to place your order.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="bg-white text-brown-700 px-8 py-3 font-medium tracking-widest uppercase text-sm hover:bg-cream-100 transition-colors">
              Contact Us
            </Link>
            <a
              href="https://instagram.com/_crumbs.and.cream_"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-3 font-medium tracking-widest uppercase text-sm hover:bg-white hover:text-brown-700 transition-colors"
            >
              DM on Instagram
            </a>
            <a
              href="https://www.facebook.com/p/Crumbs-Cream-61577892432479"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white px-8 py-3 font-medium tracking-widest uppercase text-sm hover:bg-white hover:text-brown-700 transition-colors"
            >
              Follow on Facebook
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
