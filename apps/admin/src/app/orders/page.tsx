'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import {
  DataPanel,
  DataTable,
  EmptyState,
  PageHeader,
  SoftLink,
  StatusBadge,
} from '../../components/ui';

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (status) qs.set('status', status);
      setOrders(await api<any[]>(`/admin/orders?${qs}`));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  const summary = useMemo(() => {
    const pending = orders.filter((o) => ['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(o.status)).length;
    const unpaid = orders.filter((o) => o.paymentStatus !== 'PAID').length;
    return { pending, unpaid, total: orders.length };
  }, [orders]);

  return (
    <div>
      <PageHeader
        title="Orders"
        subtitle="Search, filter and fulfil the daily order desk"
        actions={
          <button className="btn btn-tmh-outline btn-sm" onClick={() => void load()}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-md-4"><div className="tmh-stat"><div className="tmh-stat-label">Visible orders</div><div className="tmh-stat-value">{summary.total}</div></div></div>
        <div className="col-md-4"><div className="tmh-stat"><div className="tmh-stat-label">In progress</div><div className="tmh-stat-value">{summary.pending}</div></div></div>
        <div className="col-md-4"><div className="tmh-stat"><div className="tmh-stat-label">Awaiting payment</div><div className="tmh-stat-value">{summary.unpaid}</div></div></div>
      </div>

      <DataPanel
        title="Order queue"
        footer={loading ? 'Loading…' : `${orders.length} result${orders.length === 1 ? '' : 's'}`}
        toolbar={
          <div className="tmh-toolbar tmh-form">
            <div style={{ minWidth: 220, flex: 1 }}>
              <label className="form-label">Search</label>
              <input
                className="form-control"
                placeholder="Order #, name or phone"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void load()}
              />
            </div>
            <div style={{ minWidth: 180 }}>
              <label className="form-label">Status</label>
              <select className="form-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="">All statuses</option>
                {['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED', 'CANCELLED'].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <button className="btn btn-tmh" onClick={() => void load()}>
              Apply filters
            </button>
          </div>
        }
      >
        <DataTable
          headers={[
            { label: 'Order' },
            { label: 'Customer' },
            { label: 'City' },
            { label: 'Status' },
            { label: 'Payment' },
            { label: 'Total', className: 'text-end' },
            { label: '', className: 'text-end', width: '110px' },
          ]}
          empty={
            <EmptyState
              icon="bi-bag-x"
              title={loading ? 'Loading orders…' : 'No orders match'}
              text="Try clearing filters or wait for a new checkout."
            />
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <SoftLink href={`/orders/${o.id}`}>{o.orderNumber}</SoftLink>
                <div className="tmh-meta">{new Date(o.createdAt).toLocaleString()}</div>
              </td>
              <td>
                <div className="fw-semibold">{o.customerName}</div>
                <div className="tmh-meta">{o.customerPhone}</div>
              </td>
              <td>{o.city}</td>
              <td><StatusBadge value={o.status} /></td>
              <td>
                <div>{o.paymentMethod}</div>
                <StatusBadge value={o.paymentStatus} />
              </td>
              <td className="text-end fw-semibold">{formatPkr(o.total)}</td>
              <td className="text-end">
                <SoftLink href={`/orders/${o.id}`}>
                  <span className="btn btn-tmh-ghost btn-sm">Open</span>
                </SoftLink>
              </td>
            </tr>
          ))}
        </DataTable>
      </DataPanel>
    </div>
  );
}
