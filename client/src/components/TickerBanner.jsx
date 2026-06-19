const ROWS = [
  {
    items: '✦ Baked Fresh Daily  ✦ South East Melbourne  ✦ Homemade with Love  ✦ Order Online  ✦ Made to Order  ✦ Where Every Crumb Counts  ',
    reverse: false,
    bg: 'bg-brown-700',
    text: 'text-cream-200',
    duration: '120s',
  },
  {
    items: '✦ Cookies  ✦ Brownies  ✦ Cupcakes  ✦ Pastries  ✦ Custom Orders  ✦ Birthday Cakes  ✦ Gift Boxes  ✦ Event Orders  ',
    reverse: true,
    bg: 'bg-brown-600',
    text: 'text-white',
    duration: '100s',
  },
  {
    items: '✦ Fresh Ingredients  ✦ No Preservatives  ✦ South East Melbourne  ✦ Pre-Order Weekly  ✦ Pistachio  ✦ Ferrero Rocher  ✦ Biscoff  ✦ Red Velvet  ',
    reverse: false,
    bg: 'bg-brown-500',
    text: 'text-cream-100',
    duration: '130s',
  },
];

export default function TickerBanner() {
  return (
    <div>
      {ROWS.map((row, i) => (
        <div key={i} className={`${row.bg} py-2.5 ticker-wrap`}>
          <div
            className={`${row.reverse ? 'ticker-content-reverse' : 'ticker-content'} ${row.text} text-xs tracking-widest uppercase font-medium`}
            style={{ animationDuration: row.duration }}
          >
            {row.items.repeat(3) + row.items.repeat(3)}
          </div>
        </div>
      ))}
    </div>
  );
}
