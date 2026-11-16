'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

export default function CouponsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<any[]>([]);
  const [form, setForm] = useState({ code: '', type: 'PERCENT', value: 10, minOrder: 0 });

  async function load() {
    setRows(await api('/admin/coupons'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/coupons', {
      method: 'POST',
      body: JSON.stringify({
        code: form.code,
        type: form.type,
        value: Number(form.value),
        minOrder: Number(form.minOrder),
      }),
    });
    setForm({ code: '', type: 'PERCENT', value: 10, minOrder: 0 });
    await load();
  }

  return (
    <div>
      <PageHeader title="Coupons" subtitle="Promotions with usage tracking" />
      <div className="tmh-split">
        <DataPanel title="Create coupon">
          <form className="tmh-panel-body tmh-form" onSubmit={save}>
            <div className="mb-2">
              <label className="form-label">Code</label>
              <input className="form-control" required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Type</label>
              <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                <option value="PERCENT">Percent</option>
                <option value="FIXED">Fixed</option>
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Value</label>
              <input className="form-control" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Minimum order</label>
              <input className="form-control" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            </div>
            <button className="btn btn-tmh w-100" type="submit">Save coupon</button>
          </form>
        </DataPanel>
        <DataPanel title="Coupon table" footer={`${rows.length} coupons`}>
          <DataTable
            minWidth={560}
            headers={[
              { label: 'Code' },
              { label: 'Type' },
              { label: 'Value' },
              { label: 'Min order' },
              { label: 'Usage' },
              { label: 'Status' },
            ]}
            empty={<EmptyState icon="bi-ticket" title="No coupons yet" />}
          >
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="fw-semibold">{r.code}</td>
                <td>{r.type}</td>
                <td>{r.type === 'PERCENT' ? `${r.value}%` : r.value}</td>
                <td>{r.minOrder}</td>
                <td>{r.usedCount}/{r.usageLimit ?? '∞'}</td>
                <td><StatusBadge value={r.active ? 'ACTIVE' : 'DRAFT'} /></td>
              </tr>
            ))}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
