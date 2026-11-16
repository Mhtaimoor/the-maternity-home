'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

export default function CouponsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    code: '',
    type: 'PERCENT',
    value: 10,
    minOrder: 0,
    usageLimit: '',
    active: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    setRows(await api('/admin/coupons'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  function startEdit(c: any) {
    setEditingId(c.id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minOrder: c.minOrder ?? 0,
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : '',
      active: c.active ?? true,
    });
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ code: '', type: 'PERCENT', value: 10, minOrder: 0, usageLimit: '', active: true });
    setMsg(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          id: editingId || undefined,
          code: form.code.trim().toUpperCase(),
          type: form.type,
          value: Number(form.value),
          minOrder: Number(form.minOrder),
          usageLimit: form.usageLimit ? Number(form.usageLimit) : null,
          active: form.active,
        }),
      });
      setMsg({
        type: 'success',
        text: editingId ? `Coupon "${form.code}" updated` : `Coupon "${form.code}" created`,
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save coupon' });
    } finally {
      setBusy(false);
    }
  }

  async function toggleStatus(c: any) {
    try {
      await api('/admin/coupons', {
        method: 'POST',
        body: JSON.stringify({
          id: c.id,
          code: c.code,
          type: c.type,
          value: c.value,
          minOrder: c.minOrder,
          usageLimit: c.usageLimit,
          active: !c.active,
        }),
      });
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Status change failed' });
    }
  }

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Coupons & Discounts"
        subtitle="Create promotional discount codes with usage quotas and order value conditions"
      />
      <div className="tmh-split">
        <DataPanel
          title={editingId ? 'Edit Coupon' : 'Create Coupon'}
          actions={
            editingId ? (
              <button
                type="button"
                className="btn btn-tmh-outline btn-sm"
                onClick={cancelEdit}
              >
                Cancel
              </button>
            ) : null
          }
        >
          <form className="tmh-panel-body tmh-form" onSubmit={save}>
            {msg && (
              <div
                className={`alert mb-3 py-2 ${
                  msg.type === 'success' ? 'alert-success' : 'alert-danger'
                }`}
              >
                <i
                  className={`bi me-2 ${
                    msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
                  }`}
                />
                {msg.text}
              </div>
            )}

            <div className="mb-2">
              <label className="form-label">Coupon Code *</label>
              <input
                className="form-control text-uppercase"
                required
                placeholder="WELCOME10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </div>
            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Type</label>
                <select
                  className="form-select"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FIXED">Fixed Amount (PKR)</option>
                </select>
              </div>
              <div className="col-6">
                <label className="form-label">Value *</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  min={1}
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Min Order (PKR)</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  value={form.minOrder}
                  onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Usage Limit</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  placeholder="Unlimited"
                  value={form.usageLimit}
                  onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
                />
              </div>
            </div>

            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="couponActive"
                checked={form.active}
                onChange={(e) => setForm({ ...form, active: e.target.checked })}
              />
              <label className="form-check-label text-light small ms-1" htmlFor="couponActive">
                Active (Can be redeemed at checkout)
              </label>
            </div>

            <button className="btn btn-tmh w-100 py-2" type="submit" disabled={busy}>
              <i className={`bi ${editingId ? 'bi-check2' : 'bi-ticket'} me-1`} />
              {busy ? 'Saving…' : editingId ? 'Update Coupon' : 'Save Coupon'}
            </button>
          </form>
        </DataPanel>

        <DataPanel title="Coupon Table" footer={`${rows.length} coupons configured`}>
          <DataTable
            minWidth={560}
            headers={[
              { label: 'Code' },
              { label: 'Discount' },
              { label: 'Min order' },
              { label: 'Usage' },
              { label: 'Status' },
              { label: 'Actions', className: 'text-end' },
            ]}
            empty={<EmptyState icon="bi-ticket" title="No coupons yet" text="Create your first coupon." />}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <span className="fw-bold text-white fs-6 font-monospace">{r.code}</span>
                </td>
                <td className="fw-semibold text-white">
                  {r.type === 'PERCENT' ? `${r.value}% OFF` : `Rs ${r.value} OFF`}
                </td>
                <td>{r.minOrder ? `Rs ${r.minOrder}` : 'No min'}</td>
                <td>
                  <span className="fw-semibold text-white">{r.usedCount}</span>
                  <span className="tmh-meta"> / {r.usageLimit ?? '∞'}</span>
                </td>
                <td>
                  <StatusBadge value={r.active ? 'ACTIVE' : 'DRAFT'} />
                </td>
                <td className="text-end">
                  <div className="tmh-actions">
                    <button
                      className="btn btn-tmh-ghost btn-sm"
                      onClick={() => startEdit(r)}
                      title="Edit coupon"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      className={`btn btn-sm ${
                        r.active ? 'btn-tmh-outline' : 'btn-tmh'
                      }`}
                      onClick={() => toggleStatus(r)}
                      title={r.active ? 'Deactivate' : 'Activate'}
                    >
                      {r.active ? 'Disable' : 'Enable'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
