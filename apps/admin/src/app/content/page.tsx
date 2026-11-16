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
    else {
      void api<any[]>('/content/pages')
        .then(setPages)
        .catch(() => router.push('/login'));
    }
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/content/pages', { method: 'POST', body: JSON.stringify(form) });
    setPages(await api('/content/pages'));
  }

  return (
    <div>
      <h1>Content</h1>
      <form className="form" onSubmit={save}>
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" />
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="title" />
        <textarea rows={6} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
        <button className="btn" type="submit">
          Save page
        </button>
      </form>
      <ul>
        {pages.map((p) => (
          <li key={p.id}>
            <button
              className="btn secondary"
              onClick={() => setForm({ slug: p.slug, title: p.title, body: p.body })}
            >
              Edit {p.slug}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
