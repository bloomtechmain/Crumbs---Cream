import { MapPin, Mail, Clock, Phone } from 'lucide-react';
import InstagramIcon from '../components/InstagramIcon';
import FacebookIcon from '../components/FacebookIcon';
import pageHero from '../assets/products-hero.webp';
import usePageMeta from '../hooks/usePageMeta';
import { PAGE_META } from '../data/pageMeta';

export default function Contact() {
  usePageMeta(PAGE_META['/contact']);

  return (
    <div>
      {/* Hero */}
      <div className="relative text-center py-20 px-4 overflow-hidden bg-brown-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${pageHero})` }}
        />
        <div className="relative z-10">
          <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Get in Touch</p>
          <h1 className="font-serif text-5xl font-bold mb-4 text-white">Contact Us</h1>
          <p className="text-brown-200 max-w-xl mx-auto">
            Ready to place an order or have a question? We'd love to hear from you!
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Contact Info */}
        <div>
          <h2 className="section-title mb-8">Let's Connect</h2>
            <div className="space-y-6 mb-10">
              {[
                {
                  icon: MapPin,
                  title: 'Location',
                  lines: ['Lynbrook', 'Victoria, Australia'],
                },
                {
                  icon: Phone,
                  title: 'Phone / WhatsApp',
                  lines: ['+61 431 879 184'],
                  link: 'tel:+61431879184',
                },
                {
                  icon: InstagramIcon,
                  title: 'Instagram',
                  lines: ['@_crumbs.and.cream_'],
                  link: 'https://instagram.com/_crumbs.and.cream_',
                },
                {
                  icon: FacebookIcon,
                  title: 'Facebook',
                  lines: ['Crumbs & Cream', 'Follow us for updates!'],
                  link: 'https://www.facebook.com/p/Crumbs-Cream-61577892432479',
                },
                {
                  icon: Mail,
                  title: 'Email',
                  lines: ['orders.crumbsandcream@gmail.com'],
                  link: 'mailto:orders.crumbsandcream@gmail.com',
                  highlight: true,
                },
                {
                  icon: Clock,
                  title: 'Response Time',
                  lines: ['We aim to respond within 24 hours', 'During busy periods, this may take up to 48 hours'],
                },
              ].map(({ icon: Icon, title, lines, link, highlight }) => (
                <div
                  key={title}
                  className={`flex gap-4 ${highlight ? 'items-center bg-cream-100 border border-brown-200 rounded-sm p-4' : ''}`}
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                    highlight ? 'bg-brown-600' : 'bg-brown-100'
                  }`}>
                    <Icon size={20} className={highlight ? 'text-white' : 'text-brown-600'} />
                  </div>
                  <div>
                    <p className="font-semibold text-brown-800 mb-1 flex items-center gap-2">
                      {title}
                      {highlight && (
                        <span className="bg-brown-600 text-white text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full">
                          Preferred for Orders
                        </span>
                      )}
                    </p>
                    {lines.map((line, i) => link && i === 0 ? (
                      <a
                        key={i}
                        href={link}
                        {...(link.startsWith('http') ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                        className={`text-sm block ${
                          highlight
                            ? 'text-brown-700 font-semibold underline hover:text-brown-800'
                            : 'text-brown-500 hover:text-brown-700'
                        }`}
                      >
                        {line}
                      </a>
                    ) : (
                      <p key={i} className="text-brown-500 text-sm">{line}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Order info box */}
            <div className="bg-cream-100 border border-cream-200 p-6">
              <h3 className="font-serif text-xl font-bold text-brown-700 mb-2">Placing an Order</h3>
              <p className="text-brown-500 text-sm leading-relaxed mb-3">
                Email us at{' '}
                <a href="mailto:orders.crumbsandcream@gmail.com" className="text-brown-700 font-medium underline hover:text-brown-800">
                  orders.crumbsandcream@gmail.com
                </a>
                , DM us on Instagram or Facebook, or call with your order enquiry. Please include:
              </p>
              <ul className="space-y-1 text-brown-500 text-sm">
                {[
                  'Products and quantities you\'d like',
                  'Desired delivery date',
                  'Delivery suburb / pickup preference',
                  'Any dietary requirements or custom requests',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-brown-400 mt-0.5">→</span> {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Google Maps */}
            <div className="mt-8">
              <iframe
                src="https://maps.google.com/maps?q=Lynbrook+Victoria+Australia&t=&z=12&ie=UTF8&iwloc=&output=embed"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Crumbs & Cream Location"
                className="w-full"
              />
            </div>
        </div>
      </div>
    </div>
  );
}
