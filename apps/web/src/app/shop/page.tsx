import Link from 'next/link';
import { formatPkr } from '../../lib/api';

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
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Shop</h1>
      <form style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', margin: '1rem 0' }}>
        <input name="q" defaultValue={sp.q} placeholder="Search products" />
        <select name="category" defaultValue={sp.category || ''}>
          <option value="">All categories</option>
          {categories.map((c: any) => (
            <option key={c.id} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
        <select name="sort" defaultValue={sp.sort || 'newest'}>
          <option value="newest">Newest</option>
          <option value="price_asc">Price ↑</option>
          <option value="price_desc">Price ↓</option>
        </select>
        <button className="btn" type="submit">
          Filter
        </button>
      </form>

      {!products.length ? (
        <p className="muted">No products found. Try another search.</p>
      ) : (
        <div className="grid">
          {products.map((p: any) => (
            <Link key={p.id} href={`/product/${p.slug}`} className="product-card">
              {p.images?.[0]?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={p.images[0].url} alt={p.name} />
              ) : null}
              <strong>{p.name}</strong>
              <span className="muted">{p.brand}</span>
              <span className="price">{formatPkr(p.displayPrice)}</span>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
