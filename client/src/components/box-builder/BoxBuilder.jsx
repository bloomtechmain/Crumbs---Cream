import { useState, useRef, useMemo } from 'react';
import { ShoppingCart, Trash2 } from 'lucide-react';
import products from '../../data/products';
import FlavourAllocatorBuilder from './FlavourAllocatorBuilder';
import SingleFlavourPackBuilder from './SingleFlavourPackBuilder';
import CustomDesignForm from './CustomDesignForm';
import OrderSummaryFooter from './OrderSummaryFooter';
import CartLine from './CartLine';
import { formatPrice } from './orderSummary';
import { cookieBoxPrice, BROWNIE_BOX_PRICES, CUPCAKE_PACK_PRICES } from '../../data/boxPricing';

// Includes the Matcha Collection flavours — matcha now lives inside the
// Cookies tab as a third tier alongside classic and premium.
const cookieFlavours = products
  .filter(p => p.category_slug === 'cookies' && p.is_available)
  .map(p => ({ id: p.id, name: p.name, price: p.price, tier: p.tier, image_url: p.image_url, is_featured: p.is_featured }));

const brownieFlavours = products
  .filter(p => p.category_slug === 'brownies' && p.is_available)
  .map(p => ({ id: p.id, name: p.name, price: p.price, image_url: p.image_url }));

// Cupcake box only offers these three flavours per the client brief.
const cupcakeFlavours = products
  .filter(p => ['Chocolate Fudge Cupcake', 'Vanilla Bean Cupcake', 'Red Velvet Cupcake'].includes(p.name))
  .map(p => ({ id: p.id, name: p.name, price: p.price, image_url: p.image_url }));

const CATEGORY_EMOJI = { cookies: '🍪', brownies: '🍫', cupcakes: '🧁', 'sugar-cookies': '🎨' };

// Mirrors the Range table from the client's price brief — each group shows
// its flavours together so it's clear what counts as Classic vs. Premium
// vs. Matcha when pricing the box.
const COOKIE_TIER_GROUPS = [
  { key: 'classic', label: 'Classic', note: '$4.50 ea · Box of 4 → $20' },
  { key: 'premium', label: 'Premium', note: '$6.50 ea · Box of 4 → $28' },
  { key: 'matcha', label: 'Matcha Collection', note: '$7 ea · Box of 4 → $30' },
];

const TABS = [
  { key: 'cookies', label: 'Cookies' },
  { key: 'brownies', label: 'Brownies' },
  { key: 'cupcakes', label: 'Cupcakes' },
  { key: 'sugar-cookies', label: 'Sugar Cookies' },
];

export default function BoxBuilder() {
  const [tab, setTab] = useState('cookies');
  const [cartBoxes, setCartBoxes] = useState([]); // boxes committed from any category, kept across tab switches
  const [pending, setPending] = useState(null); // in-progress, fully-allocated box for the active tab
  const nextBoxId = useRef(1);
  const activeBuilderRef = useRef(null);

  const commitPending = () => {
    if (!pending) return;
    setCartBoxes(bs => [...bs, { id: nextBoxId.current++, ...pending }]);
    setPending(null);
  };

  const switchTab = (newTab) => {
    commitPending();
    setTab(newTab);
  };

  const handleCommit = (box) => {
    setCartBoxes(bs => [...bs, { id: nextBoxId.current++, ...box }]);
  };

  const removeCartBox = (id) => setCartBoxes(bs => bs.filter(b => b.id !== id));

  // Everything visible in the cart list, including a box that's still
  // being filled — so an item shows up the moment it's clicked, not only
  // once the box is complete.
  const allBoxes = useMemo(() => {
    const list = [...cartBoxes];
    if (pending) list.push({ id: 'pending', ...pending });
    return list;
  }, [cartBoxes, pending]);

  // Only complete boxes count toward the actual order — a half-filled box
  // of 4 isn't something we can sell, so it's excluded from the total and
  // the emailed summary until it's full.
  const orderableBoxes = useMemo(
    () => (pending && pending.complete ? [...cartBoxes, pending] : cartBoxes),
    [cartBoxes, pending]
  );

  const totalPrice = orderableBoxes.reduce((sum, b) => sum + b.price, 0);
  const cartItemCount = allBoxes.reduce((sum, b) => sum + b.items.reduce((s, it) => s + it.qty, 0), 0);
  const hasOrder = orderableBoxes.length > 0;

  const summaryBoxes = useMemo(() => {
    const multiple = orderableBoxes.length > 1;
    return orderableBoxes.map((b, i) => {
      const base = b.fixedPrice ? `${b.title} — Box of ${b.size}` : b.title;
      return {
        id: b.id,
        label: multiple ? `${base} (Box ${i + 1})` : base,
        items: b.items,
        price: b.price,
        fixedPrice: b.fixedPrice,
      };
    });
  }, [orderableBoxes]);

  const summary = useMemo(() => {
    if (!hasOrder) return '';
    const lines = summaryBoxes.flatMap(b => [
      b.label,
      ...b.items.map(it => `${it.qty} x ${it.name}`),
    ]);
    return [`Hi! I'd like to order:`, ...lines, `Estimated total: ${formatPrice(totalPrice)}`].join('\n');
  }, [hasOrder, summaryBoxes, totalPrice]);

  return (
    <div className="bg-white shadow-sm">
      <div className="flex overflow-x-auto border-b border-brown-100">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => switchTab(t.key)}
            className={`flex-shrink-0 px-6 py-4 text-sm font-medium uppercase tracking-widest transition-colors ${
              tab === t.key
                ? 'text-brown-700 border-b-2 border-brown-600'
                : 'text-brown-400 hover:text-brown-600'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="p-6 sm:p-8">
        {tab === 'sugar-cookies' ? (
          <CustomDesignForm />
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8 lg:items-start">
            <div className="lg:col-span-2">
              {tab === 'cookies' && (
                <FlavourAllocatorBuilder ref={activeBuilderRef} title="Box of 4 Cookies" subtitle="Pick any 4. All Classic or all Premium gets that tier's box price — mix Classic + Premium for $25 flat. Matcha Collection is priced separately. Fewer than 4? You'll be charged individual cookie pricing." unitLabel="pcs" sizes={[4]} flavours={cookieFlavours} emoji={CATEGORY_EMOJI.cookies} onCommit={handleCommit} onPendingChange={setPending} priceOverride={cookieBoxPrice} tierGroups={COOKIE_TIER_GROUPS} allowPartial />
              )}
              {tab === 'brownies' && (
                <SingleFlavourPackBuilder
                  ref={activeBuilderRef}
                  title="Brownie Box"
                  subtitle="Choose your brownie box size, then select your flavours."
                  sizeUnitLabel="pcs"
                  sizes={[9, 16, 25]}
                  flavours={brownieFlavours}
                  priceFor={(_flavour, size) => BROWNIE_BOX_PRICES[size]}
                  emoji={CATEGORY_EMOJI.brownies}
                  onCommit={handleCommit}
                  onPendingChange={setPending}
                  sizeFirst
                />
              )}
              {tab === 'cupcakes' && (
                <SingleFlavourPackBuilder
                  ref={activeBuilderRef}
                  title="Cupcake Box"
                  subtitle="Choose your pack size, then pick a flavour."
                  sizeUnitLabel="Pack"
                  sizes={[4, 6, 12, 24]}
                  flavours={cupcakeFlavours}
                  priceFor={(flavour, size) => flavour ? CUPCAKE_PACK_PRICES[flavour.name]?.[size] : undefined}
                  minPriceFor={(size) => Math.min(...Object.values(CUPCAKE_PACK_PRICES).map(p => p[size]).filter(v => v != null))}
                  emoji={CATEGORY_EMOJI.cupcakes}
                  onCommit={handleCommit}
                  onPendingChange={setPending}
                  sizeFirst
                />
              )}
            </div>

            {/* Order cart — persists across tabs so switching categories doesn't lose earlier boxes */}
            <div className="mt-10 lg:mt-0 lg:col-span-1 lg:sticky lg:top-24">
              <div className="border border-brown-100 bg-white shadow-md p-4 mb-4">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-brown-100">
                  <div className="flex items-center gap-2 bg-brown-50 px-2.5 py-1 rounded-full">
                    <ShoppingCart size={16} className="text-brown-600" />
                    <p className="text-xs uppercase tracking-widest text-brown-700 font-semibold">Your Cart</p>
                  </div>
                  {cartItemCount > 0 && (
                    <span className="bg-brown-600 text-white text-xs font-bold min-w-[1.25rem] h-5 px-1 rounded-full flex items-center justify-center">
                      {cartItemCount}
                    </span>
                  )}
                </div>

                {allBoxes.length === 0 && (
                  <p className="text-brown-400 text-sm flex items-center gap-2">
                    <ShoppingCart size={16} className="text-brown-200" /> Your cart is empty — add some flavours to get started.
                  </p>
                )}

                <div className="space-y-4">
                  {allBoxes.map((b, i) => (
                    <div key={b.id} className="border-b border-brown-100 pb-3 last:border-b-0 last:pb-0">
                      <div className="flex items-center justify-between mb-2">
                        <span className="flex items-center gap-2 text-sm font-semibold text-brown-700">
                          <span className="w-5 h-5 rounded-full bg-brown-100 text-brown-700 text-[11px] font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </span>
                          {b.fixedPrice ? `${b.title} — Box of ${b.size}` : b.title}
                          {b.id === 'pending' && (b.complete ? ' (ready)' : ` (${b.remaining} more to add)`)}
                        </span>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <span className="text-sm font-semibold text-brown-700">{formatPrice(b.price)}</span>
                          {b.id !== 'pending' && (
                            <button
                              type="button"
                              onClick={() => removeCartBox(b.id)}
                              className="text-brown-300 hover:text-red-500 transition-colors"
                              aria-label={`Remove box ${i + 1}`}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <ul className="space-y-2">
                        {b.items.map(it => (
                          <CartLine key={it.id} item={it} emoji={b.emoji} showLineTotal={!b.fixedPrice} />
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => activeBuilderRef.current?.addAnotherBox()}
                  disabled={!pending?.complete}
                  className={`mt-4 w-full px-6 py-3 text-sm font-medium uppercase tracking-widest border transition-colors ${
                    pending?.complete
                      ? 'border-brown-600 text-brown-700 hover:bg-brown-600 hover:text-white'
                      : 'border-brown-200 text-brown-300 cursor-not-allowed'
                  }`}
                >
                  + Add Another Box
                </button>
              </div>

              <OrderSummaryFooter
                total={totalPrice}
                summary={summary}
                boxes={summaryBoxes}
                ready={hasOrder}
                note="Fill a box from any category above to see your order summary — you can mix cookies, brownies, cupcakes and matcha in one order."
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
