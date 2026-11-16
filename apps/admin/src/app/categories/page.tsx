'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';

export default function CategoriesPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [name, setName] = useState('');

  async function load() {
    setRows(await api('/admin/categories'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/categories', { method: 'POST', body: JSON.stringify({ name }) });
    setName('');
    await load();
  }

  return (
    <div>
      <h1>Categories</h1>
      <form className="form" onSubmit={create} style={{ marginBottom: '1rem' }}>
        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name" />
        <button className="btn" type="submit">
          Add
        </button>
      </form>
      <table className="table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Slug</th>
            <th>Active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.name}</td>
              <td>{r.slug}</td>
              <td>{String(r.active)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
