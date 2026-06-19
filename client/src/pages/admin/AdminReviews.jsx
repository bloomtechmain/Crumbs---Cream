import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Trash2 } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [tab, setTab]         = useState('pending');

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
      </div>

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
