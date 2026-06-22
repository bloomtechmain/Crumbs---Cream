import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2, Plus, X } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { customer_name: '', rating: 5, review_text: '', product_name: '' };

export default function AdminReviews() {
  const [reviews, setReviews]   = useState([]);
  const [tab, setTab]           = useState('pending');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm]         = useState(EMPTY);
  const [saving, setSaving]     = useState(false);

  const load = () => api.get('/reviews/all').then(r => setReviews(r.data));
  useEffect(() => { load(); }, []);

  const approve = async (id) => {
    try { await api.patch(`/reviews/${id}/approve`); toast.success('Review approved'); load(); }
    catch { toast.error('Failed'); }
  };
  const reject = async (id) => {
    try { await api.patch(`/reviews/${id}/reject`); toast.success('Review hidden'); load(); }
    catch { toast.error('Failed'); }
  };
  const remove = async (r) => {
    if (!confirm(`Delete review by ${r.customer_name}?`)) return;
    try { await api.delete(`/reviews/${r.id}`); toast.success('Deleted'); load(); }
    catch { toast.error('Failed'); }
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/reviews/admin', form);
      toast.success('Review added and published');
      setForm(EMPTY);
      setShowForm(false);
      setTab('approved');
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to add review');
    } finally {
      setSaving(false);
    }
  };

  const pending  = reviews.filter(r => !r.is_approved);
  const approved = reviews.filter(r => r.is_approved);
  const shown    = tab === 'pending' ? pending : approved;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Reviews</h1>
          <p className="text-gray-500 text-sm">{pending.length} pending approval</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-brown-600 text-white px-4 py-2 text-sm font-medium rounded hover:bg-brown-700 transition-colors"
        >
          <Plus size={16} /> Add Review
        </button>
      </div>

      {/* Add Review Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">Add Review Manually</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Customer Name *</label>
                <input
                  type="text" required
                  value={form.customer_name}
                  onChange={e => setForm(f => ({ ...f, customer_name: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-brown-500"
                  placeholder="Sarah M."
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Rating *</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(n => (
                    <button
                      key={n} type="button"
                      onClick={() => setForm(f => ({ ...f, rating: n }))}
                      className="text-2xl transition-transform hover:scale-110"
                    >
                      <span className={form.rating >= n ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Product (optional)</label>
                <input
                  type="text"
                  value={form.product_name}
                  onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-brown-500"
                  placeholder="Ferrero Rocher Cookie"
                />
              </div>
              <div>
                <label className="block text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Review *</label>
                <textarea
                  required rows={4}
                  value={form.review_text}
                  onChange={e => setForm(f => ({ ...f, review_text: e.target.value }))}
                  className="w-full border border-gray-200 px-3 py-2 text-sm rounded focus:outline-none focus:border-brown-500 resize-none"
                  placeholder="Tell us about your experience..."
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2 text-sm rounded hover:bg-gray-50">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-brown-600 text-white py-2 text-sm rounded hover:bg-brown-700 disabled:opacity-60">
                  {saving ? 'Adding...' : 'Add & Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
        <button onClick={() => setTab('pending')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'pending' ? 'bg-white shadow text-brown-700' : 'text-gray-500 hover:text-gray-700'}`}>
          Pending {pending.length > 0 && <span className="ml-1.5 bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">{pending.length}</span>}
        </button>
        <button onClick={() => setTab('approved')}
          className={`px-5 py-2 text-sm font-medium rounded-md transition-colors ${tab === 'approved' ? 'bg-white shadow text-brown-700' : 'text-gray-500 hover:text-gray-700'}`}>
          Live ({approved.length})
        </button>
      </div>

      <div className="space-y-4">
        {shown.length === 0 ? (
          <div className="text-center py-12 bg-white border border-gray-200 rounded-lg text-gray-400">
            {tab === 'pending' ? 'No reviews awaiting approval.' : 'No approved reviews yet.'}
          </div>
        ) : shown.map(r => (
          <div key={r.id} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <span className="font-semibold text-gray-800">{r.customer_name}</span>
                  <div className="flex">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className={n <= r.rating ? 'text-amber-400' : 'text-gray-200'}>★</span>
                    ))}
                  </div>
                  {r.product_name && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{r.product_name}</span>}
                </div>
                <p className="text-gray-600 text-sm italic mb-2">"{r.review_text}"</p>
                <p className="text-gray-400 text-xs">{new Date(r.created_at).toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                {!r.is_approved && (
                  <button onClick={() => approve(r.id)} title="Approve"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 text-sm rounded hover:bg-green-100">
                    <CheckCircle size={16} /> Approve
                  </button>
                )}
                {r.is_approved && (
                  <button onClick={() => reject(r.id)} title="Hide"
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-sm rounded hover:bg-amber-100">
                    <XCircle size={16} /> Hide
                  </button>
                )}
                <button onClick={() => remove(r)} title="Delete"
                  className="p-1.5 text-red-500 hover:bg-red-50 rounded">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
