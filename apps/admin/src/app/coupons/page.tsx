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
      <h1>Coupons</h1>
      <form className="form" onSubmit={save}>
        <input required placeholder="CODE" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
          <option value="PERCENT">Percent</option>
          <option value="FIXED">Fixed</option>
        </select>
        <input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
        <input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
        <button className="btn" type="submit">
          Save coupon
        </button>
      </form>
      <table className="table" style={{ marginTop: '1rem' }}>
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Used</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.code}</td>
              <td>{r.type}</td>
              <td>{r.value}</td>
              <td>
                {r.usedCount}/{r.usageLimit ?? '∞'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
