import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, X } from 'lucide-react';
import api from '../../api/axios';
import { imageUrl } from '../../api/imageUrl';
import toast from 'react-hot-toast';

const EMPTY = { name: '', description: '', price: '', category_id: '', image_url: '', is_available: true, is_featured: false, is_seasonal: false, sort_order: 0 };

export default function AdminProducts() {
  const [products, setProducts]     = useState([]);
  const [categories, setCategories] = useState([]);
  const [modal, setModal]           = useState(false);
  const [editing, setEditing]       = useState(null);
  const [form, setForm]             = useState(EMPTY);
  const [imageFile, setImageFile]   = useState(null);
  const [saving, setSaving]         = useState(false);
  const [filter, setFilter]         = useState('all');

  const load = () => Promise.all([api.get('/products/all'), api.get('/categories')]).then(([p, c]) => {
    setProducts(p.data); setCategories(c.data);
  });

  useEffect(() => { load(); }, []);

  const openNew = () => { setEditing(null); setForm(EMPTY); setImageFile(null); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ name: p.name, description: p.description || '', price: p.price, category_id: p.category_id || '', image_url: p.image_url || '', is_available: p.is_available, is_featured: p.is_featured, is_seasonal: p.is_seasonal, sort_order: p.sort_order });
    setImageFile(null);
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);
      if (editing) await api.put(`/products/${editing.id}`, fd);
      else         await api.post('/products', fd);
      toast.success(editing ? 'Product updated!' : 'Product added!');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleAvailability = async (p) => {
    try {
      await api.patch(`/products/${p.id}/availability`, { is_available: !p.is_available });
      toast.success(`${p.name} is now ${!p.is_available ? 'available' : 'unavailable'}`);
      load();
    } catch { toast.error('Update failed'); }
  };

  const handleDelete = async (p) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await api.delete(`/products/${p.id}`);
      toast.success('Product deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  const filtered = filter === 'all' ? products : products.filter(p => p.category_slug === filter);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} items</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brown-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brown-700 transition-colors rounded">
          <Plus size={16} /> Add Product
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === 'all' ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>All</button>
        {categories.map(c => (
          <button key={c.id} onClick={() => setFilter(c.slug)} className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap ${filter === c.slug ? 'bg-brown-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{c.name}</button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Product</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Category</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Price</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded flex-shrink-0 overflow-hidden">
                      {p.image_url ? (
                        <img src={imageUrl(p.image_url)} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-lg">🍰</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{p.name}</p>
                      {p.is_featured && <span className="text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">Featured</span>}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500 capitalize">{p.category_name || '—'}</td>
                <td className="px-6 py-4 text-sm font-bold text-gray-800">${parseFloat(p.price).toFixed(2)}</td>
                <td className="px-6 py-4">
                  <button onClick={() => toggleAvailability(p)} className={`flex items-center gap-1.5 text-sm font-medium ${p.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                    {p.is_available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {p.is_available ? 'Available' : 'Hidden'}
                  </button>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(p)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete"><Trash2 size={16} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="text-center py-12 text-gray-400">No products found.</div>
        )}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-lg font-bold text-gray-800">{editing ? 'Edit Product' : 'Add Product'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Name *</label>
                <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Price (AUD) *</label>
                  <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Category</label>
                  <select value={form.category_id} onChange={e => setForm(f => ({ ...f, category_id: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400">
                    <option value="">Select...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Description</label>
                <textarea rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Product Image</label>
                <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files[0])}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-sm file:bg-brown-50 file:text-brown-700 hover:file:bg-brown-100" />
                {editing?.image_url && !imageFile && (
                  <p className="text-xs text-gray-400 mt-1">Current image kept unless new one uploaded</p>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'is_available', label: 'Available' },
                  { key: 'is_featured',  label: 'Featured'  },
                  { key: 'is_seasonal',  label: 'Seasonal'  },
                ].map(({ key, label }) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.checked }))}
                      className="w-4 h-4 rounded border-gray-300 text-brown-600 focus:ring-brown-500" />
                    <span className="text-sm text-gray-700">{label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 text-sm rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brown-600 text-white py-2.5 text-sm rounded hover:bg-brown-700 disabled:opacity-60">
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add Product')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
