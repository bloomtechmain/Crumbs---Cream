import { useCallback, useEffect, useState } from 'react';
import pageHero from '../assets/products-hero.webp';
import usePageMeta from '../hooks/usePageMeta';
import { PAGE_META } from '../data/pageMeta';

const API_BASE = import.meta.env.VITE_GALLERY_API_URL || '';
const SKELETON_HEIGHTS = [220, 280, 180, 260, 200, 320, 240, 190];

export default function Gallery() {
  usePageMeta(PAGE_META['/gallery']);

  const [images, setImages]     = useState([]);
  const [status, setStatus]     = useState('loading'); // 'loading' | 'error' | 'ready'
  const [lightbox, setLightbox] = useState(null);

  const fetchGallery = () =>
    fetch(`${API_BASE}/api/gallery`).then(res => {
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return res.json();
    });

  const load = useCallback(() => {
    setStatus('loading');
    // One silent retry before surfacing an error — smooths over a single
    // transient hiccup (e.g. a momentary Google auth blip on the gallery worker).
    fetchGallery()
      .catch(() => new Promise(resolve => setTimeout(resolve, 1000)).then(fetchGallery))
      .then(data => {
        const sorted = [...(data.images || [])].sort(
          (a, b) => new Date(b.createdDate) - new Date(a.createdDate)
        );
        setImages(sorted);
        setStatus('ready');
      })
      .catch(() => setStatus('error'));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Hero */}
      <div className="relative text-center py-20 px-4 overflow-hidden bg-brown-800">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${pageHero})` }}
        />
        <div className="relative z-10">
          <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Our Creations</p>
          <h1 className="font-serif text-5xl font-bold mb-4 text-white">Gallery</h1>
          <p className="text-brown-200 max-w-xl mx-auto">
            A look at some of our favourite bakes — from weekly treats to custom celebration orders.
          </p>
        </div>
      </div>

      {/* Gallery */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {status === 'loading' && (
          <div className="gallery-grid" aria-busy="true" aria-label="Loading gallery photos">
            {SKELETON_HEIGHTS.map((h, i) => (
              <div key={i} className="bg-brown-100 animate-pulse rounded-sm" style={{ height: h }} />
            ))}
          </div>
        )}

        {status === 'error' && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">⚠️</p>
            <p className="text-brown-500 text-lg mb-2">We couldn't load the gallery right now.</p>
            <p className="text-brown-300 text-sm mb-6">Please check your connection and try again.</p>
            <button onClick={load} className="btn-outline">Try Again</button>
          </div>
        )}

        {status === 'ready' && images.length === 0 && (
          <div className="text-center py-20">
            <p className="text-6xl mb-4">📸</p>
            <p className="text-brown-400 text-lg">No photos yet.</p>
            <p className="text-brown-300 text-sm mt-2">Check back soon or follow us on Instagram!</p>
          </div>
        )}

        {status === 'ready' && images.length > 0 && (
          <div className="gallery-grid">
            {images.map((img) => (
              <div
                key={img.id}
                className="group cursor-pointer relative overflow-hidden rounded-sm"
                onClick={() => setLightbox(img)}
              >
                <img
                  src={`${API_BASE}${img.url}`}
                  alt={img.name || 'Gallery photo'}
                  className="w-full transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
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
              src={`${API_BASE}${lightbox.url}`}
              alt={lightbox.name || 'Gallery photo'}
              className="max-h-[85vh] max-w-full object-contain"
            />
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
