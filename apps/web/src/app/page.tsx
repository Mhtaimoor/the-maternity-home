import Link from 'next/link';
import { formatPkr } from '../lib/api';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

async function getHome() {
  const [banners, products, categories] = await Promise.all([
    fetch(`${API}/content/banners`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
    fetch(`${API}/products?featured=true`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
    fetch(`${API}/categories`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
  ]);
  return { banners, products, categories };
}

export default async function HomePage() {
  const { banners, products, categories } = await getHome();
  const banner = banners[0];

  return (
    <main>
      <section className="hero container">
        <p className="muted" style={{ letterSpacing: '0.12em', textTransform: 'uppercase', fontSize: 12 }}>
          {banner?.subtitle || 'Pakistan · PKR'}
        </p>
        <h1>{banner?.title || 'Care for every stage'}</h1>
        <p className="muted">
          Maternity, postpartum, newborn and baby essentials — shop with COD and tracked delivery.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.25rem' }}>
          <Link className="btn" href="/shop">
            Shop now
          </Link>
          <a
            className="btn secondary"
            href="https://wa.me/923000000000"
            target="_blank"
            rel="noreferrer"
          >
            WhatsApp
          </a>
        </div>
      </section>

      <section className="section container">
        <h2>Shop by category</h2>
        <div className="grid">
          {categories.map((c: any) => (
            <Link key={c.id} href={`/shop?category=${c.slug}`} className="product-card">
              <strong>{c.name}</strong>
              <span className="muted">{c.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section container">
        <h2>Featured</h2>
        <div className="grid">
          {products.map((p: any) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="product-card">
              {p.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt={p.name} />
              ) : (
                <div style={{ aspectRatio: 1, background: '#dde8e4' }} />
              )}
              <strong>{p.name}</strong>
              <span className="price">{formatPkr(p.displayPrice)}</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
