import { notFound } from 'next/navigation';
import { formatPkr } from '../../../lib/api';
import { productImage } from '../../../lib/images';
import { AddToCart } from './AddToCart';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API}/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const product = await res.json();

  return (
    <main className="tmh-section container">
      <div className="row g-4 align-items-start">
        <div className="col-lg-6">
          <div className="tmh-card">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="w-100" style={{ aspectRatio: '1', objectFit: 'cover' }} src={productImage(product)} alt={product.name} />
          </div>
        </div>
        <div className="col-lg-6">
          <div className="tmh-panel">
            <div className="tmh-chip mb-3">{product.brand || 'The Maternity Home'}</div>
            <h1 className="tmh-display display-6">{product.name}</h1>
            <div className="tmh-price fs-3 mb-2">{formatPkr(product.displayPrice)}</div>
            <p className="text-secondary">SKU {product.sku}</p>
            <p className="lead fs-6">{product.description}</p>
            <div className="alert alert-success border-0" style={{ background: 'rgba(47,111,94,0.1)' }}>
              <i className="bi bi-truck me-2" />
              Delivery rates are calculated at checkout by city. COD available where listed.
            </div>
            <AddToCart variants={product.variants || []} />
          </div>
        </div>
      </div>
    </main>
  );
}
