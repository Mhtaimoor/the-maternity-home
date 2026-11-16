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

  if (error) return <div className="alert alert-danger">{error}</div>;
  if (!data) return <div className="text-secondary">Loading dashboard…</div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <div className="text-secondary">Overview</div>
          <h1 className="tmh-brand h2 mb-0">Dashboard</h1>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/images/hero-maternity.jpg" alt="" className="rounded-4 d-none d-md-block" style={{ width: 140, height: 72, objectFit: 'cover' }} />
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">Today’s orders</div>
            <div className="tmh-stat-value">{data.todayOrders}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">Pending</div>
            <div className="tmh-stat-value">{data.pendingOrders}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">Paid sales today</div>
            <div className="tmh-stat-value">{formatPkr(data.todaySales)}</div>
          </div>
        </div>
      </div>

      <div className="row g-3">
        <div className="col-lg-5">
          <div className="tmh-panel h-100">
            <h2 className="h5 mb-3">Low stock</h2>
            <div className="table-responsive">
              <table className="table tmh-table align-middle mb-0">
                <tbody>
                  {data.lowStock?.length ? (
                    data.lowStock.map((r: any) => (
                      <tr key={r.sku}>
                        <td>
                          {r.productName}
                          <div className="text-secondary small">{r.variantName}</div>
                        </td>
                        <td className="text-end fw-semibold">{r.available}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td>None</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="tmh-panel h-100">
            <h2 className="h5 mb-3">Recent orders</h2>
            <div className="table-responsive">
              <table className="table tmh-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Status</th>
                    <th className="text-end">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentOrders.map((o: any) => (
                    <tr key={o.id}>
                      <td>{o.orderNumber}</td>
                      <td>
                        <span className="badge rounded-pill text-bg-success">{o.status}</span>
                      </td>
                      <td className="text-end">{formatPkr(o.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
