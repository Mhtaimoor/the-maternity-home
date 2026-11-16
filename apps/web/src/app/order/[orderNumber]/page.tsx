'use client';

import { Suspense, useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, formatPkr } from '../../../lib/api';

function OrderInner() {
  const params = useParams<{ orderNumber: string }>();
  const search = useSearchParams();
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const phone = search.get('phone');
    if (!phone) {
      setError('Phone required to view order');
      return;
    }
    void api('/orders/track', {
      method: 'POST',
      body: JSON.stringify({ orderNumber: params.orderNumber, phone }),
    })
      .then(setOrder)
      .catch((e) => setError(e.message));
  }, [params.orderNumber, search]);

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  if (!order) return <div className="text-secondary">Loading confirmation…</div>;

  return (
    <div className="tmh-panel">
      <div className="tmh-chip mb-3">Confirmed</div>
      <h1 className="tmh-display h2">Thank you</h1>
      <p className="lead">
        Order <strong>{order.orderNumber}</strong> is {order.status}.
      </p>
      <p className="text-secondary">
        Payment: {order.paymentMethod} ({order.paymentStatus}) · Total {formatPkr(order.total)}
      </p>
      <ul className="list-group list-group-flush mb-3">
        {order.items.map((i: any) => (
          <li className="list-group-item px-0 d-flex justify-content-between" key={i.id}>
            <span>
              {i.productName} × {i.quantity}
            </span>
            <strong>{formatPkr(i.lineTotal)}</strong>
          </li>
        ))}
      </ul>
      <div className="alert alert-success border-0 mb-0" style={{ background: 'rgba(47,111,94,0.1)' }}>
        Keep your order number for tracking. We may confirm by phone or WhatsApp.
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <main className="tmh-section container">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <Suspense fallback={<div className="text-secondary">Loading…</div>}>
            <OrderInner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
