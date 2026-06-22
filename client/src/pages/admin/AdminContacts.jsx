import { useEffect, useState } from 'react';
import { Mail, MailOpen, Trash2, Phone } from 'lucide-react';
import api from '../../api/axios';
import toast from 'react-hot-toast';

export default function AdminContacts() {
  const [contacts, setContacts] = useState([]);
  const [expanded, setExpanded] = useState(null);

  const load = () => api.get('/contacts').then(r => setContacts(r.data));
  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    try { await api.patch(`/contacts/${id}/read`); load(); }
    catch { toast.error('Failed'); }
  };

  const remove = async (c) => {
    if (!confirm(`Delete inquiry from ${c.name}?`)) return;
    try { await api.delete(`/contacts/${c.id}`); toast.success('Deleted'); if (expanded === c.id) setExpanded(null); load(); }
    catch { toast.error('Failed'); }
  };

  const handleExpand = (id) => {
    setExpanded(expanded === id ? null : id);
    const c = contacts.find(c => c.id === id);
    if (c && !c.is_read) markRead(id);
  };

  const unread = contacts.filter(c => !c.is_read).length;

  return (
    <div className="p-4 sm:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Customer Inquiries</h1>
        <p className="text-gray-500 text-sm">{unread > 0 ? `${unread} unread` : 'All caught up!'}</p>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {contacts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">No inquiries yet.</div>
        ) : contacts.map(c => (
          <div key={c.id} className={`border-b border-gray-100 last:border-0 ${!c.is_read ? 'bg-blue-50' : ''}`}>
            <div
              className="flex items-center gap-3 px-3 sm:px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => handleExpand(c.id)}
            >
              <div className="flex-shrink-0 text-gray-400">
                {c.is_read ? <MailOpen size={18} /> : <Mail size={18} className="text-blue-500" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`font-medium text-sm ${!c.is_read ? 'text-gray-900' : 'text-gray-700'}`}>{c.name}</span>
                  {c.subject && <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{c.subject}</span>}
                  {!c.is_read && <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded font-medium">New</span>}
                </div>
                <p className="text-xs text-gray-500 mt-0.5 truncate">{c.email}</p>
              </div>
              <div className="text-xs text-gray-400 flex-shrink-0">
                {new Date(c.created_at).toLocaleDateString('en-AU', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <button onClick={e => { e.stopPropagation(); remove(c); }} className="p-1.5 text-red-400 hover:bg-red-50 rounded flex-shrink-0">
                <Trash2 size={15} />
              </button>
            </div>
            {expanded === c.id && (
              <div className="px-3 sm:px-6 pb-5 bg-white border-t border-gray-100">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 mt-4 text-sm">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Email</p>
                    <a href={`mailto:${c.email}`} className="text-blue-600 hover:underline">{c.email}</a>
                  </div>
                  {c.phone && (
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Phone</p>
                      <a href={`tel:${c.phone}`} className="text-blue-600 hover:underline flex items-center gap-1"><Phone size={13} />{c.phone}</a>
                    </div>
                  )}
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider mb-0.5">Received</p>
                    <p className="text-gray-700">{new Date(c.created_at).toLocaleString('en-AU')}</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded p-4 text-sm text-gray-700 leading-relaxed">
                  <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Message</p>
                  {c.message}
                </div>
                <a href={`mailto:${c.email}?subject=Re: ${c.subject || 'Your Inquiry'}`}
                  className="mt-3 inline-flex items-center gap-2 text-sm bg-brown-600 text-white px-4 py-2 rounded hover:bg-brown-700 transition-colors">
                  <Mail size={15} /> Reply via Email
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
