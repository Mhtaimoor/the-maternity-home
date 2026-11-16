'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, getTokens } from '../../lib/api';

export default function DeliveryPage() {
  const router = useRouter();
  const [zones, setZones] = useState<any[]>([]);
  const [form, setForm] = useState({ city: '', rate: 250, freeAbove: 4000 });

  async function load() {
    setZones(await api('/admin/delivery/zones'));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    await api('/admin/delivery/zones', {
      method: 'POST',
      body: JSON.stringify({ city: form.city, rate: Number(form.rate), freeAbove: Number(form.freeAbove) }),
    });
    setForm({ city: '', rate: 250, freeAbove: 4000 });
    await load();
  }

  return (
    <div>
      <h1 className="tmh-brand h2 mb-4">Delivery zones</h1>
      <div className="row g-3">
        <div className="col-md-4">
          <form className="tmh-panel tmh-form" onSubmit={save}>
            <input className="form-control mb-2" required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            <input className="form-control mb-2" type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
            <input className="form-control mb-3" type="number" value={form.freeAbove} onChange={(e) => setForm({ ...form, freeAbove: Number(e.target.value) })} />
            <button className="btn btn-tmh w-100" type="submit">Save zone</button>
          </form>
        </div>
        <div className="col-md-8">
          <div className="tmh-panel">
            <table className="table tmh-table mb-0">
              <thead><tr><th>City</th><th>Rate</th><th>Free above</th><th>COD</th></tr></thead>
              <tbody>
                {zones.map((z) => (
                  <tr key={z.id}><td>{z.city}</td><td>{z.rate}</td><td>{z.freeAbove ?? '—'}</td><td>{String(z.codAvailable)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
