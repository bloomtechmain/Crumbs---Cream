import { useEffect, useState } from 'react';
import { Star, Send } from 'lucide-react';
import api from '../api/axios';
import toast from 'react-hot-toast';

function StarPicker({ value, onChange }) {
  const [hovered, setHovered] = useState(0);
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="text-2xl transition-transform hover:scale-110"
        >
          <span className={(hovered || value) >= n ? 'text-amber-400' : 'text-brown-200'}>★</span>
        </button>
      ))}
    </div>
  );
}

export default function Reviews() {
  const [reviews, setReviews]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ customer_name: '', rating: 0, review_text: '', product_name: '' });

  useEffect(() => {
    api.get('/reviews').then(r => setReviews(r.data)).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      await api.post('/reviews', form);
      toast.success('Thank you! Your review is pending approval.');
      setForm({ customer_name: '', rating: 0, review_text: '', product_name: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Reviews list */}
          <div className="lg:col-span-2">
            <h2 className="section-title mb-8">Customer Stories</h2>
            {loading ? (
              <p className="text-brown-400">Loading reviews...</p>
            ) : reviews.length === 0 ? (
              <p className="text-brown-400">No reviews yet. Be the first!</p>
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

          {/* Submit form */}
          <div>
            <div className="bg-cream-50 p-8 sticky top-28">
              <h3 className="font-serif text-2xl font-bold text-brown-700 mb-2">Leave a Review</h3>
              <p className="text-brown-400 text-sm mb-6">Share your Crumbs & Cream experience!</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={form.customer_name}
                    onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                    className="w-full border border-brown-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brown-500 bg-white"
                    placeholder="Sarah M."
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Rating *</label>
                  <StarPicker value={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">What did you try?</label>
                  <input
                    type="text"
                    value={form.product_name}
                    onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                    className="w-full border border-brown-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brown-500 bg-white"
                    placeholder="Ferrero Rocher Cookie"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Your Review *</label>
                  <textarea
                    required
                    rows={5}
                    value={form.review_text}
                    onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
                    className="w-full border border-brown-200 px-3 py-2.5 text-sm focus:outline-none focus:border-brown-500 bg-white resize-none"
                    placeholder="Tell us about your experience..."
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brown-600 text-white py-3 font-medium tracking-widest uppercase text-sm hover:bg-brown-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
                <p className="text-brown-300 text-xs text-center">Reviews are moderated before going live.</p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
