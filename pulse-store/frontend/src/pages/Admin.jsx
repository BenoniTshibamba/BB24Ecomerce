import { useEffect, useState } from 'react';
import { api, money } from '../lib/api.js';
import { useToast } from '../context/store.jsx';
import { Field, Skeleton, inputCls } from '../components/ui.jsx';
import { StatusBadge } from './Orders.jsx';

const STATUSES = ['processing', 'shipped', 'delivered', 'cancelled'];

function StatCard({ label, value, sub }) {
  return (
    <div className="rounded-2xl border border-line bg-card p-5">
      <p className="text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
      <p className="mt-2 font-display text-3xl font-bold text-volt">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </div>
  );
}

const EMPTY_FORM = {
  slug: '', name: '', tagline: '', description: '', price_cents: '',
  compare_at_cents: '', category: 'headphones', image: '', colors: '',
  stock: '', featured: false,
};

function ProductModal({ product, onClose, onSaved }) {
  const { push } = useToast();
  const [form, setForm] = useState(product ? {
    slug: product.slug, name: product.name, tagline: product.tagline,
    description: product.description, price_cents: product.price_cents,
    compare_at_cents: product.compare_at_cents || '', category: product.category,
    image: product.image, colors: (JSON.parse(product.colors || '[]')).join(', '),
    stock: product.stock, featured: !!product.featured,
  } : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const set = (k, v) => setForm({ ...form, [k]: v });

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = 'Required';
    if (!form.slug.trim()) errs.slug = 'Required';
    if (!/^\d+$/.test(String(form.price_cents))) errs.price_cents = 'Price in cents, e.g. 29999';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const payload = {
        slug: form.slug.trim(), name: form.name.trim(), tagline: form.tagline.trim(),
        description: form.description.trim(), price_cents: parseInt(form.price_cents, 10),
        compare_at_cents: form.compare_at_cents ? parseInt(form.compare_at_cents, 10) : null,
        category: form.category, image: form.image.trim(),
        colors: form.colors.split(',').map((c) => c.trim()).filter(Boolean),
        stock: parseInt(form.stock || '0', 10), featured: !!form.featured,
      };
      if (product) await api.adminUpdateProduct(product.id, payload);
      else await api.adminCreateProduct(payload);
      push(product ? 'Product updated' : 'Product created');
      onSaved();
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="animate-fade-in fixed inset-0 bg-black/70" onClick={onClose} />
      <div className="relative mx-auto my-8 w-full max-w-2xl rounded-2xl border border-line bg-surface p-6">
        <h3 className="font-display text-xl font-bold">{product ? 'Edit product' : 'New product'}</h3>
        <form onSubmit={submit} className="mt-5 grid gap-4 sm:grid-cols-2">
          <Field label="Name" error={errors.name}>
            <input value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls(errors.name)} />
          </Field>
          <Field label="Slug" error={errors.slug} hint="URL-friendly, e.g. apex-one">
            <input value={form.slug} onChange={(e) => set('slug', e.target.value)} className={inputCls(errors.slug)} disabled={!!product} />
          </Field>
          <Field label="Tagline">
            <input value={form.tagline} onChange={(e) => set('tagline', e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Category">
            <select value={form.category} onChange={(e) => set('category', e.target.value)} className={inputCls()}>
              <option value="headphones">Headphones</option>
              <option value="earbuds">Earbuds</option>
              <option value="speakers">Speakers</option>
            </select>
          </Field>
          <Field label="Price (cents)" error={errors.price_cents} hint="29999 = $299.99">
            <input inputMode="numeric" value={form.price_cents} onChange={(e) => set('price_cents', e.target.value)} className={inputCls(errors.price_cents)} />
          </Field>
          <Field label="Compare-at (cents, optional)">
            <input inputMode="numeric" value={form.compare_at_cents} onChange={(e) => set('compare_at_cents', e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Image path" hint="/images/apex-one.jpg">
            <input value={form.image} onChange={(e) => set('image', e.target.value)} className={inputCls()} />
          </Field>
          <Field label="Colors (comma separated)">
            <input value={form.colors} onChange={(e) => set('colors', e.target.value)} className={inputCls()} placeholder="Matte Black, Volt" />
          </Field>
          <Field label="Stock">
            <input inputMode="numeric" value={form.stock} onChange={(e) => set('stock', e.target.value)} className={inputCls()} />
          </Field>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)}
              className="h-4 w-4 accent-[#D4FF3F]" />
            Featured on homepage
          </label>
          <div className="sm:col-span-2">
            <Field label="Description">
              <textarea rows={4} value={form.description} onChange={(e) => set('description', e.target.value)} className={inputCls()} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 sm:col-span-2">
            <button type="button" onClick={onClose} className="rounded-xl border border-line px-5 py-2.5 text-sm text-muted hover:text-white">
              Cancel
            </button>
            <button type="submit" disabled={busy} className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink disabled:opacity-50">
              {busy ? 'Saving…' : product ? 'Save changes' : 'Create product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Admin() {
  const { push } = useToast();
  const [tab, setTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [products, setProducts] = useState(null);
  const [orders, setOrders] = useState(null);
  const [modal, setModal] = useState(null); // null | 'new' | product object

  const load = () => {
    api.adminStats().then(setStats).catch(() => {});
    api.adminProducts().then((d) => setProducts(d.products)).catch(() => setProducts([]));
    api.adminOrders().then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  };
  useEffect(load, []);

  const del = async (p) => {
    if (!window.confirm(`Delete ${p.name}?`)) return;
    try {
      await api.adminDeleteProduct(p.id);
      push('Product deleted');
      load();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const setStatus = async (id, status) => {
    try {
      await api.adminOrderStatus(id, status);
      push(`Order marked ${status}`);
      load();
    } catch (err) {
      push(err.message, 'error');
    }
  };

  const tabs = [['overview', 'Overview'], ['products', 'Products'], ['orders', 'Orders']];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-volt">Admin</p>
          <h1 className="mt-1 font-display text-4xl font-bold tracking-tight">Dashboard</h1>
        </div>
        <div className="flex gap-2">
          {tabs.map(([k, label]) => (
            <button
              key={k}
              onClick={() => setTab(k)}
              className={`rounded-xl border px-4 py-2 text-sm font-semibold transition-colors ${
                tab === k ? 'border-volt bg-volt/10 text-volt' : 'border-line text-muted hover:text-white'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {tab === 'overview' && (
        <div className="mt-8">
          {!stats ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Revenue" value={money(stats.revenue_cents)} sub="Excluding cancelled orders" />
                <StatCard label="Orders" value={stats.orders_count} />
                <StatCard label="Products" value={stats.products_count} />
                <StatCard label="Customers" value={stats.users_count} />
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="font-display font-semibold">Low stock</h3>
                  {stats.low_stock.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">All stocked up.</p>
                  ) : (
                    <ul className="mt-3 space-y-2 text-sm">
                      {stats.low_stock.map((p) => (
                        <li key={p.id} className="flex justify-between">
                          <span>{p.name}</span>
                          <span className={p.stock < 10 ? 'font-bold text-red-400' : 'text-amber-300'}>{p.stock} left</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="rounded-2xl border border-line bg-card p-5">
                  <h3 className="font-display font-semibold">Recent orders</h3>
                  <ul className="mt-3 space-y-2 text-sm">
                    {stats.recent_orders.map((o) => (
                      <li key={o.id} className="flex items-center justify-between gap-2">
                        <span className="font-mono text-xs">{o.order_number}</span>
                        <StatusBadge status={o.status} />
                        <span className="font-semibold text-volt">{money(o.total_cents)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'products' && (
        <div className="mt-8">
          <div className="flex justify-end">
            <button onClick={() => setModal('new')}
              className="rounded-xl bg-volt px-5 py-2.5 text-sm font-bold text-ink transition-transform hover:scale-105">
              + New product
            </button>
          </div>
          {!products ? (
            <div className="mt-4 space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : (
            <div className="mt-4 overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Product</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Price</th>
                    <th className="px-4 py-3">Stock</th>
                    <th className="px-4 py-3">Featured</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id} className="border-b border-line/60 last:border-0 hover:bg-surface/60">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {p.image && <img src={p.image} alt="" className="h-10 w-10 rounded-lg object-cover" />}
                          <span className="font-medium">{p.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 capitalize text-muted">{p.category}</td>
                      <td className="px-4 py-3 font-semibold text-volt">{money(p.price_cents)}</td>
                      <td className="px-4 py-3">{p.stock}</td>
                      <td className="px-4 py-3">{p.featured ? '★' : '—'}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => setModal(p)} className="mr-3 text-sm text-volt hover:underline">Edit</button>
                        <button onClick={() => del(p)} className="text-sm text-red-400 hover:underline">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {tab === 'orders' && (
        <div className="mt-8">
          {!orders ? (
            <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-16" />)}</div>
          ) : orders.length === 0 ? (
            <p className="text-muted">No orders yet.</p>
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-line">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="border-b border-line bg-surface text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Order</th>
                    <th className="px-4 py-3">Customer</th>
                    <th className="px-4 py-3">Items</th>
                    <th className="px-4 py-3">Total</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.id} className="border-b border-line/60 last:border-0 hover:bg-surface/60">
                      <td className="px-4 py-3 font-mono text-xs">{o.order_number}</td>
                      <td className="px-4 py-3">
                        <p>{o.shipping_name}</p>
                        <p className="text-xs text-muted">{o.email}</p>
                      </td>
                      <td className="px-4 py-3 text-muted">{o.items.reduce((n, i) => n + i.qty, 0)}</td>
                      <td className="px-4 py-3 font-semibold text-volt">{money(o.total_cents)}</td>
                      <td className="px-4 py-3">
                        <select
                          value={o.status}
                          onChange={(e) => setStatus(o.id, e.target.value)}
                          className="rounded-lg border border-line bg-ink px-2 py-1.5 text-xs capitalize outline-none focus:border-volt/60"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted">
                        {new Date(o.created_at).toLocaleDateString('en-CA')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {modal && (
        <ProductModal
          product={modal === 'new' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </div>
  );
}
