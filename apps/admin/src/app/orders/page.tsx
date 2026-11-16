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
    setOrders(await api<any[]>(`/admin/orders?${qs}`));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  return (
    <div>
      <h1 className="tmh-brand h2 mb-4">Orders</h1>
      <div className="tmh-panel mb-3">
        <div className="row g-2 align-items-end tmh-form">
          <div className="col-md-5">
            <label className="form-label">Search</label>
            <input className="form-control" placeholder="Phone / order #" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
          <div className="col-md-4">
            <label className="form-label">Status</label>
            <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">All</option>
              {['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <button className="btn btn-tmh w-100" onClick={() => void load()}>Filter</button>
          </div>
        </div>
      </div>
      <div className="tmh-panel">
        <div className="table-responsive">
          <table className="table tmh-table align-middle mb-0">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Payment</th>
                <th className="text-end">Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td><Link href={`/orders/${o.id}`}>{o.orderNumber}</Link></td>
                  <td>
                    {o.customerName}
                    <div className="text-secondary small">{o.customerPhone}</div>
                  </td>
                  <td><span className="badge rounded-pill text-bg-success">{o.status}</span></td>
                  <td>{o.paymentMethod}/{o.paymentStatus}</td>
                  <td className="text-end fw-semibold">{formatPkr(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
