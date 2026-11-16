'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';

export default function ReportsPage() {
  const router = useRouter();
  const [sales, setSales] = useState<any[]>([]);
  const [byStatus, setByStatus] = useState<any[]>([]);

  useEffect(() => {
    if (!getTokens().accessToken) {
      router.push('/login');
      return;
    }
    void Promise.all([api('/admin/reports/sales'), api('/admin/reports/orders-by-status')])
      .then(([s, b]) => {
        setSales(s as any[]);
        setByStatus(b as any[]);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  return (
    <div>
      <h1>Reports</h1>
      <h2>Orders by status</h2>
      <table className="table">
        <tbody>
          {byStatus.map((r) => (
            <tr key={r.status}>
              <td>{r.status}</td>
              <td>{r.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <h2>Sales by date</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Orders</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          {sales.map((r) => (
            <tr key={r.date}>
              <td>{r.date}</td>
              <td>{r.orders}</td>
              <td>{formatPkr(r.revenue)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
