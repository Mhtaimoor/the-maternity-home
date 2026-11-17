import Link from 'next/link';
import { STORE_PHONE_DISPLAY, STORE_WHATSAPP_URL } from '@tmh/shared';
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
    <main className="tmh-page-animate">
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
            <p className="lead mb-4">
              Soft essentials for maternity, postpartum and newborn days — shop with COD and tracked
              delivery across Pakistan.
            </p>
            <div className="d-flex flex-wrap gap-3">
              <Link className="btn btn-tmh-hero" href="/shop">
                <i className="bi bi-bag-heart me-1" /> Shop the Collection
              </Link>
              <Link className="btn btn-tmh-hero-ghost" href="/pages/about">
                Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="tmh-section container">
        <div className="tmh-trust">
          <div className="tmh-trust-item">
            <i className="bi bi-truck fs-3 text-success" />
            <div className="fw-semibold mt-2 fs-5">COD Across Pakistan</div>
            <div className="text-secondary small">Lahore, Karachi, Islamabad, Rawalpindi & nationwide</div>
          </div>
          <div className="tmh-trust-item">
            <i className="bi bi-shield-check fs-3 text-success" />
            <div className="fw-semibold mt-2 fs-5">Curated Essentials</div>
            <div className="text-secondary small">Postpartum pads, breathable cotton swaddles & anti-colic feeding</div>
          </div>
          <a className="tmh-trust-item text-decoration-none text-dark" href={STORE_WHATSAPP_URL} target="_blank" rel="noreferrer">
            <i className="bi bi-whatsapp fs-3 text-success" />
            <div className="fw-semibold mt-2 fs-5">Instant WhatsApp Help</div>
            <div className="text-secondary small">{STORE_PHONE_DISPLAY} · fast order support</div>
          </a>
        </div>
      </section>

      <section className="tmh-section container pt-0">
        <div className="d-flex justify-content-between align-items-end mb-4">
          <div>
            <div className="tmh-chip mb-2">Browse</div>
            <h2 className="tmh-section-title h1 mb-0">Shop by Category</h2>
          </div>
          <Link href="/shop" className="btn btn-tmh-outline btn-sm d-none d-md-inline-flex">
            View All Categories
          </Link>
        </div>
        <div className="row g-4">
          {categories.map((c: any) => (
            <div className="col-6 col-md-4 col-lg-3" key={c.id}>
              <Link href={`/shop?category=${c.slug}`} className="text-decoration-none text-dark h-100 d-block">
                <article className="tmh-card">
                  <div className="tmh-card-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="tmh-card-img" src={categoryImage(c)} alt={c.name} />
                  </div>
                  <div className="tmh-card-body">
                    <div className="fw-semibold fs-6 mb-1">{c.name}</div>
                    <div className="text-secondary small">{c.description || 'Browse collection'}</div>
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
            <h2 className="tmh-section-title h1 mb-0">Loved Right Now</h2>
          </div>
          <Link href="/shop" className="btn btn-tmh-outline btn-sm">
            View All Products
          </Link>
        </div>
        <div className="row g-4">
          {products.map((p: any) => (
            <div className="col-6 col-lg-4" key={p.id}>
              <Link href={`/product/${p.slug}`} className="text-decoration-none text-dark h-100 d-block">
                <article className="tmh-card">
                  <div className="tmh-card-img-wrap">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className="tmh-card-img" src={productImage(p)} alt={p.name} />
                  </div>
                  <div className="tmh-card-body">
                    <div className="text-secondary small fw-medium">{p.brand || 'The Maternity Home'}</div>
                    <div className="fw-semibold fs-5 mt-1">{p.name}</div>
                    <div className="d-flex align-items-baseline gap-2 mt-2">
                      <div className="tmh-price">{formatPkr(p.displayPrice)}</div>
                      {p.salePrice && (
                        <div className="text-decoration-line-through text-muted small">
                          {formatPkr(p.sellingPrice)}
                        </div>
                      )}
                    </div>
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
