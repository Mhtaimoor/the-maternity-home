'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api, formatPkr, getTokens } from '../../lib/api';
import {
  DataPanel,
  DataTable,
  EmptyState,
  PageHeader,
  StatusBadge,
} from '../../components/ui';
import { CATALOG_PRESET_IMAGES, productImage } from '../../lib/images';

interface ProductFormState {
  id?: string;
  name: string;
  sku: string;
  sellingPrice: number;
  salePrice: string;
  costPrice: number;
  categoryId: string;
  brand: string;
  description: string;
  stock: number;
  lowStockThreshold: number;
  status: 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
  featured: boolean;
  imageUrl: string;
  imageAlt: string;
}

const initialFormState: ProductFormState = {
  name: '',
  sku: '',
  sellingPrice: 1500,
  salePrice: '',
  costPrice: 800,
  categoryId: '',
  brand: 'The Maternity Home',
  description: '',
  stock: 20,
  lowStockThreshold: 5,
  status: 'ACTIVE',
  featured: false,
  imageUrl: '',
  imageAlt: '',
};

export default function ProductsPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [q, setQ] = useState('');
  const [statusTab, setStatusTab] = useState<'ALL' | 'ACTIVE' | 'DRAFT' | 'LOW_STOCK'>('ALL');
  const [form, setForm] = useState<ProductFormState>(initialFormState);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [imageMode, setImageMode] = useState<'upload' | 'url' | 'preset'>('upload');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  async function load() {
    const qs = q ? `?q=${encodeURIComponent(q)}` : '';
    const [p, c] = await Promise.all([
      api<any[]>(`/admin/products${qs}`),
      api<any[]>('/admin/categories'),
    ]);
    setProducts(p);
    setCategories(c);
    if (c[0] && !form.categoryId) {
      setForm((f) => ({ ...f, categoryId: c[0].id }));
    }
  }

  useEffect(() => {
    if (!getTokens().accessToken) router.push('/login');
    else void load().catch(() => router.push('/login'));
  }, [router]);

  // Handle local image file upload
  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      setMsg({ type: 'error', text: 'Image file is too large. Please select an image under 4MB.' });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setForm((prev) => ({
          ...prev,
          imageUrl: result,
          imageAlt: prev.imageAlt || file.name.replace(/\.[^.]+$/, ''),
        }));
        setMsg({ type: 'success', text: `Loaded image "${file.name}"` });
      }
    };
    reader.readAsDataURL(file);
  }

  function startEdit(product: any) {
    setEditingId(product.id);
    const primaryImg = product.images?.[0]?.url || '';
    const firstVariant = product.variants?.[0];
    setForm({
      id: product.id,
      name: product.name,
      sku: product.sku,
      sellingPrice: product.sellingPrice,
      salePrice: product.salePrice != null ? String(product.salePrice) : '',
      costPrice: product.costPrice ?? 0,
      categoryId: product.category?.id || (categories[0]?.id ?? ''),
      brand: product.brand || 'The Maternity Home',
      description: product.description || '',
      stock: firstVariant?.stock ?? 10,
      lowStockThreshold: product.lowStockThreshold ?? 5,
      status: product.status || 'ACTIVE',
      featured: Boolean(product.featured),
      imageUrl: primaryImg,
      imageAlt: product.images?.[0]?.alt || product.name,
    });
    setMsg(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm({
      ...initialFormState,
      categoryId: categories[0]?.id || '',
    });
    setMsg(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const payload: any = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      sellingPrice: Number(form.sellingPrice),
      salePrice: form.salePrice ? Number(form.salePrice) : null,
      costPrice: Number(form.costPrice),
      categoryId: form.categoryId || undefined,
      brand: form.brand.trim() || undefined,
      description: form.description.trim() || undefined,
      lowStockThreshold: Number(form.lowStockThreshold),
      status: form.status,
      featured: form.featured,
      stock: Number(form.stock),
      images: form.imageUrl
        ? [{ url: form.imageUrl, alt: form.imageAlt || form.name }]
        : [],
    };

    try {
      if (editingId) {
        await api(`/admin/products/${editingId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        setMsg({ type: 'success', text: `Product "${form.name}" updated successfully.` });
        setEditingId(null);
      } else {
        await api('/admin/products', {
          method: 'POST',
          body: JSON.stringify({
            ...payload,
            variants: [
              {
                name: 'Default',
                sku: `${form.sku}-DEF`,
                stock: Number(form.stock),
              },
            ],
          }),
        });
        setMsg({ type: 'success', text: `Product "${form.name}" created successfully.` });
      }

      setForm({
        ...initialFormState,
        categoryId: categories[0]?.id || '',
      });
      if (fileInputRef.current) fileInputRef.current.value = '';
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Operation failed' });
    } finally {
      setBusy(false);
    }
  }

  async function deleteProduct(p: any) {
    if (!confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await api(`/admin/products/${p.id}`, { method: 'DELETE' });
      setMsg({ type: 'success', text: `Product "${p.name}" deleted.` });
      if (editingId === p.id) cancelEdit();
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to delete' });
    }
  }

  async function adjust(productId: string, variantId: string, delta: number) {
    try {
      await api('/admin/inventory/adjust', {
        method: 'POST',
        body: JSON.stringify({
          productId,
          variantId,
          delta,
          reason: delta > 0 ? 'Restock via admin' : 'Manual adjustment',
        }),
      });
      await load();
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Stock adjustment failed' });
    }
  }

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (statusTab === 'ACTIVE') return p.status === 'ACTIVE';
      if (statusTab === 'DRAFT') return p.status === 'DRAFT';
      if (statusTab === 'LOW_STOCK') {
        const v = p.variants?.[0];
        return v ? v.available <= (p.lowStockThreshold ?? 5) : false;
      }
      return true;
    });
  }, [products, statusTab]);

  const counts = useMemo(() => {
    const active = products.filter((p) => p.status === 'ACTIVE').length;
    const draft = products.filter((p) => p.status === 'DRAFT').length;
    const lowStock = products.filter((p) => {
      const v = p.variants?.[0];
      return v ? v.available <= (p.lowStockThreshold ?? 5) : false;
    }).length;
    return { all: products.length, active, draft, lowStock };
  }, [products]);

  return (
    <div className="tmh-animate-page">
      <PageHeader
        title="Products"
        subtitle="Manage product catalogue, upload photos, set pricing and adjust inventory"
      />

      <div className="tmh-split">
        {/* Product Creation / Editing Form */}
        <DataPanel
          title={editingId ? 'Edit Product' : 'Add New Product'}
          actions={
            editingId ? (
              <button
                type="button"
                className="btn btn-tmh-outline btn-sm"
                onClick={cancelEdit}
              >
                <i className="bi bi-x-circle me-1" /> Cancel Edit
              </button>
            ) : null
          }
        >
          <form className="tmh-panel-body tmh-form" onSubmit={handleSubmit}>
            {msg && (
              <div
                className={`alert mb-3 py-2 ${
                  msg.type === 'success' ? 'alert-success' : 'alert-danger'
                }`}
              >
                <i
                  className={`bi me-2 ${
                    msg.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'
                  }`}
                />
                {msg.text}
              </div>
            )}

            <div className="mb-2">
              <label className="form-label">Product Name *</label>
              <input
                className="form-control"
                required
                placeholder="e.g. Organic Cotton Swaddle"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">SKU *</label>
                <input
                  className="form-control"
                  required
                  placeholder="TMH-SW-01"
                  value={form.sku}
                  onChange={(e) => setForm({ ...form, sku: e.target.value })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Brand</label>
                <input
                  className="form-control"
                  placeholder="The Maternity Home"
                  value={form.brand}
                  onChange={(e) => setForm({ ...form, brand: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Selling Price (PKR) *</label>
                <input
                  className="form-control"
                  type="number"
                  required
                  min={0}
                  value={form.sellingPrice}
                  onChange={(e) => setForm({ ...form, sellingPrice: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Sale Price (PKR)</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  placeholder="Optional discount"
                  value={form.salePrice}
                  onChange={(e) => setForm({ ...form, salePrice: e.target.value })}
                />
              </div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Cost Price (PKR)</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  value={form.costPrice}
                  onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Category</label>
                <select
                  className="form-select"
                  value={form.categoryId}
                  onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* PRODUCT IMAGE SECTION */}
            <div className="mb-3 mt-3">
              <label className="form-label">
                <span>Product Image</span>
                {form.imageUrl && (
                  <span className="badge bg-success-subtle text-success">Image Attached</span>
                )}
              </label>

              {/* Image Source Method Selector */}
              <div className="d-flex gap-1 mb-2">
                <button
                  type="button"
                  className={`btn btn-sm ${
                    imageMode === 'upload' ? 'btn-tmh' : 'btn-tmh-ghost'
                  }`}
                  onClick={() => setImageMode('upload')}
                >
                  <i className="bi bi-cloud-upload me-1" /> Upload File
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    imageMode === 'url' ? 'btn-tmh' : 'btn-tmh-ghost'
                  }`}
                  onClick={() => setImageMode('url')}
                >
                  <i className="bi bi-link-45deg me-1" /> Image URL
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${
                    imageMode === 'preset' ? 'btn-tmh' : 'btn-tmh-ghost'
                  }`}
                  onClick={() => setImageMode('preset')}
                >
                  <i className="bi bi-grid-3x3-gap me-1" /> Presets
                </button>
              </div>

              {/* Upload File Mode */}
              {imageMode === 'upload' && (
                <div className="tmh-image-box text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="d-none"
                    id="product-file-upload"
                    onChange={handleFileUpload}
                  />
                  <label
                    htmlFor="product-file-upload"
                    className="btn btn-tmh-outline btn-sm w-100 py-2 cursor-pointer mb-1"
                  >
                    <i className="bi bi-image me-1" /> Choose Image from Computer
                  </label>
                  <div className="tmh-meta">Supports PNG, JPG, WebP up to 4MB</div>
                </div>
              )}

              {/* Direct Image URL Mode */}
              {imageMode === 'url' && (
                <div className="mb-2">
                  <input
                    className="form-control form-control-sm"
                    placeholder="https://example.com/photo.jpg or /images/..."
                    value={form.imageUrl}
                    onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
                  />
                </div>
              )}

              {/* Presets Mode */}
              {imageMode === 'preset' && (
                <div className="d-grid gap-1 mb-2">
                  {CATALOG_PRESET_IMAGES.map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      className={`tmh-preset-pill ${
                        form.imageUrl === preset.url ? 'active' : ''
                      }`}
                      onClick={() =>
                        setForm({
                          ...form,
                          imageUrl: preset.url,
                          imageAlt: preset.label,
                        })
                      }
                    >
                      <i className="bi bi-image me-1 text-success" /> {preset.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Live Image Preview Card */}
              {form.imageUrl && (
                <div className="tmh-image-preview-card mt-2 w-100">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={form.imageUrl} alt={form.imageAlt || 'Preview'} />
                  <button
                    type="button"
                    className="tmh-image-remove-btn"
                    title="Remove Image"
                    onClick={() => {
                      setForm({ ...form, imageUrl: '', imageAlt: '' });
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Initial Stock</label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
                />
              </div>
              <div className="col-6">
                <label className="form-label">Low Stock Threshold</label>
                <input
                  className="form-control"
                  type="number"
                  min={1}
                  value={form.lowStockThreshold}
                  onChange={(e) =>
                    setForm({ ...form, lowStockThreshold: Number(e.target.value) })
                  }
                />
              </div>
            </div>

            <div className="row g-2 mb-2">
              <div className="col-6">
                <label className="form-label">Status</label>
                <select
                  className="form-select"
                  value={form.status}
                  onChange={(e) =>
                    setForm({ ...form, status: e.target.value as ProductFormState['status'] })
                  }
                >
                  <option value="ACTIVE">ACTIVE (Published)</option>
                  <option value="DRAFT">DRAFT (Hidden)</option>
                  <option value="ARCHIVED">ARCHIVED</option>
                </select>
              </div>
              <div className="col-6 d-flex align-items-center pt-3">
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featuredCheck"
                    checked={form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                  />
                  <label className="form-check-label text-light small ms-1" htmlFor="featuredCheck">
                    Featured on Storefront
                  </label>
                </div>
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Product details, materials, care instructions…"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="d-grid gap-2">
              <button className="btn btn-tmh w-100 py-2" type="submit" disabled={busy}>
                <i className={`bi ${editingId ? 'bi-check2' : 'bi-plus-lg'} me-1`} />
                {busy
                  ? 'Saving…'
                  : editingId
                  ? 'Save Product Changes'
                  : 'Create Product'}
              </button>
              {editingId && (
                <button
                  type="button"
                  className="btn btn-tmh-outline w-100"
                  onClick={cancelEdit}
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </DataPanel>

        {/* Product Catalogue Table & Filters */}
        <DataPanel
          title="Catalogue Table"
          footer={`${filteredProducts.length} of ${products.length} products listed`}
          toolbar={
            <div className="w-100">
              {/* Tab Filters */}
              <div className="tmh-tabs mb-2">
                <button
                  type="button"
                  className={`tmh-tab ${statusTab === 'ALL' ? 'active' : ''}`}
                  onClick={() => setStatusTab('ALL')}
                >
                  All Products <span className="tmh-tab-count">{counts.all}</span>
                </button>
                <button
                  type="button"
                  className={`tmh-tab ${statusTab === 'ACTIVE' ? 'active' : ''}`}
                  onClick={() => setStatusTab('ACTIVE')}
                >
                  Active <span className="tmh-tab-count">{counts.active}</span>
                </button>
                <button
                  type="button"
                  className={`tmh-tab ${statusTab === 'DRAFT' ? 'active' : ''}`}
                  onClick={() => setStatusTab('DRAFT')}
                >
                  Drafts <span className="tmh-tab-count">{counts.draft}</span>
                </button>
                <button
                  type="button"
                  className={`tmh-tab ${statusTab === 'LOW_STOCK' ? 'active' : ''}`}
                  onClick={() => setStatusTab('LOW_STOCK')}
                >
                  Low Stock <span className="tmh-tab-count">{counts.lowStock}</span>
                </button>
              </div>

              {/* Search Toolbar */}
              <div className="tmh-toolbar tmh-form p-0 bg-transparent border-0">
                <div style={{ flex: 1, minWidth: 240 }}>
                  <input
                    className="form-control"
                    placeholder="Search by name, SKU or brand…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && void load()}
                  />
                </div>
                <button className="btn btn-tmh" onClick={() => void load()}>
                  <i className="bi bi-search me-1" /> Search
                </button>
                {q && (
                  <button
                    className="btn btn-tmh-ghost"
                    onClick={() => {
                      setQ('');
                      setTimeout(() => void load(), 0);
                    }}
                  >
                    Clear
                  </button>
                )}
              </div>
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
            empty={
              <EmptyState
                icon="bi-box"
                title="No products match"
                text="Create a new product using the form or adjust filters."
              />
            }
          >
            {filteredProducts.map((p) => {
              const v = p.variants?.[0];
              const thumb = productImage(p);
              const isLow = v ? v.available <= (p.lowStockThreshold ?? 5) : false;

              return (
                <tr key={p.id}>
                  <td>
                    <div className="d-flex gap-2 align-items-center">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={thumb} alt="" className="tmh-thumb" />
                      <div>
                        <div className="fw-semibold text-white">{p.name}</div>
                        <div className="tmh-meta">
                          {p.sku}
                          {p.brand ? ` · ${p.brand}` : ''}
                          {p.featured ? (
                            <span className="badge bg-warning-subtle text-warning ms-1">Featured</span>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold text-white">{formatPkr(p.displayPrice)}</div>
                    {p.salePrice && (
                      <div className="tmh-meta text-decoration-line-through">
                        {formatPkr(p.sellingPrice)}
                      </div>
                    )}
                  </td>
                  <td>
                    {v ? (
                      <>
                        <div
                          className={`fw-semibold ${
                            isLow ? 'text-warning' : 'text-white'
                          }`}
                        >
                          {v.available} available
                          {isLow && <i className="bi bi-exclamation-triangle ms-1 text-warning" />}
                        </div>
                        <div className="tmh-meta">
                          {v.stock} on hand · {v.reserved} reserved
                        </div>
                      </>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>
                    <StatusBadge value={p.status} />
                  </td>
                  <td className="text-end">
                    <div className="tmh-actions">
                      <button
                        className="btn btn-tmh-ghost btn-sm"
                        title="Edit product"
                        onClick={() => startEdit(p)}
                      >
                        <i className="bi bi-pencil" /> Edit
                      </button>

                      {v ? (
                        <>
                          <button
                            className="btn btn-tmh-ghost btn-sm"
                            title="Add 5 in stock"
                            onClick={() => adjust(p.id, v.id, 5)}
                          >
                            +5
                          </button>
                          <button
                            className="btn btn-tmh-ghost btn-sm"
                            title="Reduce 1 from stock"
                            onClick={() => adjust(p.id, v.id, -1)}
                          >
                            -1
                          </button>
                        </>
                      ) : null}

                      <button
                        className="btn btn-tmh-danger btn-sm"
                        title="Delete product"
                        onClick={() => deleteProduct(p)}
                      >
                        <i className="bi bi-trash" />
                      </button>
                    </div>
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
