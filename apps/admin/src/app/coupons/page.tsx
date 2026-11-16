'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';

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
    await load();
  }

  return (
    <div>
      <h1 className="tmh-brand h2 mb-4">Coupons</h1>
      <div className="row g-3">
        <div className="col-md-4">
          <form className="tmh-panel tmh-form" onSubmit={save}>
            <input className="form-control mb-2" required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
            <select className="form-select mb-2" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="PERCENT">Percent</option>
              <option value="FIXED">Fixed</option>
            </select>
            <input className="form-control mb-2" type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
            <input className="form-control mb-3" type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
            <button className="btn btn-tmh w-100" type="submit">Save coupon</button>
          </form>
        </div>
        <div className="col-md-8">
          <div className="tmh-panel">
            <table className="table tmh-table mb-0">
              <thead><tr><th>Code</th><th>Type</th><th>Value</th><th>Used</th></tr></thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}><td>{r.code}</td><td>{r.type}</td><td>{r.value}</td><td>{r.usedCount}/{r.usageLimit ?? '∞'}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
