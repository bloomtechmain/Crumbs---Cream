import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatPrice, mailtoLink, submitOrder } from './orderSummary';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function buildFullSummary({ name, fulfilment, email, phone, orderSummary, couponCode }) {
  return [
    `Name: ${name}`,
    `Fulfilment: ${fulfilment === 'pickup' ? 'Pickup' : 'Delivery'}`,
    `Email: ${email}`,
    `Phone: ${phone}`,
    '',
    orderSummary,
    ...(couponCode ? [`Coupon code: ${couponCode}`] : []),
  ].join('\n');
}

export default function OrderReviewModal({ open, onClose, total, boxes, couponCode, summary }) {
  const [name, setName] = useState('');
  const [fulfilment, setFulfilment] = useState('delivery');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | sent | error

  if (!open) return null;

  const trimmed = { name: name.trim(), email: email.trim(), phone: phone.trim() };
  const canSend = trimmed.name && trimmed.phone && EMAIL_RE.test(trimmed.email);

  const fullSummary = buildFullSummary({
    name: trimmed.name || '(not provided)',
    fulfilment,
    email: trimmed.email || '(not provided)',
    phone: trimmed.phone || '(not provided)',
    orderSummary: summary,
    couponCode,
  });

  const handleClose = () => {
    if (status === 'sending') return;
    onClose();
  };

  const handleSend = async () => {
    if (!canSend) return;
    setStatus('sending');
    try {
      // Coupon code is already folded into fullSummary above, so it isn't
      // passed again here — the worker would otherwise append it a second time.
      await submitOrder(fullSummary);
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  };

  // Rendered into document.body via a portal — a fixed/z-50 element nested
  // deep in the page can still get visually trapped under later siblings
  // (e.g. the footer ticker's `will-change: transform` establishes its own
  // stacking context), so escaping to body guarantees it always paints on top.
  return createPortal(
    <div
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-brown-100 sticky top-0 bg-white z-10">
          <h3 className="font-serif text-xl font-bold text-brown-800">Review Your Order</h3>
          <button
            type="button"
            onClick={handleClose}
            className="text-brown-400 hover:text-brown-700 transition-colors"
            aria-label="Close"
          >
            <X size={22} />
          </button>
        </div>

        {status === 'sent' ? (
          <div className="p-6">
            <p className="flex items-center justify-center gap-2 text-green-700 bg-green-50 border border-green-200 px-4 py-3 text-sm font-medium">
              <CheckCircle2 size={18} /> Order sent! We'll be in touch to confirm.
            </p>
            <button type="button" onClick={onClose} className="btn-primary w-full text-center mt-4">
              Close
            </button>
          </div>
        ) : (
          <div className="p-6">
            {/* Final summary */}
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brown-500 mb-2">Order Summary</p>
              {boxes.length > 0 ? (
                <div className="bg-cream-50 border border-brown-100 divide-y divide-brown-100">
                  {boxes.map((box) => (
                    <div key={box.id} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-semibold uppercase tracking-wide text-brown-500">{box.label}</p>
                        <span className="text-xs font-semibold text-brown-600 whitespace-nowrap">
                          A${box.price.toFixed(2)}
                        </span>
                      </div>
                      <ul className="space-y-1">
                        {box.items.map((it) => (
                          <li key={it.id} className="flex items-baseline justify-between gap-3 text-sm text-brown-700">
                            <span>{it.qty} × {it.name}</span>
                            <span className="flex-1 border-b border-dotted border-brown-100" />
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ) : (
                <pre className="bg-cream-50 border border-brown-100 p-3 text-sm text-brown-700 whitespace-pre-wrap font-sans">
                  {summary}
                </pre>
              )}
              {couponCode && (
                <p className="text-brown-500 text-xs mt-2">Coupon code: <span className="font-medium">{couponCode}</span></p>
              )}
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-brown-100">
                <span className="font-serif font-bold text-brown-800">Estimated Total</span>
                <span className="text-xl font-bold text-brown-700">
                  {typeof total === 'number' ? formatPrice(total) : total}
                </span>
              </div>
            </div>

            {/* Customer details */}
            <div className="space-y-4 mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-brown-500">Your Details</p>

              <div>
                <label className="block text-sm font-semibold text-brown-700 mb-1">Name *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700 focus:outline-none focus:border-brown-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brown-700 mb-1">Delivery or Pickup *</label>
                <div className="flex gap-3">
                  {['delivery', 'pickup'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setFulfilment(opt)}
                      className={`flex-1 px-3 py-2.5 text-sm font-medium uppercase tracking-wide border transition-colors capitalize ${
                        fulfilment === opt
                          ? 'bg-brown-600 text-white border-brown-600'
                          : 'border-brown-200 text-brown-600 hover:bg-brown-50'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-brown-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700 focus:outline-none focus:border-brown-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brown-700 mb-1">Phone Number *</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="04xx xxx xxx"
                  className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700 focus:outline-none focus:border-brown-500"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSend}
              disabled={!canSend || status === 'sending'}
              className="btn-primary w-full text-center flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === 'sending' && <Loader2 size={16} className="animate-spin" />}
              {status === 'sending' ? 'Sending…' : 'Confirm & Send Order'}
            </button>

            {status === 'error' && (
              <div className="mt-3 text-sm text-red-600 flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                  Couldn't send automatically.{' '}
                  <a href={mailtoLink('New Order — Crumbs & Cream', fullSummary)} className="underline font-medium">
                    Email us directly instead
                  </a>.
                </span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}
