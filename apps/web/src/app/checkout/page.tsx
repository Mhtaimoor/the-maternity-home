'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getCartId } from '../../lib/api';

export default function CheckoutPage() {
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [cart, setCart] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Lahore',
    addressLine1: '',
    addressLine2: '',
    deliveryNotes: '',
    paymentMethod: 'COD',
    couponCode: '',
  });

  useEffect(() => {
    void (async () => {
      getCartId();
      const [c, z] = await Promise.all([api<any>('/cart'), api<any[]>('/delivery/zones')]);
      if (c.cartId) localStorage.setItem('tmh_cart_id', c.cartId);
      setCart(c);
      setZones(z);
      if (z[0]?.city) setForm((f) => ({ ...f, city: z[0].city }));
    })().catch((e) => setError(e.message));
  }, []);

  const selectedZone = zones.find((z) => z.city === form.city) || zones[0];
  const deliveryFee =
    selectedZone &&
    (selectedZone.freeAbove == null || (cart?.subtotal || 0) < selectedZone.freeAbove)
      ? selectedZone.rate
      : 0;
  const estimatedTotal = (cart?.subtotal || 0) + deliveryFee;

  async function placeOrder(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const order = await api<any>('/checkout', {
        method: 'POST',
        body: JSON.stringify({ ...form, cartId: getCartId() }),
      });
      localStorage.removeItem('tmh_cart_id');
      router.push(`/order/${order.orderNumber}?phone=${encodeURIComponent(form.phone)}`);
    } catch (err: any) {
      setError(err.message || 'Checkout failed. Please check required fields.');
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return (
      <main className="tmh-section container tmh-page-animate">
        <div className="text-secondary text-center py-5">
          <span className="spinner-border spinner-border-sm me-2 text-success" />
          Preparing checkout…
        </div>
      </main>
    );
  }

  return (
    <main className="tmh-section container tmh-page-animate">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="tmh-panel">
            <h1 className="tmh-display h2 mb-1">Checkout & Delivery</h1>
            <p className="text-secondary mb-4">
              Direct checkout with tracked delivery across Pakistan. No account required.
            </p>

            <form className="tmh-form row g-3" onSubmit={placeOrder}>
              <div className="col-md-6">
                <label className="form-label">Full Name *</label>
                <input
                  className="form-control"
                  required
                  placeholder="e.g. Fatima Ali"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mobile Phone (WhatsApp) *</label>
                <input
                  className="form-control"
                  required
                  placeholder="03XX XXXXXXX"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Email Address (Optional)</label>
                <input
                  className="form-control"
                  type="email"
                  placeholder="For tracking receipt"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Destination City *</label>
                <select
                  className="form-select"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                >
                  {zones.map((z) => (
                    <option key={z.city} value={z.city}>
                      {z.city} — Rs {z.rate} shipping
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label">Promo / Coupon Code</label>
                <input
                  className="form-control text-uppercase"
                  placeholder="WELCOME10"
                  value={form.couponCode}
                  onChange={(e) => setForm({ ...form, couponCode: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Complete Street Address *</label>
                <textarea
                  className="form-control"
                  required
                  rows={3}
                  placeholder="House / Apartment #, Street name, Sector / Area, Landmark…"
                  value={form.addressLine1}
                  onChange={(e) => setForm({ ...form, addressLine1: e.target.value })}
                />
              </div>

              <div className="col-12">
                <label className="form-label">Delivery Instructions (Optional)</label>
                <input
                  className="form-control"
                  placeholder="e.g. Call before delivery, leave with neighbor if unavailable"
                  value={form.deliveryNotes}
                  onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })}
                />
              </div>

              {/* Interactive Payment Method Cards */}
              <div className="col-12 mt-4">
                <label className="form-label mb-2">Select Payment Method *</label>
                <div className="d-grid gap-2">
                  <div
                    className={`tmh-pay-card ${form.paymentMethod === 'COD' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, paymentMethod: 'COD' })}
                  >
                    <i className="bi bi-cash-coin fs-3 text-success" />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">Cash on Delivery (COD)</div>
                      <div className="text-secondary small">Pay cash to courier upon package delivery</div>
                    </div>
                    {form.paymentMethod === 'COD' && (
                      <i className="bi bi-check-circle-fill text-success fs-5" />
                    )}
                  </div>

                  <div
                    className={`tmh-pay-card ${form.paymentMethod === 'BANK_TRANSFER' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, paymentMethod: 'BANK_TRANSFER' })}
                  >
                    <i className="bi bi-bank fs-3 text-success" />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">Bank Transfer / Raast / EasyPaisa / JazzCash</div>
                      <div className="text-secondary small">Account details provided after checkout</div>
                    </div>
                    {form.paymentMethod === 'BANK_TRANSFER' && (
                      <i className="bi bi-check-circle-fill text-success fs-5" />
                    )}
                  </div>

                  <div
                    className={`tmh-pay-card ${form.paymentMethod === 'GATEWAY' ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, paymentMethod: 'GATEWAY' })}
                  >
                    <i className="bi bi-credit-card-2-front fs-3 text-success" />
                    <div className="flex-grow-1">
                      <div className="fw-semibold text-dark">Digital Payment Gateway (Debit/Credit Card)</div>
                      <div className="text-secondary small">Instant online checkout via card gateway</div>
                    </div>
                    {form.paymentMethod === 'GATEWAY' && (
                      <i className="bi bi-check-circle-fill text-success fs-5" />
                    )}
                  </div>
                </div>
              </div>

              {error && (
                <div className="col-12">
                  <div className="alert alert-danger py-2 mb-0">
                    <i className="bi bi-exclamation-triangle-fill me-2" />
                    {error}
                  </div>
                </div>
              )}

              <div className="col-12 mt-4">
                <button
                  className="btn btn-tmh w-100 py-3 fs-5"
                  disabled={busy || !cart.items?.length}
                  type="submit"
                >
                  {busy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Placing Your Order…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-shield-check me-2" />
                      Confirm & Place Order ({formatPkr(estimatedTotal)})
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Order Summary Column */}
        <div className="col-lg-5">
          <div className="tmh-panel sticky-lg-top" style={{ top: '5.5rem' }}>
            <h2 className="h4 mb-3">Order Summary</h2>

            <ul className="list-unstyled mb-3">
              {(cart.items || []).map((i: any) => (
                <li key={i.variantId} className="d-flex justify-content-between py-2 border-bottom">
                  <div>
                    <div className="fw-semibold text-dark">{i.productName}</div>
                    <div className="text-secondary small">
                      {i.variantName} × {i.quantity}
                    </div>
                  </div>
                  <strong className="text-dark">{formatPkr(i.lineTotal)}</strong>
                </li>
              ))}
            </ul>

            <div className="d-flex justify-content-between mb-2">
              <span className="text-secondary">Subtotal</span>
              <span className="fw-semibold text-dark">{formatPkr(cart.subtotal || 0)}</span>
            </div>

            <div className="d-flex justify-content-between mb-3 pb-2 border-bottom">
              <span className="text-secondary">
                Shipping to {form.city}
                {selectedZone?.freeAbove && (cart?.subtotal || 0) >= selectedZone.freeAbove && (
                  <span className="badge bg-success-subtle text-success ms-1">Free</span>
                )}
              </span>
              <span className="fw-semibold text-dark">
                {deliveryFee === 0 ? 'FREE' : formatPkr(deliveryFee)}
              </span>
            </div>

            <div className="d-flex justify-content-between align-items-baseline mb-3">
              <span className="fs-5 fw-bold text-dark">Total Amount</span>
              <span className="tmh-price fs-2">{formatPkr(estimatedTotal)}</span>
            </div>

            <div className="p-3 rounded-3" style={{ background: 'var(--tmh-sage-light)' }}>
              <div className="small text-secondary">
                <i className="bi bi-clock-history me-1 text-success" /> Estimated delivery:{' '}
                <strong>{selectedZone ? `${selectedZone.etaDaysMin}–${selectedZone.etaDaysMax} business days` : '2–4 days'}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
