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
    setOrder(await api(`/admin/orders/${id}`));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch((e) => setError(e.message));
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

  if (!order) return <div className="text-secondary">Loading…</div>;
  const next = NEXT[order.status];

  return (
    <div className="row g-3">
      <div className="col-lg-8">
        <div className="tmh-panel">
          <h1 className="tmh-brand h2">{order.orderNumber}</h1>
          <p className="text-secondary">
            {order.customerName} · {order.customerPhone} · {order.city}
          </p>
          <p>
            Status <span className="badge rounded-pill text-bg-success">{order.status}</span> · Payment{' '}
            {order.paymentMethod}/{order.paymentStatus} · <strong>{formatPkr(order.total)}</strong>
          </p>
          <ul className="list-group list-group-flush">
            {order.items.map((i: any) => (
              <li className="list-group-item bg-transparent text-white d-flex justify-content-between px-0" key={i.id}>
                <span>{i.productName} × {i.quantity}</span>
                <strong>{formatPkr(i.lineTotal)}</strong>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="col-lg-4">
        <div className="tmh-panel tmh-form">
          <h2 className="h5">Fulfilment</h2>
          {(order.status === 'PACKED' || next === 'DISPATCHED') && (
            <>
              <input className="form-control mb-2" value={courierName} onChange={(e) => setCourierName(e.target.value)} placeholder="Courier" />
              <input className="form-control mb-3" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} placeholder="Tracking #" />
            </>
          )}
          <div className="d-grid gap-2">
            {next ? <button className="btn btn-tmh" onClick={() => setStatus(next)}>Mark {next}</button> : null}
            {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
              <button className="btn btn-tmh-outline" onClick={() => setStatus('CANCELLED')}>Cancel</button>
            ) : null}
            {order.paymentStatus !== 'PAID' ? (
              <button className="btn btn-tmh-outline" onClick={() => void markPaid()}>Mark paid</button>
            ) : null}
          </div>
          {error ? <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div> : null}
        </div>
      </div>
    </div>
  );
}
