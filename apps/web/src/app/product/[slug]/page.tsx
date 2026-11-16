import { notFound } from 'next/navigation';
import { formatPkr } from '../../../lib/api';
import { AddToCart } from './AddToCart';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API}/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const product = await res.json();

  return (
    <main className="section container" style={{ display: 'grid', gap: '1.5rem', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
      <div>
        {product.images?.[0]?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.images[0].url} alt={product.name} style={{ width: '100%', background: '#dde8e4' }} />
        ) : null}
      </div>
      <div>
        <p className="muted">{product.brand}</p>
        <h1 style={{ fontFamily: 'Georgia, serif', marginTop: 0 }}>{product.name}</h1>
        <p className="price" style={{ fontSize: '1.4rem' }}>
          {formatPkr(product.displayPrice)}
        </p>
        <p className="muted">SKU {product.sku}</p>
        <p style={{ lineHeight: 1.6 }}>{product.description}</p>
        <p className="muted">Delivery note: rates calculated at checkout by city.</p>
        <AddToCart variants={product.variants || []} />
      </div>
    </main>
  );
}
