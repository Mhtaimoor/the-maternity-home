import Link from 'next/link';
import { formatPkr } from '../../lib/api';
import { productImage } from '../../lib/images';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  if (sp.q) qs.set('q', sp.q);
  if (sp.category) qs.set('category', sp.category);
  if (sp.sort) qs.set('sort', sp.sort);

  const [products, categories] = await Promise.all([
    fetch(`${API}/products?${qs}`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
    fetch(`${API}/categories`, { cache: 'no-store' }).then((r) => r.json()).catch(() => []),
  ]);

  return (
    <main className="tmh-section container">
      <div className="row g-4">
        <div className="col-lg-3">
          <div className="tmh-panel sticky-lg-top" style={{ top: '5.5rem' }}>
            <h1 className="tmh-display h3">Shop</h1>
            <p className="text-secondary">Filter by need, then add soft essentials to your cart.</p>
            <form className="tmh-form d-grid gap-3">
              <div>
                <label className="form-label">Search</label>
                <input className="form-control" name="q" defaultValue={sp.q} placeholder="Pads, onesie…" />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-select" name="category" defaultValue={sp.category || ''}>
                  <option value="">All categories</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Sort</label>
                <select className="form-select" name="sort" defaultValue={sp.sort || 'newest'}>
                  <option value="newest">Newest</option>
                  <option value="price_asc">Price ↑</option>
                  <option value="price_desc">Price ↓</option>
                </select>
              </div>
              <button className="btn btn-tmh" type="submit">
                Apply filters
              </button>
            </form>
          </div>
        </div>
        <div className="col-lg-9">
          {!products.length ? (
            <div className="tmh-panel">
              <h2 className="h4">No products found</h2>
              <p className="text-secondary mb-3">Try another search or browse the full catalogue.</p>
              <Link href="/shop" className="btn btn-tmh-outline">
                Reset filters
              </Link>
            </div>
          ) : (
            <div className="row g-3">
              {products.map((p: any) => (
                <div className="col-6 col-md-4" key={p.id}>
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
          )}
        </div>
      </div>
    </main>
  );
}
