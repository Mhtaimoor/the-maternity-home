'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { api, formatPkr, getCartId } from '../../lib/api';

export default function CartPage() {
  const [cart, setCart] = useState<any>(null);
  const [updating, setUpdating] = useState<string | null>(null);
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
    setUpdating(variantId);
    try {
      await api('/cart/items', {
        method: 'PUT',
        body: JSON.stringify({ variantId, quantity }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setUpdating(null);
    }
  }

  if (error) {
    return (
      <main className="tmh-section container tmh-page-animate">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </div>
      </main>
    );
  }

  if (!cart) {
    return (
      <main className="tmh-section container tmh-page-animate">
        <div className="text-secondary text-center py-5">
          <span className="spinner-border spinner-border-sm me-2 text-success" />
          Loading your cart…
        </div>
      </main>
    );
  }

  const hasItems = cart.items && cart.items.length > 0;

  return (
    <main className="tmh-section container tmh-page-animate">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h1 className="tmh-display h2 mb-1">Your Shopping Cart</h1>
          <p className="text-secondary small mb-0">
            {hasItems ? `${cart.items.length} product(s) selected` : 'Cart is currently empty'}
          </p>
        </div>
        <Link href="/shop" className="btn btn-tmh-outline btn-sm">
          <i className="bi bi-arrow-left me-1" /> Continue Shopping
        </Link>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="tmh-panel">
            {!hasItems ? (
              <div className="text-center py-5">
                <i className="bi bi-bag-x fs-1 text-secondary mb-3 d-block" />
                <h2 className="h4">Your cart is empty</h2>
                <p className="text-secondary mb-4">
                  Browse our curated maternity and newborn essentials to add items to your cart.
                </p>
                <Link href="/shop" className="btn btn-tmh">
                  <i className="bi bi-bag-plus me-1" /> Start Shopping
                </Link>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="border-bottom">
                    <tr className="text-secondary small">
                      <th>Product</th>
                      <th>Quantity</th>
                      <th className="text-end">Line Total</th>
                      <th className="text-end" style={{ width: 60 }} />
                    </tr>
                  </thead>
                  <tbody>
                    {cart.items.map((item: any) => {
                      const isRowUpdating = updating === item.variantId;
                      const thumb =
                        item.imageUrl && !item.imageUrl.includes('placehold')
                          ? item.imageUrl
                          : '/images/product-onesie.jpg';

                      return (
                        <tr
                          key={item.variantId}
                          style={{
                            opacity: isRowUpdating ? 0.5 : 1,
                            transition: 'opacity 0.2s ease',
                          }}
                        >
                          <td>
                            <div className="d-flex gap-3 align-items-center">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={thumb}
                                alt=""
                                width={68}
                                height={68}
                                className="rounded-3 object-fit-cover border"
                              />
                              <div>
                                <div className="fw-semibold text-dark fs-6">{item.productName}</div>
                                <div className="text-secondary small">{item.variantName}</div>
                                <div className="tmh-price small mt-1">{formatPkr(item.unitPrice)} each</div>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="tmh-qty-control">
                              <button
                                type="button"
                                className="tmh-qty-btn"
                                onClick={() => updateQty(item.variantId, item.quantity - 1)}
                                disabled={isRowUpdating}
                                aria-label="Decrease quantity"
                              >
                                −
                              </button>
                              <span className="tmh-qty-val">{item.quantity}</span>
                              <button
                                type="button"
                                className="tmh-qty-btn"
                                onClick={() => updateQty(item.variantId, item.quantity + 1)}
                                disabled={isRowUpdating || (item.available && item.quantity >= item.available)}
                                aria-label="Increase quantity"
                              >
                                +
                              </button>
                            </div>
                          </td>

                          <td className="text-end fw-bold text-dark fs-6">
                            {formatPkr(item.lineTotal)}
                          </td>

                          <td className="text-end">
                            <button
                              type="button"
                              className="btn btn-sm text-danger p-1"
                              title="Remove item"
                              onClick={() => updateQty(item.variantId, 0)}
                              disabled={isRowUpdating}
                            >
                              <i className="bi bi-trash fs-5" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Cart Summary */}
        <div className="col-lg-4">
          <div className="tmh-panel">
            <h2 className="h4 mb-3">Order Summary</h2>

            <div className="d-flex justify-content-between align-items-center mb-2 pb-2 border-bottom">
              <span className="text-secondary">Subtotal</span>
              <span className="tmh-price fs-4">{formatPkr(cart.subtotal || 0)}</span>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-3 text-secondary small">
              <span>Shipping & Delivery</span>
              <span>Calculated at checkout</span>
            </div>

            <div
              className="p-3 rounded-3 mb-4"
              style={{ background: 'var(--tmh-sage-light)', border: '1px solid var(--tmh-line)' }}
            >
              <div className="d-flex align-items-center gap-2 small text-success fw-bold mb-1">
                <i className="bi bi-shield-check" /> Nationwide COD Available
              </div>
              <div className="text-secondary small">
                Cash on delivery & direct bank transfer accepted. Fast tracked couriers.
              </div>
            </div>

            <Link
              className={`btn btn-tmh w-100 py-3 ${!hasItems ? 'disabled' : ''}`}
              href="/checkout"
            >
              <i className="bi bi-lock-fill me-2" />
              Proceed to Checkout
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
