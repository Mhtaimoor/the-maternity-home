'use client';

import { useSearchParams } from 'next/navigation';
import { useState } from 'react';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function MockPayPage() {
  const search = useSearchParams();
  const reference = search.get('ref') || '';
  const order = search.get('order') || '';
  const [msg, setMsg] = useState('');

  async function pay(status: 'PAID' | 'FAILED') {
    const res = await fetch(`${API}/payments/mock/webhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reference, status }),
    });
    const data = await res.json();
    setMsg(res.ok ? `Payment ${status} for ${data.orderNumber}` : data.message || 'Failed');
  }

  return (
    <main className="section container">
      <h1 style={{ fontFamily: 'Georgia, serif' }}>Mock payment gateway</h1>
      <p className="muted">
        Order {order} · Ref {reference}
      </p>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button className="btn" onClick={() => pay('PAID')}>
          Mark paid
        </button>
        <button className="btn secondary" onClick={() => pay('FAILED')}>
          Mark failed
        </button>
      </div>
      {msg ? <p>{msg}</p> : null}
    </main>
  );
}
