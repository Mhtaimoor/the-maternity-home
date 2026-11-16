'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, formatPkr, getCartId } from '../../lib/api';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [error, setError] = useState('');

  async function load() {
    try {
      getCartId();
      const data = await api<any>('/cart');
      if (data.cartId) localStorage.setItem('tmh_cart_id', data.cartId);
      setCart(data);
    } catch (e: any) {
      setError(e.message);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function updateQty(variantId: string, quantity: number) {
    await api('/cart/items', {
      method: 'PUT',
      body: JSON.stringify({ variantId, quantity }),
    });
    await load();
  }

  if (error) return <main className="section container error">{error}</main>;
  if (!cart) return <main className="section container muted">Loading cart…</main>;

  return (
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Cart</h1>
      {!cart.items?.length ? (
        <p className="muted">
          Cart is empty. <Link href="/shop">Continue shopping</Link>
        </p>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Qty</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {cart.items.map((item: any) => (
                <tr key={item.variantId}>
                  <td>
                    <strong>{item.productName}</strong>
                    <div className="muted">{item.variantName}</div>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      max={item.available}
                      defaultValue={item.quantity}
                      style={{ width: 70 }}
                      onBlur={(e) => updateQty(item.variantId, Number(e.target.value))}
                    />
                  </td>
                  <td>{formatPkr(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="price">Subtotal: {formatPkr(cart.subtotal)}</p>
          <Link className="btn" href="/checkout">
            Checkout
          </Link>
        </>
      )}
    </main>
  );
}
