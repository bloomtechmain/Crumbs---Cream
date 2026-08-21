import { useState, useMemo } from 'react';
import QuantityStepper from './QuantityStepper';
import OrderSummaryFooter from './OrderSummaryFooter';

const MIN_QTY = 12;

export default function CustomDesignForm() {
  const [quantity, setQuantity] = useState(MIN_QTY);
  const [occasion, setOccasion] = useState('');
  const [details, setDetails] = useState('');
  const [date, setDate] = useState('');

  const ready = occasion.trim().length > 0 && details.trim().length > 0;

  const summary = useMemo(() => {
    if (!ready) return '';
    return [
      `Hi! I'd like to request a quote for custom sugar cookies:`,
      `Quantity: ${quantity}`,
      `Occasion: ${occasion}`,
      `Design details: ${details}`,
      date ? `Preferred date: ${date}` : null,
      `(I'll send reference photos separately via email or Instagram)`,
    ].filter(Boolean).join('\n');
  }, [ready, quantity, occasion, details, date]);

  return (
    <div>
      <h3 className="font-serif text-2xl font-bold text-brown-800 mb-1">Custom Sugar Cookies</h3>
      <p className="text-brown-400 text-sm mb-6">
        Minimum order of {MIN_QTY}. Tell us what you're after and we'll send a quote — feel free to
        send reference photos via email or Instagram once you reach out.
      </p>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-brown-700 mb-1">Quantity (min. {MIN_QTY})</label>
        <QuantityStepper value={quantity} onChange={setQuantity} min={MIN_QTY} step={6} />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-brown-700 mb-1">Occasion *</label>
        <input
          value={occasion}
          onChange={e => setOccasion(e.target.value)}
          placeholder="e.g. Baby shower, birthday, corporate event"
          className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700"
        />
      </div>

      <div className="mb-5">
        <label className="block text-sm font-semibold text-brown-700 mb-1">Design details *</label>
        <textarea
          value={details}
          onChange={e => setDetails(e.target.value)}
          rows={4}
          placeholder="Colours, theme, wording — anything you'd like on the cookies"
          className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-semibold text-brown-700 mb-1">Preferred date (optional)</label>
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="w-full border border-brown-200 rounded-sm px-3 py-2.5 text-brown-700"
        />
      </div>

      <OrderSummaryFooter
        total="Quote on request"
        summary={summary}
        ready={ready}
        note="Fill in the occasion and design details above to see your request summary."
      />
    </div>
  );
}
