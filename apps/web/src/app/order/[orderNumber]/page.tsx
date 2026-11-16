'use client';

import { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import { api, formatPkr } from '../../../lib/api';

export default function OrderConfirmationPage() {
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

  if (error) return <main className="section container error">{error}</main>;
  if (!order) return <main className="section container muted">Loading…</main>;

  return (
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Order confirmed</h1>
      <p>
        Order <strong>{order.orderNumber}</strong> · Status {order.status}
      </p>
      <p className="muted">
        Payment: {order.paymentMethod} ({order.paymentStatus}) · Total {formatPkr(order.total)}
      </p>
      <ul>
        {order.items.map((i: any) => (
          <li key={i.id}>
            {i.productName} × {i.quantity} — {formatPkr(i.lineTotal)}
          </li>
        ))}
      </ul>
      <p className="muted">We will confirm by phone/WhatsApp. Keep your order number for tracking.</p>
    </main>
  );
}
