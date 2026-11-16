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
      <h1 className="tmh-brand h2 mb-4">Reports</h1>
      <div className="row g-3">
        <div className="col-md-4">
          <div className="tmh-panel">
            <h2 className="h5">Orders by status</h2>
            <table className="table tmh-table mb-0">
              <tbody>
                {byStatus.map((r) => (
                  <tr key={r.status}><td>{r.status}</td><td className="text-end fw-semibold">{r.count}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="col-md-8">
          <div className="tmh-panel">
            <h2 className="h5">Sales by date</h2>
            <table className="table tmh-table mb-0">
              <thead><tr><th>Date</th><th>Orders</th><th className="text-end">Revenue</th></tr></thead>
              <tbody>
                {sales.map((r) => (
                  <tr key={r.date}><td>{r.date}</td><td>{r.orders}</td><td className="text-end">{formatPkr(r.revenue)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
