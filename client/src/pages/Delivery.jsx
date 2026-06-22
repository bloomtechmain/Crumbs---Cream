import { useEffect, useState } from 'react';
import { MapPin, Clock, Package, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function Delivery() {
  const [zones, setZones]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/delivery').then(r => setZones(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown-800 text-white text-center py-20 px-4">
        <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">South East Melbourne</p>
        <h1 className="font-serif text-5xl font-bold mb-4">Delivery Info</h1>
        <p className="text-brown-200 max-w-xl mx-auto">
          We deliver fresh-baked goodness to your door across South East Melbourne.
        </p>
      </div>

      {/* How it Works */}
      <section className="bg-cream-50 py-16">
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
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl font-bold text-brown-700 mb-6">Delivery Schedule</h2>
              <div className="space-y-4">
                {[
                  { day: 'Saturday',  time: '9:00 AM – 2:00 PM', available: true },
                  { day: 'Sunday',    time: '10:00 AM – 1:00 PM', available: true },
                  { day: 'Weekdays',  time: 'By arrangement only', available: false },
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
                  'Free delivery is available for Berwick & Narre Warren.',
                  'All items are packed in food-safe boxes for safe transport.',
                  "We'll confirm your delivery window when your order is accepted.",
                  'Custom orders may require longer lead times — contact us early!',
                  'Local pickup from Berwick is also available.',
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

      {/* Zones Table */}
      <section className="bg-cream-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="section-title text-center mb-4">Delivery Zones</h2>
          <p className="text-center text-brown-400 mb-10">We currently deliver to the following Melbourne suburbs.</p>

          {loading ? (
            <p className="text-center text-brown-400">Loading zones...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full bg-white shadow-sm">
                <thead>
                  <tr className="bg-brown-700 text-white">
                    <th className="text-left px-6 py-4 text-sm font-semibold uppercase tracking-wide">Suburb</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold uppercase tracking-wide">Postcode</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold uppercase tracking-wide">Min. Order</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold uppercase tracking-wide">Delivery Fee</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.map((z, i) => (
                    <tr key={z.id} className={`border-b border-brown-50 ${i % 2 === 0 ? 'bg-white' : 'bg-cream-50'}`}>
                      <td className="px-6 py-4 font-medium text-brown-700">{z.suburb}</td>
                      <td className="px-6 py-4 text-brown-500">{z.postcode}</td>
                      <td className="px-6 py-4 text-brown-500">A${parseFloat(z.min_order).toFixed(2)}</td>
                      <td className="px-6 py-4">
                        {parseFloat(z.delivery_fee) === 0
                          ? <span className="text-green-600 font-semibold">FREE</span>
                          : <span className="text-brown-700 font-medium">A${parseFloat(z.delivery_fee).toFixed(2)}</span>
                        }
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <p className="text-center text-brown-400 text-sm mt-6">
            Don't see your suburb? <a href="/contact" className="text-brown-600 underline">Contact us</a> — we may still be able to help!
          </p>
        </div>
      </section>
    </div>
  );
}
