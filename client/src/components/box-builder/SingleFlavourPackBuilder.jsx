import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { formatPrice } from './orderSummary';

// Shared by Cupcakes and Brownies: pick one flavour, then a fixed box/pack
// size, and the price comes straight from a lookup table — not per-unit
// math — so there's nothing to fill up piece by piece.
const SingleFlavourPackBuilder = forwardRef(function SingleFlavourPackBuilder(
  { title, subtitle, sizeUnitLabel, sizes, flavours, priceFor, emoji, onCommit, onPendingChange, sizeFirst = false, minPriceFor },
  ref
) {
  // Nothing is pre-selected — opening this tab must not silently add a box
  // to the cart, so both flavour and size start unset until the customer
  // actively picks them.
  const [flavourId, setFlavourId] = useState(null);
  const [size, setSize] = useState(null);

  const flavour = flavours.find(f => f.id === flavourId) ?? null;
  const price = flavour && size ? priceFor(flavour, size) : undefined;
  const complete = Boolean(flavour && size && price != null);
  const currentItems = complete
    ? [{ id: flavour.id, name: flavour.name, price, qty: 1, image_url: flavour.image_url }]
    : [];

  useEffect(() => {
    onPendingChange(complete
      ? { title, size, items: currentItems, price, fixedPrice: true, emoji, complete: true, remaining: 0 }
      : null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flavourId, size]);

  const addAnotherBox = () => {
    if (!complete) return;
    onCommit({ title, size, items: currentItems, price, fixedPrice: true, emoji });
    setFlavourId(null);
    setSize(null);
  };

  useImperativeHandle(ref, () => ({ addAnotherBox }));

  const flavourGrid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
      {flavours.map(f => (
        <button
          key={f.id}
          type="button"
          onClick={() => setFlavourId(f.id)}
          className={`border text-center flex flex-col h-full transition-colors ${
            flavourId === f.id ? 'border-brown-600 ring-1 ring-brown-600' : 'border-brown-100 hover:border-brown-300'
          }`}
        >
          <div className="relative w-full aspect-square bg-cream-100 overflow-hidden">
            {f.image_url ? (
              <img src={f.image_url} alt={f.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-5xl">{emoji}</div>
            )}
          </div>
          <div className="p-2.5">
            <p className="text-sm font-medium text-brown-700 leading-snug">{f.name}</p>
          </div>
        </button>
      ))}
    </div>
  );

  const sizeButtons = (
    <div className="flex flex-wrap sm:flex-nowrap gap-3 mb-6">
      {sizes.map(s => {
        const exactPrice = priceFor(flavour, s);
        const isEstimate = exactPrice == null && !flavour;
        const shownPrice = exactPrice ?? (isEstimate && minPriceFor ? minPriceFor(s) : undefined);
        return (
          <button
            key={s}
            type="button"
            onClick={() => setSize(s)}
            className={`flex-1 min-w-[8rem] px-3 py-2.5 text-xs sm:text-sm font-medium uppercase tracking-wide sm:tracking-widest border transition-colors text-center ${
              size === s ? 'bg-brown-600 text-white border-brown-600' : 'border-brown-200 text-brown-600 hover:bg-brown-50'
            }`}
          >
            {shownPrice != null ? (
              <>
                <span className="block">{s} {sizeUnitLabel}</span>
                <span className="block">for</span>
                <span className="block">{formatPrice(shownPrice).replace('A$', '$')}</span>
              </>
            ) : (
              <>{s} {sizeUnitLabel}</>
            )}
          </button>
        );
      })}
    </div>
  );

  const statusMessage = (
    <p className={`text-sm font-semibold px-4 py-3 mb-6 border rounded-sm ${
      complete ? 'text-green-700 bg-green-50 border-green-200' : 'text-brown-600 bg-brown-50 border-brown-100'
    }`}>
      {complete
        ? `${flavour.name} — ${size} ${sizeUnitLabel} — ${formatPrice(price)}`
        : sizeFirst
        ? (!size ? `Pick a ${sizeUnitLabel.toLowerCase()} size above to get started.` : 'Now pick a flavour below.')
        : (!flavour ? 'Pick a flavour above to get started.' : `Now pick a ${sizeUnitLabel.toLowerCase()} size above.`)}
    </p>
  );

  return (
    <div>
      <h3 className="font-serif text-2xl font-bold text-brown-800 mb-1">{title}</h3>
      <p className="text-brown-400 text-sm mb-4">{subtitle}</p>

      {sizeFirst ? (
        <>
          {sizeButtons}
          {statusMessage}
          {flavourGrid}
        </>
      ) : (
        <>
          {flavourGrid}
          {sizeButtons}
          {statusMessage}
        </>
      )}
    </div>
  );
});

export default SingleFlavourPackBuilder;
