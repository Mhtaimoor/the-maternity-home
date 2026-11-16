import Link from 'next/link';
import { formatPkr } from '../lib/api';
import { categoryImage, productImage } from '../lib/images';

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
      <section className="tmh-hero">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="tmh-hero-media" src="/images/hero-maternity.jpg" alt="Mother and newborn" />
        <div className="tmh-hero-overlay" />
        <div className="container">
          <div className="tmh-hero-content">
            <div className="tmh-hero-kicker">
              {banner?.subtitle || 'Pakistan · Care-focused essentials'}
            </div>
            <h1 className="tmh-display display-3 text-white mb-3">
              {banner?.title || 'Care for every stage'}
            </h1>
            <p className="lead text-white-50 mb-4">
              Soft essentials for maternity, postpartum and newborn days — shop with COD and tracked
              delivery across Pakistan.
            </p>
            <div className="d-flex flex-wrap gap-2">
              <Link className="btn btn-tmh" href="/shop">
                Shop the collection
              </Link>
              <Link className="btn btn-light rounded-pill px-4 fw-semibold" href="/pages/about">
                Our story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tmh-section container">
        <div className="tmh-trust">
          <div className="tmh-trust-item">
            <i className="bi bi-truck fs-4 text-success" />
            <div className="fw-semibold mt-2">COD in major cities</div>
            <div className="text-secondary small">Lahore, Islamabad, Karachi and more</div>
          </div>
          <div className="tmh-trust-item">
            <i className="bi bi-shield-check fs-4 text-success" />
            <div className="fw-semibold mt-2">Thoughtful catalogue</div>
            <div className="text-secondary small">Clear sizes, packs and stock status</div>
          </div>
          <div className="tmh-trust-item">
            <i className="bi bi-chat-heart fs-4 text-success" />
            <div className="fw-semibold mt-2">WhatsApp support</div>
            <div className="text-secondary small">Human help when you need it</div>
          </div>
        </div>
      </section>

      <section className="tmh-section container pt-0">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="tmh-chip mb-2">Browse</div>
            <h2 className="tmh-section-title h1 mb-0">Shop by category</h2>
          </div>
          <Link href="/shop" className="btn btn-tmh-outline btn-sm d-none d-md-inline-flex">
            View all
          </Link>
        </div>
        <div className="row g-3">
          {categories.map((c: any) => (
            <div className="col-6 col-md-4 col-lg-3" key={c.id}>
              <Link href={`/shop?category=${c.slug}`} className="text-decoration-none text-dark">
                <article className="tmh-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="tmh-card-img" src={categoryImage(c.slug)} alt={c.name} />
                  <div className="tmh-card-body">
                    <div className="fw-semibold">{c.name}</div>
                    <div className="text-secondary small">{c.description}</div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="tmh-section container pt-0">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="tmh-chip mb-2">Featured</div>
            <h2 className="tmh-section-title h1 mb-0">Loved right now</h2>
          </div>
        </div>
        <div className="row g-3">
          {products.map((p: any) => (
            <div className="col-6 col-lg-4" key={p.id}>
              <Link href={`/product/${p.slug}`} className="text-decoration-none text-dark">
                <article className="tmh-card">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="tmh-card-img" src={productImage(p)} alt={p.name} />
                  <div className="tmh-card-body">
                    <div className="text-secondary small">{p.brand}</div>
                    <div className="fw-semibold">{p.name}</div>
                    <div className="tmh-price mt-1">{formatPkr(p.displayPrice)}</div>
                  </div>
                </article>
              </Link>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
