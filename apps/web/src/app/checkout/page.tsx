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
      setError(err.message || 'Checkout failed');
    } finally {
      setBusy(false);
    }
  }

  if (!cart) {
    return (
      <main className="tmh-section container">
        <div className="text-secondary">Loading checkout…</div>
      </main>
    );
  }

  return (
    <main className="tmh-section container">
      <div className="row g-4">
        <div className="col-lg-7">
          <div className="tmh-panel">
            <h1 className="tmh-display h2 mb-1">Checkout</h1>
            <p className="text-secondary mb-4">Guest checkout · secure order confirmation</p>
            <form className="tmh-form row g-3" onSubmit={placeOrder}>
              <div className="col-md-6">
                <label className="form-label">Full name</label>
                <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
              <div className="col-12">
                <label className="form-label">Email (optional)</label>
                <input className="form-control" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">City</label>
                <select className="form-select" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
                  {zones.map((z) => (
                    <option key={z.city} value={z.city}>
                      {z.city} — Rs {z.rate}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Payment</label>
                <select className="form-select" value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
                  <option value="COD">Cash on delivery</option>
                  <option value="BANK_TRANSFER">Bank / wallet transfer</option>
                  <option value="GATEWAY">Digital gateway (mock)</option>
                </select>
              </div>
              <div className="col-12">
                <label className="form-label">Address</label>
                <textarea className="form-control" required rows={3} value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Delivery notes</label>
                <input className="form-control" value={form.deliveryNotes} onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Coupon</label>
                <input className="form-control" value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} placeholder="WELCOME10" />
              </div>
              {error ? <div className="col-12"><div className="alert alert-danger mb-0">{error}</div></div> : null}
              <div className="col-12">
                <button className="btn btn-tmh" disabled={busy || !cart.items?.length} type="submit">
                  Place order
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="col-lg-5">
          <div className="tmh-panel">
            <h2 className="h5">Order summary</h2>
            <div className="text-secondary mb-2">Cart subtotal</div>
            <div className="tmh-price fs-3">{formatPkr(cart.subtotal || 0)}</div>
            <ul className="list-unstyled mt-3 mb-0">
              {(cart.items || []).map((i: any) => (
                <li key={i.variantId} className="d-flex justify-content-between py-2 border-bottom">
                  <span>
                    {i.productName} × {i.quantity}
                  </span>
                  <strong>{formatPkr(i.lineTotal)}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </main>
  );
}
