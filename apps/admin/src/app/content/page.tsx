'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader } from '../../components/ui';

const PRESET_PAGES = [
  { slug: 'about', label: 'About Us' },
  { slug: 'faq', label: 'FAQ' },
  { slug: 'shipping', label: 'Shipping Policy' },
  { slug: 'returns', label: 'Returns & Exchange' },
  { slug: 'privacy', label: 'Privacy Policy' },
  { slug: 'terms', label: 'Terms of Service' },
];

export default function ContentPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [form, setForm] = useState({ slug: 'about', title: 'About The Maternity Home', body: '' });
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  async function load() {
    const list = await api<any[]>('/content/pages');
    setPages(list);
    const initial = list.find((p) => p.slug === 'about') || list[0];
    if (initial) {
      setForm({ slug: initial.slug, title: initial.title, body: initial.body });
    }
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  function selectPreset(slug: string, label: string) {
    const existing = pages.find((p) => p.slug === slug);
    if (existing) {
      setForm({ slug: existing.slug, title: existing.title, body: existing.body });
    } else {
      setForm({ slug, title: label, body: '' });
    }
    setMsg(null);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      await api('/admin/content/pages', { method: 'POST', body: JSON.stringify(form) });
      const updated = await api<any[]>('/content/pages');
      setPages(updated);
      setMsg({ type: 'success', text: `Page "${form.title}" saved successfully.` });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to save page' });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Content Management"
        subtitle="Manage brand story, policy documents and customer support FAQs"
      />

      {/* Preset Page Quick Tabs */}
      <div className="tmh-tabs mb-3">
        {PRESET_PAGES.map((p) => (
          <button
            key={p.slug}
            type="button"
            className={`tmh-tab ${form.slug === p.slug ? 'active' : ''}`}
            onClick={() => selectPreset(p.slug, p.label)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="tmh-split">
        <DataPanel
          title={`Editing: ${form.title || form.slug}`}
          actions={
            <button
              type="button"
              className="btn btn-tmh-ghost btn-sm"
              onClick={() => setPreviewMode(!previewMode)}
            >
              <i className={`bi ${previewMode ? 'bi-pencil' : 'bi-eye'} me-1`} />
              {previewMode ? 'Edit Mode' : 'Preview'}
            </button>
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

            <div className="row g-2 mb-2">
              <div className="col-4">
                <label className="form-label">Page Slug</label>
                <input
                  className="form-control"
                  required
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                />
              </div>
              <div className="col-8">
                <label className="form-label">Page Title</label>
                <input
                  className="form-control"
                  required
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Page Body Content</label>
              {previewMode ? (
                <div
                  className="p-3 rounded-3"
                  style={{
                    background: '#0a1614',
                    border: '1px solid var(--tmh-line)',
                    minHeight: 280,
                    whiteSpace: 'pre-wrap',
                    lineHeight: 1.7,
                  }}
                >
                  {form.body || <span className="text-secondary">No content entered yet.</span>}
                </div>
              ) : (
                <textarea
                  className="form-control"
                  rows={12}
                  placeholder="Enter page text, guidelines, or frequently asked questions…"
                  value={form.body}
                  onChange={(e) => setForm({ ...form, body: e.target.value })}
                />
              )}
            </div>

            <button className="btn btn-tmh py-2 px-4" type="submit" disabled={busy}>
              <i className="bi bi-cloud-arrow-up me-1" />
              {busy ? 'Saving…' : 'Save Page Content'}
            </button>
          </form>
        </DataPanel>

        <DataPanel title="Published Pages" footer={`${pages.length} published pages`}>
          <DataTable
            minWidth={360}
            headers={[{ label: 'Page' }, { label: 'Actions', className: 'text-end' }]}
            empty={<EmptyState title="No pages" text="Save a page from the editor." />}
          >
            {pages.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="fw-semibold text-white">{p.title}</div>
                  <div className="tmh-meta">/{p.slug}</div>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-tmh-ghost btn-sm"
                    onClick={() => {
                      setForm({ slug: p.slug, title: p.title, body: p.body });
                      setPreviewMode(false);
                      setMsg(null);
                    }}
                  >
                    <i className="bi bi-pencil" /> Edit
                  </button>
                </td>
              </tr>
            ))}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
