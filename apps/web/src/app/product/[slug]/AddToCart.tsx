'use client';

import { useState } from 'react';
import { api, getCartId } from '../../../lib/api';

export function AddToCart({
  variants,
}: {
  variants: Array<{ id: string; name: string; available: number; unitPrice: number }>;
}) {
  const [variantId, setVariantId] = useState(variants[0]?.id || '');
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const selected = variants.find((v) => v.id === variantId);

  async function add() {
    setBusy(true);
    setMsg('');
    try {
      getCartId();
      await api('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ variantId, quantity: qty }),
      });
      setMsg('Added to cart');
    } catch (e: any) {
      setMsg(e.message || 'Failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'grid', gap: '0.75rem', maxWidth: 360 }}>
      <label>
        Variant
        <select value={variantId} onChange={(e) => setVariantId(e.target.value)}>
          {variants.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name} ({v.available} left)
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          type="number"
          min={1}
          max={selected?.available || 1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
        />
      </label>
      <button className="btn" disabled={busy || !selected || selected.available < 1} onClick={add}>
        {selected?.available ? 'Add to cart' : 'Out of stock'}
      </button>
      {msg ? <p className={msg.includes('Added') ? 'muted' : 'error'}>{msg}</p> : null}
    </div>
  );
}
