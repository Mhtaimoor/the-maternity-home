'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';

const SKU_THUMBS: Record<string, string> = {
  'TMH-MP-001': '/images/product-maternity-pads.jpg',
  'TMH-NO-010': '/images/product-onesie.jpg',
  'TMH-FB-250': '/images/product-bottle.jpg',
};

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
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
    const [p, c] = await Promise.all([api<any[]>('/admin/products'), api<any[]>('/admin/categories')]);
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
      body: JSON.stringify({ productId, variantId, delta, reason: delta > 0 ? 'Restock' : 'Correction' }),
    });
    await load();
  }

  return (
    <div>
      <h1 className="tmh-brand h2 mb-4">Products</h1>
      <div className="row g-3">
        <div className="col-lg-4">
          <form className="tmh-panel tmh-form" onSubmit={createProduct}>
            <h2 className="h5">Add product</h2>
            <input className="form-control mb-2" required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            <input className="form-control mb-2" required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
            <input className="form-control mb-2" type="number" required value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })} />
            <select className="form-select mb-2" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea className="form-control mb-2" placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            <input className="form-control mb-3" type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })} />
            <button className="btn btn-tmh w-100" type="submit">Create</button>
            {msg ? <div className="small mt-2 text-secondary">{msg}</div> : null}
          </form>
        </div>
        <div className="col-lg-8">
          <div className="tmh-panel">
            <div className="table-responsive">
              <table className="table tmh-table align-middle mb-0">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => {
                    const v = p.variants?.[0];
                    const thumb = SKU_THUMBS[p.sku] || '/images/product-onesie.jpg';
                    return (
                      <tr key={p.id}>
                        <td>
                          <div className="d-flex gap-2 align-items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={thumb} alt="" className="tmh-thumb" />
                            <div>
                              <div className="fw-semibold">{p.name}</div>
                              <div className="text-secondary small">{p.sku}</div>
                            </div>
                          </div>
                        </td>
                        <td>{formatPkr(p.displayPrice)}</td>
                        <td>{v ? `${v.available} avail` : '—'}</td>
                        <td><span className="badge rounded-pill text-bg-success">{p.status}</span></td>
                        <td className="text-end">
                          {v ? (
                            <div className="btn-group">
                              <button className="btn btn-tmh-outline btn-sm" onClick={() => adjust(p.id, v.id, 5)}>+5</button>
                              <button className="btn btn-tmh-outline btn-sm" onClick={() => adjust(p.id, v.id, -1)}>-1</button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
