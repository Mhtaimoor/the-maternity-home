'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

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
      <PageHeader title="Categories" subtitle="Organise the storefront browse experience" />
      <div className="tmh-split">
        <DataPanel title="Add category">
          <form className="tmh-panel-body tmh-form" onSubmit={create}>
            <label className="form-label">Name</label>
            <input className="form-control mb-3" required value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Nursing care" />
            <button className="btn btn-tmh w-100" type="submit">Add category</button>
          </form>
        </DataPanel>
        <DataPanel title="Category table" footer={`${rows.length} categories`}>
          <DataTable
            minWidth={520}
            headers={[
              { label: 'Name' },
              { label: 'Slug' },
              { label: 'Order', className: 'text-center' },
              { label: 'Status' },
            ]}
            empty={<EmptyState title="No categories" text="Add one to start grouping products." />}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="fw-semibold">{r.name}</td>
                <td className="tmh-meta">{r.slug}</td>
                <td className="text-center">{r.sortOrder}</td>
                <td><StatusBadge value={r.active ? 'ACTIVE' : 'DRAFT'} /></td>
              </tr>
            ))}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
