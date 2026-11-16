'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';

export default function ContentPage() {
  const router = useRouter();
  const [pages, setPages] = useState<any[]>([]);
  const [form, setForm] = useState({ slug: 'about', title: '', body: '' });

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void api<any[]>('/content/pages').then(setPages).catch(() => router.push('/login'));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/content/pages', { method: 'POST', body: JSON.stringify(form) });
    setPages(await api('/content/pages'));
  }

  return (
    <div>
      <h1 className="tmh-brand h2 mb-4">Content</h1>
      <div className="row g-3">
        <div className="col-lg-7">
          <form className="tmh-panel tmh-form" onSubmit={save}>
            <input className="form-control mb-2" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" />
            <input className="form-control mb-2" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="title" />
            <textarea className="form-control mb-3" rows={8} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <button className="btn btn-tmh" type="submit">Save page</button>
          </form>
        </div>
        <div className="col-lg-5">
          <div className="tmh-panel d-grid gap-2">
            {pages.map((p) => (
              <button
                key={p.id}
                className="btn btn-tmh-outline text-start"
                onClick={() => setForm({ slug: p.slug, title: p.title, body: p.body })}
              >
                Edit {p.slug}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
