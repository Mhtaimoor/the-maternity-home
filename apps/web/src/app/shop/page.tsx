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
    <main className="tmh-section container tmh-page-animate">
      {/* Category Pills Header */}
      <div className="d-flex gap-2 flex-wrap mb-4 pb-2 border-bottom">
        <Link
          href="/shop"
          className={`btn btn-sm ${!sp.category ? 'btn-tmh' : 'btn-tmh-outline'}`}
        >
          All Items ({products.length})
        </Link>
        {categories.map((c: any) => (
          <Link
            key={c.id}
            href={`/shop?category=${c.slug}${sp.sort ? `&sort=${sp.sort}` : ''}`}
            className={`btn btn-sm ${sp.category === c.slug ? 'btn-tmh' : 'btn-tmh-outline'}`}
          >
            {c.name}
          </Link>
        ))}
      </div>

      <div className="row g-4">
        {/* Sidebar Filter */}
        <div className="col-lg-3">
          <div className="tmh-panel sticky-lg-top" style={{ top: '5.5rem' }}>
            <h1 className="tmh-display h3 mb-1">Filter Shop</h1>
            <p className="text-secondary small mb-3">Refine by need, search query or price ordering.</p>
            <form className="tmh-form d-grid gap-3">
              <div>
                <label className="form-label">Search Keyword</label>
                <input
                  className="form-control"
                  name="q"
                  defaultValue={sp.q}
                  placeholder="Pads, onesie, swaddle…"
                />
              </div>
              <div>
                <label className="form-label">Category</label>
                <select className="form-select" name="category" defaultValue={sp.category || ''}>
                  <option value="">All Categories</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="form-label">Sort By</label>
                <select className="form-select" name="sort" defaultValue={sp.sort || 'newest'}>
                  <option value="newest">Newest Arrivals</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>
              <button className="btn btn-tmh w-100 py-2" type="submit">
                <i className="bi bi-funnel me-1" /> Apply Filters
              </button>
              {(sp.q || sp.category || sp.sort) && (
                <Link href="/shop" className="btn btn-tmh-outline w-100 py-2">
                  <i className="bi bi-x-circle me-1" /> Reset Filters
                </Link>
              )}
            </form>
          </div>
        </div>

        {/* Product Grid */}
        <div className="col-lg-9">
          {!products.length ? (
            <div className="tmh-panel text-center py-5">
              <i className="bi bi-box2 fs-1 text-secondary mb-3 d-block" />
              <h2 className="h4">No products found</h2>
              <p className="text-secondary mb-4">
                No items match your current filter selection. Try removing search terms or choosing another category.
              </p>
              <Link href="/shop" className="btn btn-tmh">
                Browse Full Catalogue
              </Link>
            </div>
          ) : (
            <div className="row g-4">
              {products.map((p: any) => (
                <div className="col-6 col-md-4" key={p.id}>
                  <Link href={`/product/${p.slug}`} className="text-decoration-none text-dark h-100 d-block">
                    <article className="tmh-card">
                      <div className="tmh-card-img-wrap">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img className="tmh-card-img" src={productImage(p)} alt={p.name} />
                      </div>
                      <div className="tmh-card-body">
                        <div className="text-secondary small fw-medium">{p.brand || 'The Maternity Home'}</div>
                        <div className="fw-semibold fs-6 mt-1 mb-2 text-dark">{p.name}</div>
                        <div className="mt-auto d-flex align-items-baseline gap-2">
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
          )}
        </div>
      </div>
    </main>
  );
}
