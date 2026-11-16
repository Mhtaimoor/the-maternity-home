'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!getTokens().accessToken) {
      router.push('/login');
      return;
    }
    void api('/admin/reports/dashboard')
      .then(setData)
      .catch((e) => {
        setError(e.message);
        if (String(e.message).includes('401')) router.push('/login');
      });
  }, [router]);

  if (error) return <p className="error">{error}</p>;
  if (!data) return <p className="muted">Loading dashboard…</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="cards" style={{ marginBottom: '1.25rem' }}>
        <div className="card">
          <div className="muted">Today’s orders</div>
          <strong style={{ fontSize: '1.6rem' }}>{data.todayOrders}</strong>
        </div>
        <div className="card">
          <div className="muted">Pending</div>
          <strong style={{ fontSize: '1.6rem' }}>{data.pendingOrders}</strong>
        </div>
        <div className="card">
          <div className="muted">Paid sales today</div>
          <strong style={{ fontSize: '1.6rem' }}>{formatPkr(data.todaySales)}</strong>
        </div>
      </div>

      <h2>Low stock</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Product</th>
            <th>Available</th>
          </tr>
        </thead>
        <tbody>
          {data.lowStock?.length ? (
            data.lowStock.map((r: any) => (
              <tr key={r.sku}>
                <td>
                  {r.productName} ({r.variantName})
                </td>
                <td>{r.available}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={2}>None</td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Recent orders</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Status</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {data.recentOrders.map((o: any) => (
            <tr key={o.id}>
              <td>{o.orderNumber}</td>
              <td>{o.status}</td>
              <td>{formatPkr(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
