'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    const qs = new URLSearchParams();
    if (q) qs.set('q', q);
    if (status) qs.set('status', status);
    const data = await api<any[]>(`/admin/orders?${qs}`);
    setOrders(data);
  }

  useEffect(() => {
    if (!getTokens().accessToken) {
      router.push('/login');
      return;
    }
    void load().catch(() => router.push('/login'));
  }, [router]);

  return (
    <div>
      <h1>Orders</h1>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        <input placeholder="Search phone / order #" value={q} onChange={(e) => setQ(e.target.value)} />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All</option>
          {['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button className="btn" onClick={() => void load()}>
          Filter
        </button>
      </div>
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Status</th>
            <th>Payment</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <Link href={`/orders/${o.id}`}>{o.orderNumber}</Link>
              </td>
              <td>
                {o.customerName}
                <div className="muted">{o.customerPhone}</div>
              </td>
              <td>{o.status}</td>
              <td>
                {o.paymentMethod}/{o.paymentStatus}
              </td>
              <td>{formatPkr(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
