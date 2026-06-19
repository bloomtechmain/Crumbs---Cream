import { useEffect, useState } from 'react';
import api from '../api/axios';
import { imageUrl } from '../api/imageUrl';

const CATEGORY_EMOJI = { cookies: '🍪', brownies: '🍫', cupcakes: '🧁', pastries: '🥐' };

export default function Products() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts]     = useState([]);
  const [active, setActive]         = useState('all');
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/categories'),
      api.get('/products'),
    ]).then(([cat, prod]) => {
      setCategories(cat.data);
      setProducts(prod.data);
    }).finally(() => setLoading(false));
  }, []);

  const filtered = active === 'all'
    ? products
    : products.filter(p => p.category_slug === active);

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown-800 text-white text-center py-20 px-4">
        <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Baked Fresh to Order</p>
        <h1 className="font-serif text-5xl font-bold mb-4">Our Products</h1>
        <p className="text-brown-200 max-w-xl mx-auto">
          Homemade pastries, cookies, brownies and cupcakes — all made from scratch with premium ingredients.
        </p>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b border-brown-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-1 scrollbar-hide">
            <button
              onClick={() => setActive('all')}
              className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors ${
                active === 'all' ? 'bg-brown-600 text-white' : 'text-brown-500 hover:text-brown-700 hover:bg-brown-50'
              }`}
            >
              All
            </button>
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => setActive(c.slug)}
                className={`flex-shrink-0 px-6 py-3 text-sm font-medium uppercase tracking-widest transition-colors flex items-center gap-2 ${
                  active === c.slug ? 'bg-brown-600 text-white' : 'text-brown-500 hover:text-brown-700 hover:bg-brown-50'
                }`}
              >
                <span>{CATEGORY_EMOJI[c.slug] || '🍰'}</span> {c.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="text-center py-20 text-brown-400">Loading products...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-brown-400">No products found.</div>
        ) : (
          <>
            {/* Group by category when viewing all */}
            {active === 'all' ? (
              categories.map(cat => {
                const items = filtered.filter(p => p.category_slug === cat.slug);
                if (!items.length) return null;
                return (
                  <div key={cat.id} className="mb-16">
                    <div className="flex items-center gap-3 mb-8">
                      <span className="text-3xl">{CATEGORY_EMOJI[cat.slug]}</span>
                      <div>
                        <h2 className="font-serif text-2xl font-bold text-brown-700">{cat.name}</h2>
                        <p className="text-brown-400 text-sm">{cat.description}</p>
                      </div>
                      <div className="flex-1 h-px bg-brown-100 ml-4" />
                    </div>
                    <ProductGrid items={items} />
                  </div>
                );
              })
            ) : (
              <ProductGrid items={filtered} />
            )}
          </>
        )}
      </div>

      {/* Order CTA */}
      <div className="bg-cream-100 py-16 text-center px-4">
        <h2 className="font-serif text-3xl font-bold text-brown-700 mb-3">Want a Custom Order?</h2>
        <p className="text-brown-500 mb-8 max-w-lg mx-auto">
          Planning a birthday, baby shower or special event? We'd love to create something unique just for you.
        </p>
        <a
          href="/contact"
          className="btn-primary"
        >
          Get in Touch
        </a>
      </div>
    </div>
  );
}

function ProductGrid({ items }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map(p => (
        <div key={p.id} className="card group overflow-hidden">
          <div className="aspect-square overflow-hidden bg-cream-100">
            {p.image_url ? (
              <img
                src={imageUrl(p.image_url)}
                alt={p.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-brown-50">
                <span className="text-6xl">{CATEGORY_EMOJI[p.category_slug] || '🍰'}</span>
              </div>
            )}
          </div>
          {p.is_seasonal && (
            <div className="bg-brown-500 text-white text-xs text-center py-1 tracking-widest uppercase">
              Seasonal Special
            </div>
          )}
          <div className="p-5">
            <p className="text-xs text-brown-400 uppercase tracking-widest mb-1">{p.category_name}</p>
            <h3 className="font-serif text-base font-semibold text-brown-800 mb-2 leading-snug">{p.name}</h3>
            <p className="text-brown-500 text-sm mb-4 line-clamp-2 leading-relaxed">{p.description}</p>
            <div className="flex items-center justify-between">
              <span className="text-brown-700 font-bold text-xl">${parseFloat(p.price).toFixed(2)}</span>
              <span className={`text-xs px-2 py-1 rounded-full ${p.is_available ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                {p.is_available ? 'Available' : 'Unavailable'}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
