'use client';

import { useState } from 'react';
import { api, formatPkr } from '../../lib/api';

const STAGES = ['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED'];

export default function TrackPage() {
  const [orderNumber, setOrderNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function track(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setOrder(null);
    setBusy(true);
    try {
      const data = await api('/orders/track', {
        method: 'POST',
        body: JSON.stringify({ orderNumber: orderNumber.trim(), phone: phone.trim() }),
      });
      setOrder(data);
    } catch (err: any) {
      setError(err.message || 'No matching order found for this order number and phone.');
    } finally {
      setBusy(false);
    }
  }

  const currentIdx = order ? STAGES.indexOf(order.status) : -1;

  return (
    <main className="tmh-section container tmh-page-animate">
      <div className="row justify-content-center">
        <div className="col-lg-8">
          <div className="tmh-panel p-4">
            <div className="tmh-chip mb-3">Live Order Tracking</div>
            <h1 className="tmh-display h2">Track Your Package</h1>
            <p className="text-secondary mb-4">
              Enter your order number (e.g. <code>TMH-202611...</code>) and the mobile phone number used at checkout.
            </p>

            <form className="tmh-form row g-3" onSubmit={track}>
              <div className="col-md-6">
                <label className="form-label">Order Number *</label>
                <input
                  className="form-control text-uppercase"
                  required
                  placeholder="TMH-..."
                  value={orderNumber}
                  onChange={(e) => setOrderNumber(e.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label">Mobile Phone Number *</label>
                <input
                  className="form-control"
                  required
                  placeholder="03XX XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="col-12">
                <button className="btn btn-tmh py-2 px-4" disabled={busy} type="submit">
                  {busy ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                      Searching…
                    </>
                  ) : (
                    <>
                      <i className="bi bi-search me-2" />
                      Look Up Order Status
                    </>
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="alert alert-danger mt-4 mb-0">
                <i className="bi bi-exclamation-triangle-fill me-2" />
                {error}
              </div>
            )}

            {order && (
              <div
                className="mt-4 p-4 rounded-4"
                style={{
                  background: 'var(--tmh-sage-light)',
                  border: '1.5px solid var(--tmh-line)',
                  animation: 'tmhScaleIn 0.3s ease both',
                }}
              >
                <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-3">
                  <div>
                    <span className="badge bg-success-subtle text-success fs-6 mb-1">
                      Status: {order.status}
                    </span>
                    <h3 className="tmh-display h4 mb-0 text-dark">{order.orderNumber}</h3>
                    <div className="text-secondary small">
                      Placed on {new Date(order.createdAt).toLocaleDateString()} · {order.city}
                    </div>
                  </div>
                  <div className="text-end">
                    <div className="tmh-price fs-4">{formatPkr(order.total)}</div>
                    <div className="text-secondary small">{order.paymentMethod}</div>
                  </div>
                </div>

                {/* Progress Stepper */}
                <div className="my-4 py-2 border-top border-bottom">
                  <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                    {STAGES.map((st, i) => {
                      const isDone = currentIdx >= i;
                      const isCurrent = order.status === st;
                      return (
                        <div
                          key={st}
                          className="d-flex align-items-center gap-1"
                          style={{ opacity: isDone ? 1 : 0.4 }}
                        >
                          <div
                            className="rounded-circle d-flex align-items-center justify-content-center text-white"
                            style={{
                              width: 26,
                              height: 26,
                              background: isCurrent ? 'var(--tmh-sage)' : isDone ? '#2d6b5b' : '#aaa',
                              fontSize: '0.72rem',
                              fontWeight: 700,
                            }}
                          >
                            {isDone && !isCurrent ? '✓' : i + 1}
                          </div>
                          <span className={`small ${isCurrent ? 'fw-bold text-success' : 'text-dark'}`}>
                            {st}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {order.trackingNumber && (
                  <div className="p-3 bg-white rounded-3 border mb-3">
                    <div className="small text-secondary">Courier Tracking Details</div>
                    <div className="fw-bold fs-6 text-dark">
                      {order.courierName || 'Courier'}: {order.trackingNumber}
                    </div>
                  </div>
                )}

                {order.items && order.items.length > 0 && (
                  <div>
                    <div className="fw-semibold small text-secondary mb-2">Package Items</div>
                    <ul className="list-group list-group-flush rounded-3 border">
                      {order.items.map((i: any) => (
                        <li
                          key={i.id}
                          className="list-group-item d-flex justify-content-between align-items-center bg-white"
                        >
                          <div>
                            <div className="fw-semibold text-dark">{i.productName}</div>
                            <div className="text-secondary small">{i.variantName} × {i.quantity}</div>
                          </div>
                          <span className="fw-bold text-dark">{formatPkr(i.lineTotal)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
