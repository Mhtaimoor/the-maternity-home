'use client';

import Link from 'next/link';
import { useState } from 'react';
import { api, getCartId } from '../../../lib/api';

export function AddToCart({
  variants,
}: {
  variants: Array<{ id: string; name: string; available: number; unitPrice: number }>;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = variants.find((v) => v.id === variantId);

  async function add() {
    if (!selected) return;
    setBusy(true);
    setErrorMsg('');
    try {
      getCartId();
      await api('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ variantId, quantity: qty }),
      });
      setAdded(true);
      setTimeout(() => setAdded(false), 6000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to add item to cart');
    } finally {
      setBusy(false);
    }
  }

  function decrement() {
    setQty((q) => Math.max(1, q - 1));
  }

  function increment() {
    const max = selected?.available || 99;
    setQty((q) => Math.min(max, q + 1));
  }

  return (
    <div className="tmh-form d-grid gap-3 mt-4 pt-3 border-top">
      {variants.length > 1 && (
        <div>
          <label className="form-label">Select Option / Variant</label>
          <div className="d-flex gap-2 flex-wrap">
            {variants.map((v) => (
              <button
                key={v.id}
                type="button"
                className={`btn btn-sm ${
                  variantId === v.id ? 'btn-tmh' : 'btn-tmh-outline'
                }`}
                onClick={() => {
                  setVariantId(v.id);
                  setQty(1);
                }}
              >
                {v.name} ({v.available} in stock)
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="form-label">Quantity</label>
        <div className="d-flex align-items-center gap-3">
          <div className="tmh-qty-control">
            <button
              type="button"
              className="tmh-qty-btn"
              onClick={decrement}
              disabled={qty <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>
            <span className="tmh-qty-val">{qty}</span>
            <button
              type="button"
              className="tmh-qty-btn"
              onClick={increment}
              disabled={!selected || qty >= selected.available}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
          <span className="text-secondary small">
            {selected?.available ? `${selected.available} units available` : 'Out of stock'}
          </span>
        </div>
      </div>

      <div className="d-flex gap-2 flex-wrap mt-2">
        <button
          className="btn btn-tmh flex-grow-1 py-3"
          disabled={busy || !selected || selected.available < 1}
          onClick={add}
        >
          {busy ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
              Adding to Cart…
            </>
          ) : selected?.available ? (
            <>
              <i className="bi bi-bag-plus-fill me-2 fs-5" />
              Add to Shopping Cart
            </>
          ) : (
            'Currently Out of Stock'
          )}
        </button>
      </div>

      {added && (
        <div className="alert alert-success d-flex align-items-center justify-content-between p-3 mt-2">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-check-circle-fill fs-5" />
            <div>
              <strong>Added to your cart!</strong>
              <div className="small">{qty} item(s) ready for checkout.</div>
            </div>
          </div>
          <Link href="/cart" className="btn btn-sm btn-tmh">
            View Cart <i className="bi bi-arrow-right ms-1" />
          </Link>
        </div>
      )}

      {errorMsg && (
        <div className="alert alert-danger py-2 mb-0">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {errorMsg}
        </div>
      )}
    </div>
  );
}
