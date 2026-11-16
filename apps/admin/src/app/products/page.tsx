'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import {
  DataPanel,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '../../components/ui';
import { productImage } from '../../lib/images';

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [form, setForm] = useState({
    name: '',
    sku: '',
    sellingPrice: 1000,
    categoryId: '',
    description: '',
    stock: 10,
  });
  const [msg, setMsg] = useState('');

  async function load() {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const [p, c] = await Promise.all([
      api<any[]>(`/admin/products${qs}`),
      api<any[]>('/admin/categories'),
    ]);
    setProducts(p);
    setCategories(c);
    if (c[0] && !form.categoryId) setForm((f) => ({ ...f, categoryId: c[0].id }));
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  async function createProduct(e: React.FormEvent) {
    e.preventDefault();
    setMsg('');
    try {
      await api('/admin/products', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          sku: form.sku,
          sellingPrice: Number(form.sellingPrice),
          categoryId: form.categoryId || undefined,
          description: form.description,
          status: 'ACTIVE',
          variants: [{ name: 'Default', sku: `${form.sku}-DEF`, stock: Number(form.stock) }],
        }),
      });
      setMsg('Product created');
      setForm({ ...form, name: '', sku: '', description: '' });
      await load();
    } catch (err: any) {
      setMsg(err.message);
    }
  }

  async function adjust(productId: string, variantId: string, delta: number) {
    await api('/admin/inventory/adjust', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        variantId,
        delta,
        reason: delta > 0 ? 'Restock' : 'Correction',
      }),
    });
    await load();
  }

  return (
    <div>
      <PageHeader
        title="Products"
        subtitle="Catalogue, pricing and quick stock adjustments"
      />

      <div className="tmh-split">
        <DataPanel title="Add product">
          <form className="tmh-panel-body tmh-form" onSubmit={createProduct}>
            <div className="mb-2">
              <label className="form-label">Name</label>
              <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">SKU</label>
              <input className="form-control" required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Selling price (PKR)</label>
              <input className="form-control" type="number" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
            </div>
            <div className="mb-2">
              <label className="form-label">Category</label>
              <select className="form-select" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="mb-2">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="mb-3">
              <label className="form-label">Initial stock</label>
              <input className="form-control" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            </div>
            <button className="btn btn-tmh w-100" type="submit">Create product</button>
            {msg ? <div className="tmh-meta mt-2">{msg}</div> : null}
          </form>
        </DataPanel>

        <DataPanel
          title="Catalogue table"
          footer={`${products.length} products`}
          toolbar={
            <div className="tmh-toolbar tmh-form">
              <div style={{ flex: 1, minWidth: 220 }}>
                <label className="form-label">Search catalogue</label>
                <input
                  className="form-control"
                  placeholder="Name, SKU, brand…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void load()}
                />
              </div>
              <button className="btn btn-tmh" onClick={() => void load()}>Search</button>
            </div>
          }
        >
          <DataTable
            headers={[
              { label: 'Product' },
              { label: 'Price' },
              { label: 'Stock' },
              { label: 'Status' },
              { label: 'Actions', className: 'text-end' },
            ]}
            empty={<EmptyState icon="bi-box" title="No products found" text="Create your first product on the left." />}
          >
            {products.map((p) => {
              const v = p.variants?.[0];
              const thumb = productImage(p);
              return (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt="" className="tmh-thumb" />
                      <div>
                        <div className="fw-semibold">{p.name}</div>
                        <div className="tmh-meta">{p.sku}{p.brand ? ` · ${p.brand}` : ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className="fw-semibold">{formatPkr(p.displayPrice)}</td>
                  <td>
                    {v ? (
                      <>
                        <div className="fw-semibold">{v.available} available</div>
                        <div className="tmh-meta">{v.stock} on hand · {v.reserved} reserved</div>
                      </>
                    ) : '—'}
                  </td>
                  <td><StatusBadge value={p.status} /></td>
                  <td className="text-end">
                    {v ? (
                      <div className="tmh-actions">
                        <button className="btn btn-tmh-ghost btn-sm" onClick={() => adjust(p.id, v.id, 5)}>+5</button>
                        <button className="btn btn-tmh-ghost btn-sm" onClick={() => adjust(p.id, v.id, -1)}>-1</button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              );
            })}
          </DataTable>
        </DataPanel>
      </div>
    </div>
  );
}
