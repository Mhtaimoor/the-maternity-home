'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import { DataPanel, DataTable, EmptyState, PageHeader, StatusBadge } from '../../components/ui';

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
      body: JSON.stringify({
        city: form.city,
        rate: Number(form.rate),
        freeAbove: Number(form.freeAbove),
      }),
    });
    setForm({ city: '', rate: 250, freeAbove: 4000 });
    await load();
  }

  return (
    <div>
      <PageHeader title="Delivery" subtitle="City rates, free-delivery thresholds and COD coverage" />
      <div className="tmh-split">
        <DataPanel title="Upsert zone">
          <form className="tmh-panel-body tmh-form" onSubmit={save}>
            <div className="mb-2">
              <label className="form-label">City</label>
              <input className="form-control" required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Rate (PKR)</label>
              <input className="form-control" type="number" value={form.rate} onChange={(e) => setForm({ ...form, rate: Number(e.target.value) })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Free above (PKR)</label>
              <input className="form-control" type="number" value={form.freeAbove} onChange={(e) => setForm({ ...form, freeAbove: Number(e.target.value) })} />
            </div>
            <button className="btn btn-tmh w-100" type="submit">Save zone</button>
          </form>
        </DataPanel>
        <DataPanel title="Delivery zones" footer={`${zones.length} cities configured`}>
          <DataTable
            minWidth={560}
            headers={[
              { label: 'City' },
              { label: 'Rate' },
              { label: 'Free above' },
              { label: 'ETA' },
              { label: 'COD' },
            ]}
            empty={<EmptyState icon="bi-geo" title="No zones yet" />}
          >
            {zones.map((z) => (
              <tr key={z.id}>
                <td className="fw-semibold">{z.city}</td>
                <td>{formatPkr(z.rate)}</td>
                <td>{z.freeAbove != null ? formatPkr(z.freeAbove) : '—'}</td>
                <td className="tmh-meta">{z.etaDaysMin}–{z.etaDaysMax} days</td>
                <td><StatusBadge value={z.codAvailable ? 'ACTIVE' : 'DRAFT'} /></td>
              </tr>
            ))}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
