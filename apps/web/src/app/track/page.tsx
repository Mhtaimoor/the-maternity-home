'use client';

import { useState } from 'react';
import { api, formatPkr } from '../../lib/api';

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);
    try {
      const data = await api('/orders/track', {
        method: 'POST',
        body: JSON.stringify({ orderNumber, phone }),
      });
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'Not found');
    }
  }

  return (
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Track order</h1>
      <form className="form" onSubmit={track}>
        <label>
          Order number
          <input required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
        </label>
        <label>
          Phone used at checkout
          <input required value={phone} onChange={(e) => setPhone(e.target.value)} />
        </label>
        <button className="btn" type="submit">
          Look up
        </button>
      </form>
      {error ? <p className="error">{error}</p> : null}
      {order ? (
        <div style={{ marginTop: '1.5rem' }}>
          <p>
            <strong>{order.orderNumber}</strong> — {order.status}
          </p>
          <p className="muted">
            Total {formatPkr(order.total)}
            {order.trackingNumber
              ? ` · ${order.courierName} ${order.trackingNumber}`
              : ''}
          </p>
        </div>
      ) : null}
    </main>
  );
}
