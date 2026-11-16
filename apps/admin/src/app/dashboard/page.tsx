'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, SoftLink, StatusBadge } from '../../components/ui';
import { productImageBySku } from '../../lib/images';

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
  if (!data) return <div className="tmh-meta">Loading dashboard…</div>;

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Today’s pulse across orders, stock and sales"
        actions={
          <>
            <Link href="/orders" className="btn btn-tmh-outline btn-sm">
              Open orders
            </Link>
            <Link href="/products" className="btn btn-tmh btn-sm">
              Manage products
            </Link>
          </>
        }
      />

      <div className="row g-3 mb-3">
        {[
          { label: 'Today’s orders', value: data.todayOrders, icon: 'bi-bag' },
          { label: 'Pending queue', value: data.pendingOrders, icon: 'bi-hourglass-split' },
          { label: 'Paid sales today', value: formatPkr(data.todaySales), icon: 'bi-cash-coin' },
        ].map((s) => (
          <div className="col-md-4" key={s.label}>
            <div className="tmh-stat">
              <div className="tmh-stat-label">
                <i className={`bi ${s.icon}`} /> {s.label}
              </div>
              <div className="tmh-stat-value">{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-xl-5">
          <DataPanel title="Low stock alerts" footer={`${data.lowStock?.length || 0} items need attention`}>
            <DataTable
              minWidth={480}
              headers={[
                { label: 'Product' },
                { label: 'Available', className: 'text-end' },
              ]}
              empty={<EmptyState icon="bi-check2-circle" title="Stock looks healthy" text="No low-stock variants right now." />}
            >
              {data.lowStock?.map((r: any) => (
                <tr key={r.sku}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImageBySku(r.sku)} alt="" className="tmh-thumb" />
                      <div>
                        <div className="fw-semibold">{r.productName}</div>
                        <div className="tmh-meta">{r.variantName} · {r.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="text-end">
                    <StatusBadge value={r.available <= 2 ? 'PENDING' : 'ACTIVE'} />
                    <div className="fw-semibold mt-1">{r.available}</div>
                  </td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>
        <div className="col-xl-7">
          <DataPanel
            title="Recent orders"
            actions={
              <Link href="/orders" className="btn btn-tmh-ghost btn-sm">
                View all
              </Link>
            }
          >
            <DataTable
              minWidth={420}
              headers={[
                { label: 'Order' },
                { label: 'Status' },
                { label: 'Total', className: 'text-end' },
              ]}
              empty={<EmptyState title="No orders yet" text="New checkouts will appear here." />}
            >
              {data.recentOrders?.map((o: any) => (
                <tr key={o.id}>
                  <td>
                    <SoftLink href={`/orders/${o.id}`}>{o.orderNumber}</SoftLink>
                    <div className="tmh-meta">{new Date(o.createdAt).toLocaleString()}</div>
                  </td>
                  <td>
                    <StatusBadge value={o.status} />
                  </td>
                  <td className="text-end fw-semibold">{formatPkr(o.total)}</td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
