import productsHero from '../assets/products-hero.webp';
import BoxBuilder from '../components/box-builder/BoxBuilder';
import usePageMeta from '../hooks/usePageMeta';
import { PAGE_META } from '../data/pageMeta';
import { buildProductListSchema } from '../data/structuredData';
import products from '../data/products';

export default function Products() {
  usePageMeta(PAGE_META['/products']);
  const productSchema = buildProductListSchema(products);

  return (
    <div>
      <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      {/* Hero */}
      <section className="relative text-center py-24 px-4 overflow-hidden bg-brown-900">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: `url(${productsHero})` }}
        />
        <div className="relative z-10">
          <p className="text-cream-300 text-sm tracking-widest uppercase mb-3">Baked Fresh to Order</p>
          <h1 className="font-serif text-5xl font-bold mb-4 text-white">Our Products</h1>
          <p className="text-brown-200 max-w-xl mx-auto">
            Homemade cookies, brownies and cupcakes — all made from scratch with premium ingredients.
          </p>
        </div>
      </section>

      {/* Build Your Box */}
      <section className="bg-cream-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-brown-400 text-sm tracking-widest uppercase mb-2">Guided Ordering</p>
            <h2 className="section-title">Build Your Box</h2>
            <p className="text-brown-400 mt-3 max-w-xl mx-auto">
              Pick a box, choose your flavours, and email your order straight to us.
            </p>
          </div>
          <BoxBuilder />
        </div>
      </section>

      {/* Order CTA */}
      <div className="bg-cream-100 py-16 text-center px-4">
        <h2 className="font-serif text-3xl font-bold text-brown-700 mb-3">Want a Custom Order?</h2>
        <p className="text-brown-500 mb-8 max-w-lg mx-auto">
          Planning a birthday, baby shower or special event? We'd love to create something unique just for you.
        </p>
        <a href="/contact" className="btn-primary">Get in Touch</a>
      </div>
    </div>
  );
}
