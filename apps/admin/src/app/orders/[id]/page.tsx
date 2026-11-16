'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../../lib/api';

const NEXT: Record<string, string> = {
  NEW: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'DISPATCHED',
  DISPATCHED: 'DELIVERED',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [courierName, setCourierName] = useState('TCS');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  async function load() {
    const data = await api(`/admin/orders/${id}`);
    setOrder(data);
  }

  useEffect(() => {
    if (!getTokens().accessToken) {
      router.push('/login');
      return;
    }
    void load().catch((e) => setError(e.message));
  }, [id, router]);

  async function setStatus(status: string) {
    setError('');
    try {
      const body: any = { status };
      if (status === 'DISPATCHED') {
        body.courierName = courierName;
        body.trackingNumber = trackingNumber;
      }
      if (status === 'CANCELLED') body.cancelReason = 'Cancelled by staff';
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function markPaid() {
    await api(`/admin/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PAID' }),
    });
    await load();
  }

  if (!order) return <p className="muted">Loading…</p>;

  const next = NEXT[order.status];

  return (
    <div>
      <h1>{order.orderNumber}</h1>
      <p className="muted">
        {order.customerName} · {order.customerPhone} · {order.city}
      </p>
      <p>
        Status <strong>{order.status}</strong> · Payment {order.paymentMethod}/{order.paymentStatus} ·{' '}
        {formatPkr(order.total)}
      </p>
      <ul>
        {order.items.map((i: any) => (
          <li key={i.id}>
            {i.productName} × {i.quantity} — {formatPkr(i.lineTotal)}
          </li>
        ))}
      </ul>
      {order.status === 'PACKED' || next === 'DISPATCHED' ? (
        <div className="form" style={{ margin: '1rem 0' }}>
          <input value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Courier" />
          <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking #" />
        </div>
      ) : null}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {next ? (
          <button className="btn" onClick={() => setStatus(next)}>
            Mark {next}
          </button>
        ) : null}
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
          <button className="btn secondary" onClick={() => setStatus('CANCELLED')}>
            Cancel
          </button>
        ) : null}
        {order.paymentStatus !== 'PAID' ? (
          <button className="btn secondary" onClick={() => void markPaid()}>
            Mark paid
          </button>
        ) : null}
      </div>
      {error ? <p className="error">{error}</p> : null}
    </div>
  );
}
