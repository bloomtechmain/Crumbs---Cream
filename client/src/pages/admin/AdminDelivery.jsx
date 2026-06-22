import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const EMPTY = { suburb: '', postcode: '', delivery_fee: '0', is_available: true, min_order: '30' };

export default function AdminDelivery() {
  const [zones, setZones]   = useState([]);
  const [modal, setModal]   = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm]     = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/delivery/all').then(r => setZones(r.data));
  useEffect(() => { load(); }, []);

  const openNew  = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (z) => {
    setEditing(z);
    setForm({ suburb: z.suburb, postcode: z.postcode, delivery_fee: z.delivery_fee, is_available: z.is_available, min_order: z.min_order });
    setModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) await api.put(`/delivery/${editing.id}`, form);
      else         await api.post('/delivery', form);
      toast.success(editing ? 'Zone updated!' : 'Zone added!');
      setModal(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (z) => {
    if (!confirm(`Remove ${z.suburb}?`)) return;
    try { await api.delete(`/delivery/${z.id}`); toast.success('Zone removed'); load(); }
    catch { toast.error('Delete failed'); }
  };

  const toggleAvail = async (z) => {
    try {
      await api.put(`/delivery/${z.id}`, { ...z, is_available: !z.is_available });
      load();
    } catch { toast.error('Update failed'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Delivery Zones</h1>
          <p className="text-gray-500 text-sm">{zones.filter(z => z.is_available).length} active zones</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-2 bg-brown-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brown-700 rounded">
          <Plus size={16} /> Add Zone
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Suburb</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Postcode</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Min. Order</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Delivery Fee</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {zones.map(z => (
              <tr key={z.id} className={`hover:bg-gray-50 ${!z.is_available ? 'opacity-50' : ''}`}>
                <td className="px-6 py-3 font-medium text-gray-800 text-sm">{z.suburb}</td>
                <td className="px-6 py-3 text-gray-500 text-sm">{z.postcode}</td>
                <td className="px-6 py-3 text-gray-700 text-sm">A${parseFloat(z.min_order).toFixed(2)}</td>
                <td className="px-6 py-3 text-sm font-medium">
                  {parseFloat(z.delivery_fee) === 0
                    ? <span className="text-green-600">FREE</span>
                    : <span className="text-gray-700">A${parseFloat(z.delivery_fee).toFixed(2)}</span>}
                </td>
                <td className="px-6 py-3">
                  <button onClick={() => toggleAvail(z)} className={`flex items-center gap-1 text-sm ${z.is_available ? 'text-green-600' : 'text-gray-400'}`}>
                    {z.is_available ? <ToggleRight size={20} /> : <ToggleLeft size={20} />}
                    {z.is_available ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <button onClick={() => openEdit(z)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"><Edit2 size={15} /></button>
                    <button onClick={() => handleDelete(z)} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash2 size={15} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {zones.length === 0 && <div className="text-center py-12 text-gray-400">No zones added yet.</div>}
      </div>

      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="font-bold text-gray-800">{editing ? 'Edit Zone' : 'Add Delivery Zone'}</h2>
              <button onClick={() => setModal(false)} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Suburb *</label>
                  <input required value={form.suburb} onChange={e => setForm(f => ({ ...f, suburb: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Postcode *</label>
                  <input required value={form.postcode} onChange={e => setForm(f => ({ ...f, postcode: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Delivery Fee (A$)</label>
                  <input type="number" step="0.01" min="0" value={form.delivery_fee} onChange={e => setForm(f => ({ ...f, delivery_fee: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Min. Order (A$)</label>
                  <input type="number" step="0.01" min="0" value={form.min_order} onChange={e => setForm(f => ({ ...f, min_order: e.target.value }))}
                    className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_available} onChange={e => setForm(f => ({ ...f, is_available: e.target.checked }))}
                  className="w-4 h-4 text-brown-600" />
                <span className="text-sm text-gray-700">Zone is active</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(false)} className="flex-1 border border-gray-300 text-gray-700 py-2.5 text-sm rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving} className="flex-1 bg-brown-600 text-white py-2.5 text-sm rounded hover:bg-brown-700 disabled:opacity-60">
                  {saving ? 'Saving...' : (editing ? 'Save Changes' : 'Add Zone')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
