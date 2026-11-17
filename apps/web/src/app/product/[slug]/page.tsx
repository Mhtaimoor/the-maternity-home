import Link from 'next/link';
import { notFound } from 'next/navigation';
import { formatPkr } from '../../../lib/api';
import { AddToCart } from './AddToCart';
import { ProductGallery } from './ProductGallery';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const res = await fetch(`${API}/products/${slug}`, { cache: 'no-store' });
  if (!res.ok) notFound();
  const product = await res.json();

  return (
    <main className="tmh-section container tmh-page-animate">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link href="/" className="text-decoration-none text-secondary">
              Home
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/shop" className="text-decoration-none text-secondary">
              Shop
            </Link>
          </li>
          {product.category && (
            <li className="breadcrumb-item">
              <Link
                href={`/shop?category=${product.category.slug}`}
                className="text-decoration-none text-secondary"
              >
                {product.category.name}
              </Link>
            </li>
          )}
          <li className="breadcrumb-item active text-dark fw-semibold" aria-current="page">
            {product.name}
          </li>
        </ol>
      </nav>

      <div className="row g-5 align-items-start">
        <div className="col-lg-6">
          <ProductGallery product={product} />
        </div>

        <div className="col-lg-6">
          <div className="tmh-panel p-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <span className="tmh-chip">{product.brand || 'The Maternity Home'}</span>
              <span className="text-secondary small font-monospace">SKU: {product.sku}</span>
            </div>

            <h1 className="tmh-display h2 mt-2 mb-3">{product.name}</h1>

            <div className="d-flex align-items-baseline gap-3 mb-3">
              <div className="tmh-price fs-2">{formatPkr(product.displayPrice)}</div>
              {product.salePrice && (
                <div className="text-decoration-line-through text-muted fs-5">
                  {formatPkr(product.sellingPrice)}
                </div>
              )}
            </div>

            {product.description && (
              <p className="text-secondary" style={{ lineHeight: 1.7 }}>
                {product.description}
              </p>
            )}

            <div
              className="p-3 rounded-3 mb-3 d-flex align-items-center gap-3"
              style={{ background: 'var(--tmh-sage-light)', border: '1px solid var(--tmh-line)' }}
            >
              <i className="bi bi-truck fs-3 text-success" />
              <div className="small">
                <strong>Cash on Delivery & Courier Shipping</strong>
                <div className="text-secondary">
                  Calculated by city at checkout. 2–5 business days delivery across Pakistan.
                </div>
              </div>
            </div>

            <AddToCart variants={product.variants || []} />
          </div>
        </div>
      </div>
    </main>
  );
}
