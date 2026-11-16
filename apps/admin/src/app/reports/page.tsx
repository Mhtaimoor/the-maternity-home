'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

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
      <PageHeader title="Reports" subtitle="Status mix and revenue by day" />
      <div className="row g-3">
        <div className="col-lg-4">
          <DataPanel title="Orders by status" footer={`${byStatus.length} statuses`}>
            <DataTable
              minWidth={320}
              headers={[{ label: 'Status' }, { label: 'Count', className: 'text-end' }]}
              empty={<EmptyState title="No order data" />}
            >
              {byStatus.map((r) => (
                <tr key={r.status}>
                  <td><StatusBadge value={r.status} /></td>
                  <td className="text-end fw-semibold">{r.count}</td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>
        <div className="col-lg-8">
          <DataPanel title="Sales by date" footer={`${sales.length} days`}>
            <DataTable
              headers={[
                { label: 'Date' },
                { label: 'Orders', className: 'text-center' },
                { label: 'Revenue', className: 'text-end' },
              ]}
              empty={<EmptyState icon="bi-graph-up" title="No sales yet" />}
            >
              {sales.map((r) => (
                <tr key={r.date}>
                  <td className="fw-semibold">{r.date}</td>
                  <td className="text-center">{r.orders}</td>
                  <td className="text-end fw-semibold">{formatPkr(r.revenue)}</td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
