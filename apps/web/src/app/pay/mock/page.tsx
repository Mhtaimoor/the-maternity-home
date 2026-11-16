'use client';

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const API = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

function MockPayInner() {
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
    <div className="tmh-panel">
      <h1 className="tmh-display h3">Mock payment gateway</h1>
      <p className="text-secondary">
        Order {order} · Ref {reference}
      </p>
      <div className="d-flex gap-2">
        <button className="btn btn-tmh" onClick={() => pay('PAID')}>
          Mark paid
        </button>
        <button className="btn btn-tmh-outline" onClick={() => pay('FAILED')}>
          Mark failed
        </button>
      </div>
      {msg ? <div className="alert alert-info mt-3 mb-0">{msg}</div> : null}
    </div>
  );
}

export default function MockPayPage() {
  return (
    <main className="tmh-section container">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <Suspense fallback={<div className="text-secondary">Loading…</div>}>
            <MockPayInner />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
