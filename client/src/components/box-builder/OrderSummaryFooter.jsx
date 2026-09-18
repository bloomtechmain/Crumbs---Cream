import { useState } from 'react';
import OrderReviewModal from './OrderReviewModal';

export default function OrderSummaryFooter({ total, summary, boxes, ready, note }) {
  const [couponCode, setCouponCode] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const trimmedCoupon = couponCode.trim();

  return (
    <div className="bg-cream-50 border border-cream-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="font-serif text-lg font-bold text-brown-800">Estimated Total</span>
        <span className="text-2xl font-bold text-brown-700">
          {typeof total === 'number' ? `A$${total.toFixed(2)}` : total}
        </span>
      </div>
      {!ready && (
        <p className="text-brown-400 text-sm">{note || 'Finish your selection to see the order summary.'}</p>
      )}
      {ready && (
        <>
          {boxes && boxes.length > 0 && (
          <div className="bg-white border border-brown-100 divide-y divide-brown-100 mb-4">
            {boxes.map(box => (
              <div key={box.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-brown-500">
                    {box.label}
                  </p>
                  <span className="text-xs font-semibold text-brown-600 whitespace-nowrap">
                    A${box.price.toFixed(2)}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {box.items.map(it => (
                    <li key={it.id} className="flex items-baseline justify-between gap-3 text-sm text-brown-700">
                      <span>{it.qty} × {it.name}</span>
                      <span className="flex-1 border-b border-dotted border-brown-100" />
                      {!box.fixedPrice && (
                        <span className="text-brown-400 whitespace-nowrap">
                          A${(it.price * it.qty).toFixed(2)}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          )}
          <div className="mb-4">
            <label htmlFor="coupon-code" className="block text-xs font-semibold uppercase tracking-wide text-brown-500 mb-1.5">
              Coupon Code (optional)
            </label>
            <input
              id="coupon-code"
              type="text"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              placeholder="Enter code"
              className="w-full border border-brown-200 px-3 py-2 text-sm text-brown-700 focus:outline-none focus:border-brown-500"
            />
            <p className="text-brown-400 text-xs mt-1.5">
              We'll apply your code when we confirm your order.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="btn-primary w-full text-center"
          >
            Review Order
          </button>

          <OrderReviewModal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            total={total}
            boxes={boxes || []}
            couponCode={trimmedCoupon}
            summary={summary}
          />
        </>
      )}
    </div>
  );
}
