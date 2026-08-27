import { MapPin, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import zones from '../data/deliveryZones';
import pageHero from '../assets/products-hero.webp';
import usePageMeta from '../hooks/usePageMeta';
import { PAGE_META } from '../data/pageMeta';
import { buildDeliveryServiceSchema } from '../data/structuredData';

const TIER_FEE_TEXT = {
  within10: 'From A$10',
  '10to20': 'From A$15',
  '20to30': 'From A$20',
  '30plus': 'Quote provided at checkout',
};

const DELIVERY_TIERS = [
  { key: 'within10', range: 'Within 10 km' },
  { key: '10to20',   range: '10–20 km' },
  { key: '20to30',   range: '20–30 km' },
  { key: '30plus',   range: '30 km+' },
];

export default function Delivery() {
  usePageMeta(PAGE_META['/delivery']);
  const deliverySchema = buildDeliveryServiceSchema(zones);

  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(deliverySchema)}</script>
      {/* Hero */}
      <div className="relative text-center py-20 px-4 overflow-hidden bg-brown-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${pageHero})` }}
        />
        <div className="relative z-10">
          <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Lynbrook, Victoria</p>
          <h1 className="font-serif text-5xl font-bold mb-4 text-white">Delivery Info</h1>
          <p className="text-brown-200 max-w-xl mx-auto">
            We deliver fresh-baked goodness to your door across Lynbrook and the surrounding suburbs.
          </p>
        </div>
      </div>

      {/* Delivery Fees */}
      <section className="bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Delivery Fees</h2>
          <p className="text-center text-brown-400 mb-10">
            Delivery fees are calculated based on your location from Lynbrook.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {DELIVERY_TIERS.map(({ key, range }) => (
              <div key={key} className="text-center p-6 border border-brown-100 bg-cream-50">
                <p className="text-brown-400 text-xs uppercase tracking-widest mb-2">{range}</p>
                <p className="font-serif text-xl font-bold text-brown-700">{TIER_FEE_TEXT[key]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-cream-50 py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-center">
            {[
              { step: '01', icon: Package, title: 'Place Your Order',  desc: 'Contact us via our inquiry form or Instagram DM.' },
              { step: '02', icon: Clock,   title: 'We Confirm',        desc: 'We confirm your order, date and delivery details within 24 hours.' },
              { step: '03', icon: CheckCircle, title: 'Baked Fresh',   desc: 'Your order is baked fresh the day before delivery.' },
              { step: '04', icon: MapPin,  title: 'Delivered to You',  desc: 'We deliver straight to your door at your scheduled time.' },
            ].map(({ step, icon: Icon, title, desc }) => (
              <div key={step} className="relative">
                <div className="w-16 h-16 bg-brown-600 text-white rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon size={24} />
                </div>
                <div className="absolute top-0 right-0 w-7 h-7 bg-cream-300 rounded-full flex items-center justify-center text-xs font-bold text-brown-700">
                  {step}
                </div>
                <h3 className="font-serif text-lg font-semibold text-brown-700 mb-2">{title}</h3>
                <p className="text-brown-400 text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule & Info */}
      <section className="bg-white py-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-700 mb-6">Delivery Schedule</h2>
              <div className="space-y-4">
                {[
                  { day: 'Every Day', time: "By arrangement — we'll confirm a time when your order is accepted", available: true },
                ].map(({ day, time, available }) => (
                  <div key={day} className="flex items-center justify-between p-4 border border-brown-100 rounded-sm">
                    <div className="flex items-center gap-3">
                      {available
                        ? <CheckCircle size={20} className="text-green-500" />
                        : <AlertCircle size={20} className="text-amber-500" />
                      }
                      <div>
                        <p className="font-semibold text-brown-700">{day}</p>
                        <p className="text-brown-400 text-sm">{time}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-3 py-1 ${available ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
                      {available ? 'Available' : 'On Request'}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-700 mb-6">Good to Know</h2>
              <ul className="space-y-3">
                {[
                  'Orders must be placed at least 48 hours in advance.',
                  'Minimum order amounts apply per delivery zone.',
                  'Delivery fees are calculated based on distance from Lynbrook.',
                  'All items are packed in food-safe boxes for safe transport.',
                  "We'll confirm your delivery window when your order is accepted.",
                  'Custom orders may require longer lead times — contact us early!',
                  'Local pickup from Lynbrook, VIC is also available.',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-brown-600">
                    <span className="w-5 h-5 bg-brown-100 rounded-full flex-shrink-0 flex items-center justify-center text-brown-500 font-bold text-xs mt-0.5">
                      ✓
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
