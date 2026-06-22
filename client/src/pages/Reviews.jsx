import { useEffect, useState } from 'react';
import api from '../api/axios';

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews').then(r => setReviews(r.data)).finally(() => setLoading(false));
  }, []);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0;

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown-800 text-white text-center py-20 px-4">
        <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">What Customers Say</p>
        <h1 className="font-serif text-5xl font-bold mb-4">Reviews</h1>
        {reviews.length > 0 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <div className="flex">
              {[1,2,3,4,5].map(n => (
                <span key={n} className={n <= Math.round(avg) ? 'text-amber-400 text-2xl' : 'text-brown-500 text-2xl'}>★</span>
              ))}
            </div>
            <span className="text-cream-200 text-xl font-bold">{avg}</span>
            <span className="text-brown-300 text-sm">({reviews.length} reviews)</span>
          </div>
        )}
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h2 className="section-title mb-8">Customer Stories</h2>
        {loading ? (
          <p className="text-brown-400">Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <p className="text-brown-400">No reviews yet.</p>
        ) : (
          <div className="space-y-6">
            {reviews.map(r => (
              <div key={r.id} className="bg-white border border-brown-100 p-8 shadow-sm">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-brown-800 text-lg">{r.customer_name}</p>
                    {r.product_name && (
                      <p className="text-brown-400 text-sm">on {r.product_name}</p>
                    )}
                  </div>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={n <= r.rating ? 'text-amber-400' : 'text-brown-100'}>★</span>
                    ))}
                  </div>
                </div>
                <p className="text-brown-600 leading-relaxed italic">"{r.review_text}"</p>
                <p className="text-brown-300 text-xs mt-3">
                  {new Date(r.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
