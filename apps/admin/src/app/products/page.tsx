'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';

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
    if (!getTokens().accessToken) {
      router.push('/login');
      return;
    }
    void load().catch(() => router.push('/login'));
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
          variants: [
            {
              name: 'Default',
              sku: `${form.sku}-DEF`,
              stock: Number(form.stock),
            },
          ],
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
      <h1>Products</h1>
      <form className="form card" onSubmit={createProduct} style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0 }}>Add product</h2>
        <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input required placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} />
        <input
          type="number"
          required
          placeholder="Selling price"
          value={form.sellingPrice}
          onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
        />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        <input
          type="number"
          placeholder="Initial stock"
          value={form.stock}
          onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
        />
        <button className="btn" type="submit">
          Create
        </button>
        {msg ? <p className="muted">{msg}</p> : null}
      </form>

      <table className="table">
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
            return (
              <tr key={p.id}>
                <td>
                  <strong>{p.name}</strong>
                  <div className="muted">{p.sku}</div>
                </td>
                <td>{formatPkr(p.displayPrice)}</td>
                <td>{v ? `${v.available} avail / ${v.stock} on hand` : '—'}</td>
                <td>{p.status}</td>
                <td>
                  {v ? (
                    <>
                      <button className="btn secondary" onClick={() => adjust(p.id, v.id, 5)}>
                        +5
                      </button>{' '}
                      <button className="btn secondary" onClick={() => adjust(p.id, v.id, -1)}>
                        -1
                      </button>
                    </>
                  ) : null}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
