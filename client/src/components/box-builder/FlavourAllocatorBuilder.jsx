import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { Star } from 'lucide-react';
import QuantityStepper from './QuantityStepper';
import { formatPrice } from './orderSummary';

const FlavourAllocatorBuilder = forwardRef(function FlavourAllocatorBuilder(
  { title, subtitle, unitLabel, sizes, flavours, emoji, onCommit, onPendingChange, priceOverride, tierGroups, allowPartial = false },
  ref
) {
  const [size, setSize] = useState(sizes[0]);
  const [allocation, setAllocation] = useState({});

  const allocatedTotal = Object.values(allocation).reduce((s, n) => s + n, 0);
  const remaining = size - allocatedTotal;
  // A full box (exactly `size` items) qualifies for the fixed box price.
  // With allowPartial, fewer than that can still be added to the cart —
  // just priced per cookie instead of at the box rate.
  const isFullBox = remaining === 0 && allocatedTotal > 0;
  const currentReady = allowPartial ? allocatedTotal > 0 : isFullBox;
  const currentItems = flavours
    .filter(f => allocation[f.id] > 0)
    .map(f => ({ id: f.id, name: f.name, price: f.price, qty: allocation[f.id], image_url: f.image_url, tier: f.tier }));
  const perUnitPrice = currentItems.reduce((sum, it) => sum + it.price * it.qty, 0);
  const overridePrice = isFullBox && priceOverride ? priceOverride(currentItems, size) : null;
  const currentPrice = overridePrice ?? perUnitPrice;
  // When a fixed box price applies, each flavour's per-unit price no longer
  // sums to the box total — so the cart shows one box subtotal instead of
  // per-line totals that wouldn't add up.
  const isFixedPrice = overridePrice != null;
  // A partial, individually-priced selection displays its actual count
  // rather than the box's target size (e.g. "2 Cookies", not "Box of 4").
  const displaySize = isFullBox ? size : allocatedTotal;
  const displayTitle = isFullBox || !allowPartial
    ? title
    : `${allocatedTotal} ${allocatedTotal === 1 ? 'Cookie' : 'Cookies'}`;

  const setQty = (id, qty) => setAllocation(a => ({ ...a, [id]: Math.max(0, qty) }));
  const addOne = (id) => {
    if (remaining <= 0) return;
    setQty(id, (allocation[id] || 0) + 1);
  };

  const handleSizeChange = (newSize) => {
    setSize(newSize);
    setAllocation({});
  };

  // Report the in-progress box up to the parent cart as soon as anything is
  // picked (not just once the box is full), so it survives switching tabs
  // instead of being lost on unmount. `complete` tells the parent whether
  // this box is actually orderable yet.
  useEffect(() => {
    onPendingChange(allocatedTotal > 0
      ? { title: displayTitle, size: displaySize, items: currentItems, price: currentPrice, fixedPrice: isFixedPrice, emoji, complete: currentReady, remaining }
      : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allocation, size]);

  const addAnotherBox = () => {
    if (!currentReady) return;
    onCommit({ title: displayTitle, size: displaySize, items: currentItems, price: currentPrice, fixedPrice: isFixedPrice, emoji });
    setAllocation({});
  };

  useImperativeHandle(ref, () => ({ addAnotherBox }));

  return (
    <div>
      <h3 className="font-serif text-2xl font-bold text-brown-800 mb-1">{title}</h3>
      <p className="text-brown-400 text-sm mb-4">{subtitle || 'Choose your box size, then pick how many of each flavour.'}</p>

      <p className={`text-sm font-semibold px-4 py-3 mb-6 border rounded-sm ${
        isFullBox
          ? 'text-green-700 bg-green-50 border-green-200'
          : allocatedTotal > 0
          ? (allowPartial ? 'text-brown-600 bg-brown-50 border-brown-100' : 'text-red-700 bg-red-50 border-red-200')
          : 'text-brown-600 bg-brown-50 border-brown-100'
      }`}>
        {isFullBox
          ? `${size} of ${size} selected — this box is full!`
          : allocatedTotal > 0
          ? (allowPartial
              ? `${allocatedTotal} selected at individual pricing — add ${remaining} more to fill a box of ${size} for the box price, or add to cart now.`
              : `${allocatedTotal} of ${size} selected — ${remaining} more ${remaining === 1 ? 'piece' : unitLabel} away from filling this box!`)
          : `0 of ${size} selected — pick your flavours above.`}
      </p>

      {sizes.length > 1 && (
      <div className="flex flex-wrap gap-3 mb-6">
        {sizes.map(s => (
          <button
            key={s}
            type="button"
            onClick={() => handleSizeChange(s)}
            className={`px-5 py-2.5 text-sm font-medium uppercase tracking-widest border transition-colors ${
              size === s
                ? 'bg-brown-600 text-white border-brown-600'
                : 'border-brown-200 text-brown-600 hover:bg-brown-50'
            }`}
          >
            {s} {unitLabel}
          </button>
        ))}
      </div>
      )}

      {/* Flavour picker — click a photo to add it to the box */}
      {tierGroups ? (
        tierGroups.map(group => {
          const groupFlavours = flavours.filter(f => f.tier === group.key);
          if (groupFlavours.length === 0) return null;
          return (
            <div key={group.key} className="mb-6">
              <div className="flex items-baseline justify-between mb-3 pb-2 border-b border-brown-100">
                <h4 className="text-sm font-bold uppercase tracking-widest text-brown-700">{group.label}</h4>
                <span className="text-xs text-brown-400">{group.note}</span>
              </div>
              <FlavourGrid flavours={groupFlavours} allocation={allocation} remaining={remaining} emoji={emoji} setQty={setQty} addOne={addOne} />
            </div>
          );
        })
      ) : (
        <div className="mb-6">
          <FlavourGrid flavours={flavours} allocation={allocation} remaining={remaining} emoji={emoji} setQty={setQty} addOne={addOne} />
        </div>
      )}
    </div>
  );
});

function FlavourGrid({ flavours, allocation, remaining, emoji, setQty, addOne }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {flavours.map(f => {
        const qty = allocation[f.id] || 0;
        const canAdd = remaining > 0;
        return (
          <div key={f.id} className={`border flex flex-col h-full ${f.is_featured ? 'border-brown-300' : 'border-brown-100'}`}>
            <button
              type="button"
              onClick={() => addOne(f.id)}
              disabled={!canAdd}
              className="relative w-full aspect-square bg-cream-100 block overflow-hidden group disabled:cursor-not-allowed"
              aria-label={`Add ${f.name}`}
            >
              {f.is_featured && (
                <span className="absolute top-2 left-2 z-10 bg-brown-700 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-full flex items-center gap-1 shadow">
                  <Star size={10} className="fill-cream-300 text-cream-300" />
                  Best Seller
                </span>
              )}
              {f.image_url ? (
                <img
                  src={f.image_url}
                  alt={f.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
              )}
              {qty > 0 && (
                <span className="absolute top-2 right-2 bg-brown-700 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow">
                  {qty}
                </span>
              )}
              {canAdd && (
                <span className="absolute inset-x-0 bottom-0 bg-brown-800 bg-opacity-0 group-hover:bg-opacity-70 text-white text-xs font-medium uppercase tracking-widest text-center py-1.5 opacity-0 group-hover:opacity-100 transition">
                  Tap to add
                </span>
              )}
            </button>
            <div className="p-2.5 flex flex-col flex-1">
              <p className="text-sm font-medium text-brown-700 leading-snug line-clamp-2 min-h-[2.5rem]">{f.name}</p>
              <p className="text-brown-400 text-xs mb-2">{formatPrice(f.price)} each</p>
              <QuantityStepper
                value={qty}
                onChange={q => setQty(f.id, q)}
                min={0}
                max={qty + remaining}
                className="mt-auto"
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FlavourAllocatorBuilder;
