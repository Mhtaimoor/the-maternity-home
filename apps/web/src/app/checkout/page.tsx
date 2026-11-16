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

  if (!cart) return <main className="section container muted">Loading…</main>;

  return (
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Checkout</h1>
      <p className="muted">Guest checkout · Cart subtotal {formatPkr(cart.subtotal || 0)}</p>
      <form className="form" onSubmit={placeOrder}>
        <label>
          Full name
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </label>
        <label>
          Phone
          <input required value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
        </label>
        <label>
          Email (optional)
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        </label>
        <label>
          City
          <select value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })}>
            {zones.map((z) => (
              <option key={z.city} value={z.city}>
                {z.city} — delivery Rs {z.rate}
              </option>
            ))}
          </select>
        </label>
        <label>
          Address
          <textarea required value={form.addressLine1} onChange={(e) => setForm({ ...form, addressLine1: e.target.value })} />
        </label>
        <label>
          Delivery notes
          <input value={form.deliveryNotes} onChange={(e) => setForm({ ...form, deliveryNotes: e.target.value })} />
        </label>
        <label>
          Payment
          <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })}>
            <option value="COD">Cash on delivery</option>
            <option value="BANK_TRANSFER">Bank / wallet transfer</option>
            <option value="GATEWAY">Digital gateway (mock)</option>
          </select>
        </label>
        <label>
          Coupon
          <input value={form.couponCode} onChange={(e) => setForm({ ...form, couponCode: e.target.value })} placeholder="WELCOME10" />
        </label>
        {error ? <p className="error">{error}</p> : null}
        <button className="btn" disabled={busy || !cart.items?.length} type="submit">
          Place order
        </button>
      </form>
    </main>
  );
}
