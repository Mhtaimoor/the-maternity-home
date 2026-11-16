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

  if (error) {
    return (
      <main className="tmh-section container">
        <div className="alert alert-danger">{error}</div>
      </main>
    );
  }
  if (!cart) {
    return (
      <main className="tmh-section container">
        <div className="text-secondary">Loading cart…</div>
      </main>
    );
  }

  return (
    <main className="tmh-section container">
      <div className="row g-4">
        <div className="col-lg-8">
          <div className="tmh-panel">
            <h1 className="tmh-display h2 mb-4">Your cart</h1>
            {!cart.items?.length ? (
              <div>
                <p className="text-secondary">Your cart is empty.</p>
                <Link href="/shop" className="btn btn-tmh">
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle">
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
                          <div className="d-flex gap-3 align-items-center">
                            {item.imageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={item.imageUrl.includes('placehold') ? '/images/product-onesie.jpg' : item.imageUrl}
                                alt=""
                                width={64}
                                height={64}
                                className="rounded-3 object-fit-cover"
                              />
                            ) : null}
                            <div>
                              <div className="fw-semibold">{item.productName}</div>
                              <div className="text-secondary small">{item.variantName}</div>
                            </div>
                          </div>
                        </td>
                        <td style={{ width: 110 }}>
                          <input
                            className="form-control"
                            type="number"
                            min={0}
                            max={item.available}
                            defaultValue={item.quantity}
                            onBlur={(e) => updateQty(item.variantId, Number(e.target.value))}
                          />
                        </td>
                        <td className="fw-semibold">{formatPkr(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="tmh-panel">
            <div className="text-secondary">Subtotal</div>
            <div className="tmh-price display-6">{formatPkr(cart.subtotal || 0)}</div>
            <p className="text-secondary small mt-2">Delivery is calculated at checkout.</p>
            <Link
              className={`btn btn-tmh w-100 ${!cart.items?.length ? 'disabled' : ''}`}
              href="/checkout"
            >
              Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
