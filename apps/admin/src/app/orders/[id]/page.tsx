'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../../lib/api';
import { DataPanel, DataTable, PageHeader, StatusBadge } from '../../../components/ui';

const NEXT: Record<string, string> = {
  NEW: 'CONFIRMED',
  CONFIRMED: 'PROCESSING',
  PROCESSING: 'PACKED',
  PACKED: 'DISPATCHED',
  DISPATCHED: 'DELIVERED',
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [courierName, setCourierName] = useState('TCS');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [error, setError] = useState('');

  async function load() {
    setOrder(await api(`/admin/orders/${id}`));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch((e) => setError(e.message));
  }, [id, router]);

  async function setStatus(status: string) {
    setError('');
    try {
      const body: any = { status };
      if (status === 'DISPATCHED') {
        body.courierName = courierName;
        body.trackingNumber = trackingNumber;
      }
      if (status === 'CANCELLED') body.cancelReason = 'Cancelled by staff';
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
      await load();
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function markPaid() {
    await api(`/admin/orders/${id}/payment`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'PAID' }),
    });
    await load();
  }

  if (!order) return <div className="tmh-meta">Loading order…</div>;
  const next = NEXT[order.status];

  return (
    <div>
      <PageHeader
        title={order.orderNumber}
        subtitle={`${order.customerName} · ${order.customerPhone}`}
        actions={
          <Link href="/orders" className="btn btn-tmh-outline btn-sm">
            Back to queue
          </Link>
        }
      />

      <div className="row g-3">
        <div className="col-xl-8">
          <DataPanel
            title="Order details"
            actions={
              <div className="d-flex gap-2">
                <StatusBadge value={order.status} />
                <StatusBadge value={order.paymentStatus} />
              </div>
            }
            footer={`Placed ${new Date(order.createdAt).toLocaleString()}`}
          >
            <div className="tmh-panel-body border-bottom" style={{ borderColor: 'var(--tmh-line-soft)' }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="tmh-meta">City / address</div>
                  <div className="fw-semibold">{order.city}</div>
                  <div>{order.addressLine1}</div>
                </div>
                <div className="col-md-4">
                  <div className="tmh-meta">Payment</div>
                  <div className="fw-semibold">{order.paymentMethod}</div>
                  <div>{formatPkr(order.total)} total</div>
                </div>
                <div className="col-md-4">
                  <div className="tmh-meta">Courier</div>
                  <div className="fw-semibold">{order.courierName || 'Not set'}</div>
                  <div>{order.trackingNumber || 'No tracking yet'}</div>
                </div>
              </div>
            </div>
            <DataTable
              minWidth={520}
              headers={[
                { label: 'Item' },
                { label: 'Qty', className: 'text-center' },
                { label: 'Line total', className: 'text-end' },
              ]}
            >
              {order.items.map((i: any) => (
                <tr key={i.id}>
                  <td>
                    <div className="fw-semibold">{i.productName}</div>
                    <div className="tmh-meta">{i.sku}</div>
                  </td>
                  <td className="text-center">{i.quantity}</td>
                  <td className="text-end fw-semibold">{formatPkr(i.lineTotal)}</td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>

        <div className="col-xl-4">
          <DataPanel title="Fulfilment actions">
            <div className="tmh-panel-body tmh-form">
              {(order.status === 'PACKED' || next === 'DISPATCHED') && (
                <div className="d-grid gap-2 mb-3">
                  <div>
                    <label className="form-label">Courier</label>
                    <input className="form-control" value={courierName} onChange={(e) => setCourierName(e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Tracking number</label>
                    <input className="form-control" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
                  </div>
                </div>
              )}
              <div className="d-grid gap-2">
                {next ? (
                  <button className="btn btn-tmh" onClick={() => setStatus(next)}>
                    Mark {next}
                  </button>
                ) : null}
                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' ? (
                  <button className="btn btn-tmh-outline" onClick={() => setStatus('CANCELLED')}>
                    Cancel order
                  </button>
                ) : null}
                {order.paymentStatus !== 'PAID' ? (
                  <button className="btn btn-tmh-ghost" onClick={() => void markPaid()}>
                    Mark payment paid
                  </button>
                ) : null}
              </div>
              {error ? <div className="alert alert-danger mt-3 mb-0 py-2">{error}</div> : null}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
