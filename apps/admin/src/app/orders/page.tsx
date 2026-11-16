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

const STATUS_TABS = [
  { id: '', label: 'All Orders' },
  { id: 'NEW', label: 'New' },
  { id: 'CONFIRMED', label: 'Confirmed' },
  { id: 'PROCESSING', label: 'Processing' },
  { id: 'PACKED', label: 'Packed' },
  { id: 'DISPATCHED', label: 'Dispatched' },
  { id: 'DELIVERED', label: 'Delivered' },
  { id: 'CANCELLED', label: 'Cancelled' },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');

  async function load(newStatus?: string) {
    setLoading(true);
    try {
      const activeStatus = newStatus !== undefined ? newStatus : status;
      const qs = new URLSearchParams();
      if (q) qs.set('q', q);
      if (activeStatus) qs.set('status', activeStatus);
      setOrders(await api<any[]>(`/admin/orders?${qs}`));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  function handleTabChange(tabId: string) {
    setStatus(tabId);
    void load(tabId);
  }

  const summary = useMemo(() => {
    const pending = orders.filter((o) =>
      ['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED'].includes(o.status),
    ).length;
    const unpaid = orders.filter((o) => o.paymentStatus !== 'PAID').length;
    return { pending, unpaid, total: orders.length };
  }, [orders]);

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Orders & Fulfilment"
        subtitle="Search, verify, dispatch and track customer orders across Pakistan"
        actions={
          <button className="btn btn-tmh-outline btn-sm" onClick={() => void load()}>
            <i className="bi bi-arrow-clockwise me-1" /> Refresh
          </button>
        }
      />

      <div className="row g-3 mb-3">
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">
              <i className="bi bi-bag text-success" /> Visible Orders
            </div>
            <div className="tmh-stat-value">{summary.total}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">
              <i className="bi bi-hourglass-split text-warning" /> In Progress
            </div>
            <div className="tmh-stat-value">{summary.pending}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="tmh-stat">
            <div className="tmh-stat-label">
              <i className="bi bi-cash-coin text-info" /> Awaiting Payment
            </div>
            <div className="tmh-stat-value">{summary.unpaid}</div>
          </div>
        </div>
      </div>

      <DataPanel
        title="Order Queue"
        footer={loading ? 'Updating…' : `${orders.length} order${orders.length === 1 ? '' : 's'} displayed`}
        toolbar={
          <div className="w-100">
            {/* Status Tabs */}
            <div className="tmh-tabs mb-2">
              {STATUS_TABS.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`tmh-tab ${status === t.id ? 'active' : ''}`}
                  onClick={() => handleTabChange(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Search Input Bar */}
            <div className="tmh-toolbar tmh-form p-0 bg-transparent border-0">
              <div style={{ minWidth: 260, flex: 1 }}>
                <input
                  className="form-control"
                  placeholder="Search by Order #, customer name, phone or address…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void load()}
                />
              </div>
              <button className="btn btn-tmh" onClick={() => void load()}>
                <i className="bi bi-search me-1" /> Search
              </button>
              {q && (
                <button
                  className="btn btn-tmh-ghost"
                  onClick={() => {
                    setQ('');
                    setTimeout(() => void load(), 0);
                  }}
                >
                  Clear
                </button>
              )}
            </div>
          </div>
        }
      >
        <DataTable
          headers={[
            { label: 'Order #' },
            { label: 'Customer' },
            { label: 'City' },
            { label: 'Status' },
            { label: 'Payment' },
            { label: 'Total', className: 'text-end' },
            { label: 'Action', className: 'text-end', width: '110px' },
          ]}
          empty={
            <EmptyState
              icon="bi-bag-x"
              title={loading ? 'Loading orders…' : 'No orders found'}
              text="Try selecting another status tab or clear your search."
            />
          }
        >
          {orders.map((o) => (
            <tr key={o.id}>
              <td>
                <SoftLink href={`/orders/${o.id}`}>
                  <span className="fw-bold">{o.orderNumber}</span>
                </SoftLink>
                <div className="tmh-meta">{new Date(o.createdAt).toLocaleString()}</div>
              </td>
              <td>
                <div className="fw-semibold text-white">{o.customerName}</div>
                <div className="tmh-meta">{o.customerPhone}</div>
              </td>
              <td className="text-white">{o.city}</td>
              <td>
                <StatusBadge value={o.status} />
              </td>
              <td>
                <div className="small text-white fw-semibold mb-1">{o.paymentMethod}</div>
                <StatusBadge value={o.paymentStatus} />
              </td>
              <td className="text-end fw-semibold text-white fs-6">
                {formatPkr(o.total)}
              </td>
              <td className="text-end">
                <SoftLink href={`/orders/${o.id}`}>
                  <span className="btn btn-tmh btn-sm">Open</span>
                </SoftLink>
              </td>
            </tr>
          ))}
        </DataTable>
      </DataPanel>
    </div>
  );
}
