import { useEffect, useState } from 'react';
import { Plus, Trash2, X, Upload } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

const TAGS = ['Cookies', 'Brownies', 'Cupcakes', 'Custom Orders', 'Events', 'Seasonal', 'Behind the Scenes'];

export default function AdminGallery() {
  const [images, setImages]     = useState([]);
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState({ caption: '', tag: '', sort_order: 0 });
  const [file, setFile]         = useState(null);
  const [preview, setPreview]   = useState(null);
  const [saving, setSaving]     = useState(false);

  const load = () => api.get('/gallery').then(r => setImages(r.data));
  useEffect(() => { load(); }, []);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setFile(f);
    if (f) setPreview(URL.createObjectURL(f));
  };

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select an image');
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', form.caption);
      fd.append('tag', form.tag);
      fd.append('sort_order', form.sort_order);
      await api.post('/gallery', fd);
      toast.success('Photo uploaded!');
      setModal(false);
      setFile(null);
      setPreview(null);
      setForm({ caption: '', tag: '', sort_order: 0 });
      load();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Upload failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (img) => {
    if (!confirm('Delete this photo?')) return;
    try {
      await api.delete(`/gallery/${img.id}`);
      toast.success('Photo deleted');
      load();
    } catch { toast.error('Delete failed'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gallery</h1>
          <p className="text-gray-500 text-sm">{images.length} photos</p>
        </div>
        <button onClick={() => setModal(true)} className="flex items-center gap-2 bg-brown-600 text-white px-5 py-2.5 text-sm font-medium hover:bg-brown-700 rounded">
          <Upload size={16} /> Upload Photo
        </button>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-20 bg-white border border-gray-200 rounded-lg">
          <div className="text-5xl mb-4">📸</div>
          <p className="text-gray-500">No photos yet. Upload your first creation!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {images.map(img => (
            <div key={img.id} className="group relative aspect-square bg-gray-100 rounded overflow-hidden">
              <img src={`http://localhost:5000${img.image_url}`} alt={img.caption || ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                <button
                  onClick={() => handleDelete(img)}
                  className="opacity-0 group-hover:opacity-100 bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              {img.tag && (
                <span className="absolute bottom-1 left-1 text-white text-xs bg-black bg-opacity-60 px-1.5 py-0.5 rounded">
                  {img.tag}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-lg shadow-xl">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-800">Upload Photo</h2>
              <button onClick={() => { setModal(false); setFile(null); setPreview(null); }} className="p-1 hover:bg-gray-100 rounded">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAdd} className="p-5 space-y-4">
              <div
                className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center cursor-pointer hover:border-brown-400 transition-colors"
                onClick={() => document.getElementById('gallery-file').click()}
              >
                {preview ? (
                  <img src={preview} alt="Preview" className="max-h-40 mx-auto rounded object-contain" />
                ) : (
                  <>
                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-500 text-sm">Click to select an image</p>
                    <p className="text-gray-400 text-xs mt-1">JPG, PNG, WebP up to 10MB</p>
                  </>
                )}
                <input id="gallery-file" type="file" accept="image/*" onChange={handleFile} className="hidden" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Caption</label>
                <input value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
                  placeholder="Describe this photo..."
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400" />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-1">Tag</label>
                <select value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}
                  className="w-full border border-gray-200 rounded px-3 py-2 text-sm focus:outline-none focus:border-brown-400">
                  <option value="">No tag</option>
                  {TAGS.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => { setModal(false); setFile(null); setPreview(null); }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2.5 text-sm rounded hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={saving || !file}
                  className="flex-1 bg-brown-600 text-white py-2.5 text-sm rounded hover:bg-brown-700 disabled:opacity-50">
                  {saving ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
