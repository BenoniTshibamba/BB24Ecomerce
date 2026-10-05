import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../lib/api.js';
import { EmptyState, ProductCard, Skeleton } from '../components/ui.jsx';

const SORTS = [
  { value: '', label: 'Newest' },
  { value: 'price_asc', label: 'Price: low to high' },
  { value: 'price_desc', label: 'Price: high to low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'name', label: 'Name A–Z' },
];

export default function Shop() {
  const [params, setParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [categories, setCategories] = useState([]);

  const q = params.get('q') || '';
  const category = params.get('category') || '';
  const sort = params.get('sort') || '';

  const [searchInput, setSearchInput] = useState(q);
  useEffect(() => setSearchInput(q), [q]);

  useEffect(() => {
    api.categories().then((d) => setCategories(d.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setProducts(null);
    const t = setTimeout(() => {
      api.products({ q, category, sort }).then((d) => setProducts(d.products)).catch(() => setProducts([]));
    }, 250);
    return () => clearTimeout(t);
  }, [q, category, sort]);

  const set = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    setParams(next);
  };

  const submitSearch = (e) => {
    e.preventDefault();
    set('q', searchInput.trim());
  };

  const chips = useMemo(() => [{ slug: '', name: 'All' }, ...categories], [categories]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Shop</h1>
      <p className="mt-2 text-muted">Every BB24 product. No filler.</p>

      <form onSubmit={submitSearch} className="mt-6 flex max-w-md gap-2">
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search headphones, earbuds, speakers…"
          className="w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-sm outline-none placeholder:text-muted/60 focus:border-volt/70"
        />
        <button type="submit" className="rounded-xl bg-volt px-5 text-sm font-bold text-ink transition-transform hover:scale-105">
          Search
        </button>
      </form>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {chips.map((c) => (
          <button
            key={c.slug}
            onClick={() => set('category', c.slug)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              category === c.slug
                ? 'border-volt bg-volt text-ink'
                : 'border-line bg-card text-muted hover:border-volt/50 hover:text-white'
            }`}
          >
            {c.name}
          </button>
        ))}
        <select
          value={sort}
          onChange={(e) => set('sort', e.target.value)}
          className="ml-auto rounded-xl border border-line bg-card px-3 py-2 text-sm text-white outline-none focus:border-volt/70"
        >
          {SORTS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      <div className="mt-8">
        {!products ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : products.length === 0 ? (
          <EmptyState
            title="Nothing matches that search"
            body="Try a different keyword, or browse the full lineup — your sound is in here somewhere."
            action={
              <button
                onClick={() => { setParams({}); setSearchInput(''); }}
                className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink"
              >
                Clear filters
              </button>
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-muted">{products.length} product{products.length !== 1 && 's'}</p>
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {products.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
