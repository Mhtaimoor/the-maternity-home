'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../../lib/api';
import { DataPanel, DataTable, PageHeader, StatusBadge } from '../../../components/ui';
import { productImageBySku } from '../../../lib/images';

const ORDER_FLOW = ['NEW', 'CONFIRMED', 'PROCESSING', 'PACKED', 'DISPATCHED', 'DELIVERED'];

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
  const [busy, setBusy] = useState(false);

  async function load() {
    setOrder(await api(`/admin/orders/${id}`));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch((e) => setError(e.message));
  }, [id, router]);

  async function setStatus(status: string) {
    setError('');
    setBusy(true);
    try {
      const body: any = { status };
      if (status === 'DISPATCHED') {
        body.courierName = courierName;
        body.trackingNumber = trackingNumber;
      }
      if (status === 'CANCELLED') body.cancelReason = 'Cancelled by staff in admin';
      await api(`/admin/orders/${id}/status`, { method: 'PATCH', body: JSON.stringify(body) });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  async function markPaid() {
    setBusy(true);
    try {
      await api(`/admin/orders/${id}/payment`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'PAID' }),
      });
      await load();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!order) return <div className="tmh-meta p-4">Loading order details…</div>;
  const next = NEXT[order.status];
  const currentStepIdx = ORDER_FLOW.indexOf(order.status);

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title={`Order ${order.orderNumber}`}
        subtitle={`${order.customerName} · ${order.customerPhone}`}
        actions={
          <Link href="/orders" className="btn btn-tmh-outline btn-sm">
            <i className="bi bi-arrow-left me-1" /> Back to Queue
          </Link>
        }
      />

      {/* Visual Status Stepper */}
      <div className="tmh-panel mb-3 p-3">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
          {ORDER_FLOW.map((st, i) => {
            const isCompleted = currentStepIdx >= i;
            const isCurrent = order.status === st;
            return (
              <div
                key={st}
                className="d-flex align-items-center gap-2"
                style={{ opacity: isCompleted ? 1 : 0.4 }}
              >
                <div
                  className="rounded-circle d-flex align-items-center justify-content-center"
                  style={{
                    width: 28,
                    height: 28,
                    background: isCurrent
                      ? 'var(--tmh-sage)'
                      : isCompleted
                      ? 'rgba(56, 178, 147, 0.4)'
                      : 'rgba(255, 255, 255, 0.1)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: '0.78rem',
                  }}
                >
                  {isCompleted && !isCurrent ? <i className="bi bi-check" /> : i + 1}
                </div>
                <span
                  className={`small ${
                    isCurrent ? 'fw-bold text-success' : 'text-light'
                  }`}
                >
                  {st}
                </span>
                {i < ORDER_FLOW.length - 1 && (
                  <div
                    style={{
                      width: 24,
                      height: 2,
                      background: isCompleted ? 'var(--tmh-sage)' : 'var(--tmh-line)',
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="row g-3">
        <div className="col-xl-8">
          <DataPanel
            title="Order Items & Customer Details"
            actions={
              <div className="d-flex gap-2">
                <StatusBadge value={order.status} />
                <StatusBadge value={order.paymentStatus} />
              </div>
            }
            footer={`Order placed on ${new Date(order.createdAt).toLocaleString()}`}
          >
            <div className="tmh-panel-body border-bottom" style={{ borderColor: 'var(--tmh-line-soft)' }}>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="tmh-meta">Delivery Address</div>
                  <div className="fw-semibold text-white fs-6">{order.city}</div>
                  <div className="text-light small">{order.addressLine1}</div>
                  {order.deliveryNotes && (
                    <div className="tmh-meta mt-1">Note: {order.deliveryNotes}</div>
                  )}
                </div>
                <div className="col-md-4">
                  <div className="tmh-meta">Payment Summary</div>
                  <div className="fw-semibold text-white fs-6">{order.paymentMethod}</div>
                  <div className="text-success fw-bold">{formatPkr(order.total)} Total</div>
                  <div className="tmh-meta">Status: {order.paymentStatus}</div>
                </div>
                <div className="col-md-4">
                  <div className="tmh-meta">Courier & Dispatch</div>
                  <div className="fw-semibold text-white fs-6">{order.courierName || 'Not Assigned'}</div>
                  <div className="text-light small">{order.trackingNumber || 'No tracking ID yet'}</div>
                </div>
              </div>
            </div>

            <DataTable
              minWidth={520}
              headers={[
                { label: 'Item' },
                { label: 'Unit Price' },
                { label: 'Qty', className: 'text-center' },
                { label: 'Line total', className: 'text-end' },
              ]}
            >
              {order.items.map((i: any) => (
                <tr key={i.id}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={productImageBySku(i.sku)} alt="" className="tmh-thumb" />
                      <div>
                        <div className="fw-semibold text-white">{i.productName}</div>
                        <div className="tmh-meta">{i.variantName} · {i.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td>{formatPkr(i.unitPrice)}</td>
                  <td className="text-center fw-bold text-white">{i.quantity}</td>
                  <td className="text-end fw-semibold text-white">{formatPkr(i.lineTotal)}</td>
                </tr>
              ))}
            </DataTable>
          </DataPanel>
        </div>

        <div className="col-xl-4">
          <DataPanel title="Fulfilment & Actions">
            <div className="tmh-panel-body tmh-form">
              {(order.status === 'PACKED' || next === 'DISPATCHED') && (
                <div className="d-grid gap-2 mb-3 p-3 rounded-3" style={{ background: 'rgba(0, 0, 0, 0.25)' }}>
                  <div>
                    <label className="form-label">Courier Partner</label>
                    <input
                      className="form-control"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="form-label">Tracking Number</label>
                    <input
                      className="form-control"
                      placeholder="e.g. TCS12345678"
                      value={trackingNumber}
                      onChange={(e) => setTrackingNumber(e.target.value)}
                    />
                  </div>
                </div>
              )}

              <div className="d-grid gap-2">
                {next ? (
                  <button
                    className="btn btn-tmh py-2"
                    disabled={busy}
                    onClick={() => setStatus(next)}
                  >
                    <i className="bi bi-arrow-right-circle me-1" />
                    Advance to: {next}
                  </button>
                ) : null}

                {order.paymentStatus !== 'PAID' && (
                  <button
                    className="btn btn-tmh-outline py-2"
                    disabled={busy}
                    onClick={() => void markPaid()}
                  >
                    <i className="bi bi-cash-stack me-1" />
                    Mark Payment as Paid
                  </button>
                )}

                {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
                  <button
                    className="btn btn-tmh-danger py-2 mt-2"
                    disabled={busy}
                    onClick={() => {
                      if (confirm('Cancel this order?')) setStatus('CANCELLED');
                    }}
                  >
                    <i className="bi bi-x-circle me-1" />
                    Cancel Order
                  </button>
                )}
              </div>

              {error && (
                <div className="alert alert-danger mt-3 mb-0 py-2">
                  <i className="bi bi-exclamation-triangle-fill me-1" /> {error}
                </div>
              )}
            </div>
          </DataPanel>
        </div>
      </div>
    </div>
  );
}
