'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader } from '../../components/ui';

export default function ContentPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [form, setForm] = useState({ slug: 'about', title: '', body: '' });
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void api<any[]>('/content/pages').then(setPages).catch(() => router.push('/login'));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/content/pages', { method: 'POST', body: JSON.stringify(form) });
    setPages(await api('/content/pages'));
    setMsg('Page saved');
  }

  return (
    <div>
      <PageHeader title="Content" subtitle="Policy pages, about copy and FAQs" />
      <div className="tmh-split">
        <DataPanel title="Editor">
          <form className="tmh-panel-body tmh-form" onSubmit={save}>
            <div className="mb-2">
              <label className="form-label">Slug</label>
              <input className="form-control" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Title</label>
              <input className="form-control" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Body</label>
              <textarea className="form-control" rows={10} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            </div>
            <button className="btn btn-tmh" type="submit">Save page</button>
            {msg ? <span className="tmh-meta ms-2">{msg}</span> : null}
          </form>
        </DataPanel>
        <DataPanel title="Published pages" footer={`${pages.length} pages`}>
          <DataTable
            minWidth={420}
            headers={[{ label: 'Page' }, { label: '', className: 'text-end' }]}
            empty={<EmptyState title="No pages" />}
          >
            {pages.map((p) => (
              <tr key={p.id}>
                <td>
                  <div className="fw-semibold">{p.title}</div>
                  <div className="tmh-meta">/{p.slug}</div>
                </td>
                <td className="text-end">
                  <button
                    className="btn btn-tmh-ghost btn-sm"
                    onClick={() => setForm({ slug: p.slug, title: p.title, body: p.body })}
                  >
                    Edit
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
