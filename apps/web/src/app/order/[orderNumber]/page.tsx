'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, formatPkr } from '../../../lib/api';

function OrderInner() {
  const params = useParams<{ orderNumber: string }>();
  const search = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [phone, setPhone] = useState(search.get('phone') || '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function fetchOrder(phoneToUse: string) {
    if (!phoneToUse) {
      setError('Please provide your mobile phone number to view order confirmation.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const data = await api('/orders/track', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: params.orderNumber, phone: phoneToUse }),
      });
      setOrder(data);
    } catch (e: any) {
      setError(e.message || 'Unable to retrieve order details.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    const p = search.get('phone');
    if (p) {
      void fetchOrder(p);
    }
  }, [params.orderNumber, search]);

  if (!order && !search.get('phone')) {
    return (
      <div className="tmh-panel p-4 text-center">
        <h2 className="h4 mb-3">View Order Confirmation</h2>
        <p className="text-secondary small">
          Please enter the mobile number used when placing order <strong>{params.orderNumber}</strong>.
        </p>
        <div className="d-flex gap-2 justify-content-center max-w-sm mx-auto">
          <input
            className="form-control"
            style={{ maxWidth: 280 }}
            placeholder="03XX XXXXXXX"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          <button className="btn btn-tmh" onClick={() => void fetchOrder(phone)} disabled={busy}>
            {busy ? 'Loading…' : 'View'}
          </button>
        </div>
        {error && <div className="alert alert-danger mt-3 mb-0">{error}</div>}
      </div>
    );
  }

  if (error) {
    return (
      <div className="tmh-panel p-4 text-center">
        <div className="alert alert-danger mb-3">
          <i className="bi bi-exclamation-triangle-fill me-2" />
          {error}
        </div>
        <Link href="/track" className="btn btn-tmh-outline">
          Track Another Order
        </Link>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="tmh-panel p-4 text-center text-secondary">
        <span className="spinner-border spinner-border-sm me-2 text-success" />
        Loading your order confirmation…
      </div>
    );
  }

  return (
    <div className="tmh-panel p-4 tmh-page-animate">
      <div className="text-center mb-4">
        <div
          className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
          style={{ width: 68, height: 68, background: 'var(--tmh-sage-light)', color: 'var(--tmh-sage)' }}
        >
          <i className="bi bi-check2-circle fs-1" />
        </div>
        <div className="tmh-chip mb-2">Order Confirmed</div>
        <h1 className="tmh-display h2 mb-1">Thank You For Your Order!</h1>
        <p className="text-secondary">
          We have received your order <strong>{order.orderNumber}</strong> and our team is preparing it.
        </p>
      </div>

      <div className="row g-3 p-3 rounded-3 mb-4" style={{ background: 'var(--tmh-paper)', border: '1px solid var(--tmh-line)' }}>
        <div className="col-sm-6">
          <div className="text-secondary small">Delivery Details</div>
          <div className="fw-bold text-dark">{order.customerName}</div>
          <div className="small text-secondary">{order.city} · {order.addressLine1}</div>
        </div>
        <div className="col-sm-6 text-sm-end">
          <div className="text-secondary small">Payment & Total</div>
          <div className="fw-bold text-success fs-5">{formatPkr(order.total)}</div>
          <div className="small text-secondary">
            {order.paymentMethod} ({order.paymentStatus})
          </div>
        </div>
      </div>

      <div className="mb-4">
        <div className="fw-semibold small text-secondary mb-2">Ordered Items</div>
        <ul className="list-group list-group-flush rounded-3 border">
          {order.items.map((i: any) => (
            <li className="list-group-item d-flex justify-content-between align-items-center py-3 bg-white" key={i.id}>
              <div>
                <span className="fw-semibold text-dark">{i.productName}</span>
                <div className="text-secondary small">
                  {i.variantName} × {i.quantity}
                </div>
              </div>
              <strong className="text-dark fs-6">{formatPkr(i.lineTotal)}</strong>
            </li>
          ))}
        </ul>
      </div>

      <div className="alert alert-success d-flex align-items-center gap-2 mb-4" style={{ background: 'var(--tmh-sage-light)' }}>
        <i className="bi bi-whatsapp fs-4 text-success" />
        <div className="small">
          Our team may call or WhatsApp your number ({order.customerPhone}) to confirm delivery dispatch.
        </div>
      </div>

      <div className="d-flex gap-3 flex-wrap justify-content-center">
        <Link href="/track" className="btn btn-tmh-outline">
          <i className="bi bi-geo-alt me-1" /> Track Order Status
        </Link>
        <Link href="/shop" className="btn btn-tmh">
          <i className="bi bi-arrow-right me-1" /> Continue Shopping
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="tmh-section container">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <Suspense fallback={<div className="text-secondary text-center py-4">Loading…</div>}>
            <OrderInner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
