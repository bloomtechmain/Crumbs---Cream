import { useState } from 'react';
import { MapPin, Mail, Clock, Send, Phone } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import FacebookIcon from '../components/FacebookIcon';
import api from '../api/axios';
import toast from 'react-hot-toast';

const SUBJECTS = [
  'General Inquiry',
  'Custom Order',
  'Delivery Question',
  'Pricing',
  'Feedback',
  'Other',
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const update = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post('/contacts', form);
      setSent(true);
      toast.success('Message sent! We\'ll be in touch soon.');
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown-800 text-white text-center py-20 px-4">
        <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Get in Touch</p>
        <h1 className="font-serif text-5xl font-bold mb-4">Contact Us</h1>
        <p className="text-brown-200 max-w-xl mx-auto">
          Ready to place an order or have a question? We'd love to hear from you!
        </p>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-16">
          {/* Contact Info */}
          <div>
            <h2 className="section-title mb-8">Let's Connect</h2>
            <div className="space-y-6 mb-10">
              {[
                {
                  icon: MapPin,
                  title: 'Location',
                  lines: ['South East Melbourne', 'Victoria, Australia'],
                },
                {
                  icon: Phone,
                  title: 'Phone / WhatsApp',
                  lines: ['+61 431 879 184'],
                  link: 'tel:+61431879184',
                },
                {
                  icon: InstagramIcon,
                  title: 'Instagram',
                  lines: ['@_crumbs.and.cream_', 'DM us to order!'],
                  link: 'https://instagram.com/_crumbs.and.cream_',
                },
                {
                  icon: FacebookIcon,
                  title: 'Facebook',
                  lines: ['Crumbs & Cream', 'Follow us for updates!'],
                  link: 'https://www.facebook.com/p/Crumbs-Cream-61577892432479',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  lines: ['hello@crumbsandcream.com.au'],
                },
                {
                  icon: Clock,
                  title: 'Response Time',
                  lines: ['We typically reply within 24 hours', 'Mon – Sun'],
                },
              ].map(({ icon: Icon, title, lines, link }) => (
                <div key={title} className="flex gap-4">
                  <div className="w-12 h-12 bg-brown-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Icon size={20} className="text-brown-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-brown-800 mb-1">{title}</p>
                    {lines.map((line, i) => link && i === 0 ? (
                      <a key={i} href={link} target="_blank" rel="noopener noreferrer"
                        className="text-brown-500 text-sm hover:text-brown-700 block">{line}</a>
                    ) : (
                      <p key={i} className="text-brown-500 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order info box */}
            <div className="bg-cream-100 border border-cream-200 p-6">
              <h3 className="font-serif text-xl font-bold text-brown-700 mb-2">Placing an Order</h3>
              <p className="text-brown-500 text-sm leading-relaxed mb-3">
                Use the form to send your order enquiry. Please include:
              </p>
              <ul className="space-y-1 text-brown-500 text-sm">
                {[
                  'Products and quantities you\'d like',
                  'Desired delivery date',
                  'Delivery suburb / pickup preference',
                  'Any dietary requirements or custom requests',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brown-400 mt-0.5">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Google Maps */}
            <div className="mt-8">
              <iframe
                src="https://maps.google.com/maps?q=South+East+Melbourne+Victoria+Australia&t=&z=11&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Crumbs & Cream Location"
                className="w-full"
              />
            </div>
          </div>

          {/* Form */}
          <div>
            {sent ? (
              <div className="bg-green-50 border border-green-200 p-10 text-center h-full flex flex-col items-center justify-center">
                <div className="text-5xl mb-4">🎉</div>
                <h3 className="font-serif text-2xl font-bold text-green-700 mb-2">Message Sent!</h3>
                <p className="text-green-600 mb-6">Thank you for reaching out. We'll get back to you within 24 hours.</p>
                <button
                  onClick={() => setSent(false)}
                  className="btn-outline border-green-600 text-green-600 hover:bg-green-600 hover:text-white"
                >
                  Send Another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Name *</label>
                    <input type="text" required value={form.name} onChange={update('name')}
                      className="w-full border border-brown-200 px-3 py-3 text-sm focus:outline-none focus:border-brown-500 bg-white"
                      placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Phone</label>
                    <input type="tel" value={form.phone} onChange={update('phone')}
                      className="w-full border border-brown-200 px-3 py-3 text-sm focus:outline-none focus:border-brown-500 bg-white"
                      placeholder="04xx xxx xxx" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Email *</label>
                  <input type="email" required value={form.email} onChange={update('email')}
                    className="w-full border border-brown-200 px-3 py-3 text-sm focus:outline-none focus:border-brown-500 bg-white"
                    placeholder="your@email.com" />
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Subject</label>
                  <select value={form.subject} onChange={update('subject')}
                    className="w-full border border-brown-200 px-3 py-3 text-sm focus:outline-none focus:border-brown-500 bg-white text-brown-600">
                    <option value="">Select a topic...</option>
                    {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium uppercase tracking-wider text-brown-600 mb-1">Message *</label>
                  <textarea required rows={6} value={form.message} onChange={update('message')}
                    className="w-full border border-brown-200 px-3 py-3 text-sm focus:outline-none focus:border-brown-500 bg-white resize-none"
                    placeholder="Tell us what you'd like to order or ask us anything..." />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-brown-600 text-white py-4 font-medium tracking-widest uppercase text-sm hover:bg-brown-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
