'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

export default function DeliveryPage() {
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    city: '',
    rate: 250,
    freeAbove: 4000,
    etaDaysMin: 2,
    etaDaysMax: 4,
    codAvailable: true,
    active: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    setZones(await api('/admin/delivery/zones'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  function startEdit(z: any) {
    setEditingId(z.id);
    setForm({
      city: z.city,
      rate: z.rate,
      freeAbove: z.freeAbove ?? 4000,
      etaDaysMin: z.etaDaysMin ?? 2,
      etaDaysMax: z.etaDaysMax ?? 4,
      codAvailable: z.codAvailable ?? true,
      active: z.active ?? true,
    });
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      city: '',
      rate: 250,
      freeAbove: 4000,
      etaDaysMin: 2,
      etaDaysMax: 4,
      codAvailable: true,
      active: true,
    });
    setMsg(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/delivery/zones', {
        method: 'POST',
        body: JSON.stringify({
          id: editingId || undefined,
          city: form.city.trim(),
          rate: Number(form.rate),
          freeAbove: form.freeAbove ? Number(form.freeAbove) : null,
          etaDaysMin: Number(form.etaDaysMin),
          etaDaysMax: Number(form.etaDaysMax),
          codAvailable: form.codAvailable,
          active: form.active,
        }),
      });
      setMsg({
        type: 'success',
        text: editingId ? `Zone "${form.city}" updated` : `Zone "${form.city}" saved`,
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save zone' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Delivery & Shipping"
        subtitle="City shipping rates, estimated arrival times, COD coverage and free shipping thresholds"
      />
      <div className="tmh-split">
        <DataPanel
          title={editingId ? 'Edit Delivery Zone' : 'Add Delivery Zone'}
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
              <label className="form-label">City Name *</label>
              <input
                className="form-control"
                required
                placeholder="e.g. Faisalabad"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Rate (PKR) *</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  min={0}
                  value={form.rate}
                  onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Free Above (PKR)</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  placeholder="Optional"
                  value={form.freeAbove}
                  onChange={(e) => setForm({ ...form, freeAbove: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Min ETA (Days)</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={form.etaDaysMin}
                  onChange={(e) => setForm({ ...form, etaDaysMin: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Max ETA (Days)</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={form.etaDaysMax}
                  onChange={(e) => setForm({ ...form, etaDaysMax: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="codCheck"
                    checked={form.codAvailable}
                    onChange={(e) => setForm({ ...form, codAvailable: e.target.checked })}
                  />
                  <label className="form-check-label text-light small ms-1" htmlFor="codCheck">
                    COD Available
                  </label>
                </div>
              </div>
              <div className="col-6">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="zoneActive"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <label className="form-check-label text-light small ms-1" htmlFor="zoneActive">
                    Active Zone
                  </label>
                </div>
              </div>
            </div>

            <button className="btn btn-tmh w-100 py-2" type="submit" disabled={busy}>
              <i className={`bi ${editingId ? 'bi-check2' : 'bi-truck'} me-1`} />
              {busy ? 'Saving…' : editingId ? 'Update Zone' : 'Save Delivery Zone'}
            </button>
          </form>
        </DataPanel>

        <DataPanel title="Configured Zones" footer={`${zones.length} cities configured`}>
          <DataTable
            minWidth={560}
            headers={[
              { label: 'City' },
              { label: 'Standard Rate' },
              { label: 'Free shipping' },
              { label: 'Estimated ETA' },
              { label: 'COD' },
              { label: 'Actions', className: 'text-end' },
            ]}
            empty={<EmptyState icon="bi-geo" title="No delivery zones yet" />}
          >
            {zones.map((z) => (
              <tr key={z.id}>
                <td>
                  <span className="fw-bold text-white fs-6">{z.city}</span>
                </td>
                <td className="fw-semibold text-white">{formatPkr(z.rate)}</td>
                <td>{z.freeAbove != null ? `Above ${formatPkr(z.freeAbove)}` : 'None'}</td>
                <td>
                  <span className="badge bg-secondary-subtle text-light">
                    {z.etaDaysMin}–{z.etaDaysMax} business days
                  </span>
                </td>
                <td>
                  <StatusBadge value={z.codAvailable ? 'ACTIVE' : 'DRAFT'} />
                </td>
                <td className="text-end">
                  <div className="tmh-actions">
                    <button
                      className="btn btn-tmh-ghost btn-sm"
                      onClick={() => startEdit(z)}
                      title="Edit zone"
                    >
                      <i className="bi bi-pencil" /> Edit
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
