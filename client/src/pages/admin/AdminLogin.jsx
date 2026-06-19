import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock } from 'lucide-react';

export default function AdminLogin() {
  const [form, setForm]     = useState({ username: '', password: '' });
  const [error, setError]   = useState('');
  const { login, loading }  = useAuth();
  const navigate            = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const result = await login(form.username, form.password);
    if (result.success) navigate('/admin');
    else setError(result.error);
  };

  return (
    <div className="min-h-screen bg-brown-900 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md shadow-2xl">
        {/* Header */}
        <div className="bg-brown-700 text-white text-center py-10 px-6">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-brown-700 font-serif font-bold text-xl">C&C</span>
          </div>
          <h1 className="font-serif text-2xl font-bold">Crumbs & Cream</h1>
          <p className="text-brown-200 text-sm mt-1 tracking-widest uppercase">Admin Panel</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Username</label>
            <input
              type="text"
              required
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              className="w-full border border-brown-200 px-4 py-3 focus:outline-none focus:border-brown-500 text-brown-800"
              placeholder="admin"
              autoFocus
            />
          </div>
          <div>
            <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Password</label>
            <input
              type="password"
              required
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              className="w-full border border-brown-200 px-4 py-3 focus:outline-none focus:border-brown-500 text-brown-800"
              placeholder="••••••••"
            />
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brown-600 text-white py-3 font-medium tracking-widest uppercase text-sm hover:bg-brown-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
          >
            <Lock size={16} />
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <p className="text-center text-brown-400 text-xs">
            Default: admin / password
          </p>
        </form>
      </div>
    </div>
  );
}
