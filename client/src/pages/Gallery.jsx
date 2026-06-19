import { useEffect, useState } from 'react';
import api from '../api/axios';

const TAGS = ['All', 'Cookies', 'Brownies', 'Cupcakes', 'Custom Orders', 'Events', 'Seasonal'];

export default function Gallery() {
  const [images, setImages]   = useState([]);
  const [active, setActive]   = useState('All');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  useEffect(() => {
    api.get('/gallery').then(r => setImages(r.data)).finally(() => setLoading(false));
  }, []);

  const filtered = active === 'All'
    ? images
    : images.filter(img => img.tag?.toLowerCase() === active.toLowerCase());

  return (
    <div>
      {/* Hero */}
      <div className="bg-brown-800 text-white text-center py-20 px-4">
        <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Our Creations</p>
        <h1 className="font-serif text-5xl font-bold mb-4">Gallery</h1>
        <p className="text-brown-200 max-w-xl mx-auto">
          A look at some of our favourite bakes — from weekly treats to custom celebration orders.
        </p>
      </div>

      {/* Tags filter */}
      <div className="bg-white border-b border-brown-100 sticky top-20 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto gap-1 py-2 scrollbar-hide">
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActive(tag)}
                className={`flex-shrink-0 px-5 py-2 text-sm font-medium uppercase tracking-wider transition-colors rounded-full ${
                  active === tag
                    ? 'bg-brown-600 text-white'
                    : 'text-brown-500 hover:bg-brown-50 border border-brown-200'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="text-center py-20 text-brown-400">Loading gallery...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📸</p>
            <p className="text-brown-400 text-lg">No photos in this category yet.</p>
            <p className="text-brown-300 text-sm mt-2">Check back soon or follow us on Instagram!</p>
          </div>
        ) : (
          <div className="gallery-grid">
            {filtered.map((img) => (
              <div
                key={img.id}
                className="group cursor-pointer relative overflow-hidden rounded-sm"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={`http://localhost:5000${img.image_url}`}
                  alt={img.caption || 'Gallery photo'}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                {img.caption && (
                  <div className="absolute inset-0 bg-brown-900 bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
                    <p className="text-white text-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300 font-medium">
                      {img.caption}
                    </p>
                  </div>
                )}
                {img.tag && (
                  <span className="absolute top-2 left-2 bg-brown-600 text-white text-xs px-2 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {img.tag}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div className="relative max-w-4xl max-h-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-10 right-0 text-white text-3xl font-light hover:text-cream-300"
            >
              ✕
            </button>
            <img
              src={`http://localhost:5000${lightbox.image_url}`}
              alt={lightbox.caption || 'Gallery photo'}
              className="max-h-[85vh] max-w-full object-contain"
            />
            {lightbox.caption && (
              <p className="text-white text-center mt-3 text-sm">{lightbox.caption}</p>
            )}
          </div>
        </div>
      )}

      {/* Social CTA */}
      <div className="bg-brown-700 py-16 text-white text-center px-4">
        <h2 className="font-serif text-3xl font-bold mb-3">Follow Along</h2>
        <p className="text-brown-200 mb-8 max-w-md mx-auto">
          See our latest creations, behind-the-scenes moments and weekly specials on Instagram and Facebook.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a
            href="https://instagram.com/_crumbs.and.cream_"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-brown-700 px-8 py-3 font-medium tracking-widest uppercase text-sm hover:bg-cream-100 transition-colors"
          >
            Instagram
          </a>
          <a
            href="https://www.facebook.com/p/Crumbs-Cream-61577892432479"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block border-2 border-white text-white px-8 py-3 font-medium tracking-widest uppercase text-sm hover:bg-white hover:text-brown-700 transition-colors"
          >
            Facebook
          </a>
        </div>
      </div>
    </div>
  );
}
