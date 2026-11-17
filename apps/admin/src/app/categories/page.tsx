'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';
import { CATALOG_PRESET_IMAGES, categoryImage } from '../../lib/images';

export default function CategoriesPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: '',
    description: '',
    imageUrl: '',
    sortOrder: 0,
    active: true,
  });
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    setRows(await api('/admin/categories'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const res = ev.target?.result as string;
      if (res) setForm((f) => ({ ...f, imageUrl: res }));
    };
    reader.readAsDataURL(file);
  }

  function startEdit(cat: any) {
    setEditingId(cat.id);
    setForm({
      name: cat.name,
      description: cat.description || '',
      imageUrl: cat.imageUrl || '',
      sortOrder: cat.sortOrder ?? 0,
      active: cat.active ?? true,
    });
    setMsg(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({ name: '', description: '', imageUrl: '', sortOrder: 0, active: true });
    setMsg(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/categories', {
        method: 'POST',
        body: JSON.stringify({
          id: editingId || undefined,
          name: form.name.trim(),
          description: form.description.trim() || undefined,
          imageUrl: form.imageUrl.trim() || undefined,
          sortOrder: Number(form.sortOrder),
          active: form.active,
        }),
      });
      setMsg({
        type: 'success',
        text: editingId ? 'Category updated' : 'Category added',
      });
      cancelEdit();
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save' });
    } finally {
      setBusy(false);
    }
  }

  async function removeCategory(cat: any) {
    if (!confirm(`Delete category "${cat.name}"?`)) return;
    try {
      await api(`/admin/categories/${cat.id}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: `Category "${cat.name}" deleted` });
      if (editingId === cat.id) cancelEdit();
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Cannot delete category' });
    }
  }

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Categories"
        subtitle="Organise the storefront browse experience, banner imagery and display hierarchy"
      />
      <div className="tmh-split">
        <DataPanel
          title={editingId ? 'Edit Category' : 'Add Category'}
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
              <label className="form-label">Category Name *</label>
              <input
                className="form-control"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Nursing & Feeding Care"
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Short subtitle for collection cards"
              />
            </div>

            <div className="mb-2">
              <label className="form-label">Category Image</label>
              <div className="d-flex gap-1 mb-2">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="d-none"
                  id="cat-img-file"
                  onChange={handleFile}
                />
                <label
                  htmlFor="cat-img-file"
                  className="btn btn-tmh-ghost btn-sm cursor-pointer"
                >
                  <i className="bi bi-upload me-1" /> Upload
                </label>
                <button
                  type="button"
                  className="btn btn-tmh-ghost btn-sm"
                  onClick={() =>
                    setForm({ ...form, imageUrl: '/images/cat-maternity.jpg' })
                  }
                >
                  Maternity Preset
                </button>
                <button
                  type="button"
                  className="btn btn-tmh-ghost btn-sm"
                  onClick={() =>
                    setForm({ ...form, imageUrl: '/images/cat-newborn.jpg' })
                  }
                >
                  Newborn Preset
                </button>
              </div>

              <input
                className="form-control form-control-sm mb-2"
                placeholder="Or paste image URL"
                value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
              />

              {form.imageUrl && (
                <div className="tmh-image-preview-card w-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt="Category preview" />
                  <button
                    type="button"
                    className="tmh-image-remove-btn"
                    onClick={() => setForm({ ...form, imageUrl: '' })}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}
            </div>

            <div className="row g-2 mb-3">
              <div className="col-6">
                <label className="form-label">Sort Order</label>
                <input
                  className="form-control"
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className="col-6 d-flex align-items-center pt-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="catActive"
                    checked={form.active}
                    onChange={(e) => setForm({ ...form, active: e.target.checked })}
                  />
                  <label className="form-check-label text-light small ms-1" htmlFor="catActive">
                    Active (Visible)
                  </label>
                </div>
              </div>
            </div>

            <button className="btn btn-tmh w-100 py-2" type="submit" disabled={busy}>
              <i className={`bi ${editingId ? 'bi-check2' : 'bi-plus-lg'} me-1`} />
              {busy ? 'Saving…' : editingId ? 'Update Category' : 'Add Category'}
            </button>
          </form>
        </DataPanel>

        <DataPanel title="Category table" footer={`${rows.length} categories configured`}>
          <DataTable
            minWidth={560}
            headers={[
              { label: 'Category' },
              { label: 'Slug' },
              { label: 'Order', className: 'text-center' },
              { label: 'Status' },
              { label: 'Actions', className: 'text-end' },
            ]}
            empty={<EmptyState title="No categories" text="Add one to start grouping products." />}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <div className="d-flex gap-2 align-items-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={categoryImage(r)} alt="" className="tmh-thumb" />
                    <div>
                      <div className="fw-semibold text-white">{r.name}</div>
                      {r.description && <div className="tmh-meta">{r.description}</div>}
                    </div>
                  </div>
                </td>
                <td className="tmh-meta">{r.slug}</td>
                <td className="text-center fw-semibold">{r.sortOrder}</td>
                <td>
                  <StatusBadge value={r.active ? 'ACTIVE' : 'DRAFT'} />
                </td>
                <td className="text-end">
                  <div className="tmh-actions">
                    <button
                      className="btn btn-tmh-ghost btn-sm"
                      onClick={() => startEdit(r)}
                      title="Edit category"
                    >
                      <i className="bi bi-pencil" /> Edit
                    </button>
                    <button
                      className="btn btn-tmh-danger btn-sm"
                      onClick={() => removeCategory(r)}
                      title="Delete category"
                    >
                      <i className="bi bi-trash" />
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
