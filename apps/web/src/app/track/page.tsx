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
    <main className="tmh-section container">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <div className="tmh-panel">
            <div className="tmh-chip mb-3">Order lookup</div>
            <h1 className="tmh-display h2">Track your order</h1>
            <p className="text-secondary">Use the order number and the phone you used at checkout.</p>
            <form className="tmh-form row g-3" onSubmit={track}>
              <div className="col-md-6">
                <label className="form-label">Order number</label>
                <input className="form-control" required value={orderNumber} onChange={(e) => setOrderNumber(e.target.value)} />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone</label>
                <input className="form-control" required value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <div className="col-12">
                <button className="btn btn-tmh" type="submit">
                  Look up
                </button>
              </div>
            </form>
            {error ? <div className="alert alert-danger mt-3 mb-0">{error}</div> : null}
            {order ? (
              <div className="mt-4 p-3 rounded-4" style={{ background: 'rgba(47,111,94,0.08)' }}>
                <div className="fw-semibold fs-5">{order.orderNumber}</div>
                <div className="text-secondary">
                  Status {order.status} · Total {formatPkr(order.total)}
                  {order.trackingNumber ? ` · ${order.courierName} ${order.trackingNumber}` : ''}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
