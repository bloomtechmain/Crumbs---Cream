import { Trash2 } from 'lucide-react';
import { formatPrice } from './orderSummary';

export default function CartLine({ item, emoji, onRemove, showLineTotal = true }) {
  return (
    <li className="flex items-center gap-2.5">
      <div className="w-10 h-10 flex-shrink-0 bg-cream-100 overflow-hidden">
        {item.image_url ? (
          <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-lg">{emoji}</div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-brown-700 truncate leading-tight">{item.name}</p>
        <p className="text-xs text-brown-400">{item.qty} × {formatPrice(item.price)}</p>
      </div>
      {showLineTotal && (
        <span className="text-sm font-medium text-brown-700 flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="text-brown-300 hover:text-red-500 transition-colors flex-shrink-0"
          aria-label={`Remove ${item.name}`}
        >
          <Trash2 size={14} />
        </button>
      )}
    </li>
  );
}
