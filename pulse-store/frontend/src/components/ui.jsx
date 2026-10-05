import { Link } from 'react-router-dom';
import { money } from '../lib/api.js';

export function Stars({ rating, size = 14 }) {
  const full = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 24 24"
          fill={i <= full ? '#D4FF3F' : 'none'}
          stroke={i <= full ? '#D4FF3F' : '#52525B'} strokeWidth="1.6">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </span>
  );
}

export function Skeleton({ className = '' }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

export function ProductCard({ product }) {
  const discount = product.compare_at_cents
    ? Math.round((1 - product.price_cents / product.compare_at_cents) * 100)
    : 0;
  return (
    <Link
      to={`/product/${product.slug}`}
      className="group overflow-hidden rounded-2xl border border-line bg-card transition-all duration-300 hover:-translate-y-1 hover:border-volt/40 hover:shadow-card"
    >
      <div className="relative aspect-square overflow-hidden bg-surface">
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {discount > 0 && (
          <span className="absolute left-3 top-3 rounded-lg bg-volt px-2 py-1 text-xs font-bold text-ink">
            −{discount}%
          </span>
        )}
        {product.stock <= 10 && product.stock > 0 && (
          <span className="absolute right-3 top-3 rounded-lg bg-red-500/90 px-2 py-1 text-xs font-bold text-white">
            Only {product.stock} left
          </span>
        )}
      </div>
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{product.category}</p>
        <h3 className="mt-1 font-display text-base font-semibold leading-tight transition-colors group-hover:text-volt">
          {product.name}
        </h3>
        <p className="mt-1 line-clamp-1 text-xs text-muted">{product.tagline}</p>
        <div className="mt-2 flex items-center gap-1.5">
          <Stars rating={product.rating} />
          <span className="text-xs text-muted">({product.review_count.toLocaleString()})</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-lg font-bold text-volt">{money(product.price_cents)}</span>
          {product.compare_at_cents && (
            <span className="text-sm text-muted line-through">{money(product.compare_at_cents)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function Field({ label, error, children, hint }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-muted">{label}</span>
      {children}
      {hint && !error && <span className="mt-1 block text-xs text-muted">{hint}</span>}
      {error && <span className="mt-1 block text-xs text-red-400">{error}</span>}
    </label>
  );
}

export const inputCls = (hasError) =>
  `w-full rounded-xl border bg-surface px-4 py-2.5 text-sm text-white placeholder:text-muted/60 outline-none transition-colors focus:border-volt/70 ${
    hasError ? 'border-red-500/60' : 'border-line'
  }`;

export function EmptyState({ title, body, action }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-card/50 px-6 py-16 text-center">
      <p className="font-display text-lg font-semibold">{title}</p>
      <p className="mt-2 max-w-sm text-sm text-muted">{body}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function SectionTitle({ kicker, title, sub }) {
  return (
    <div className="mb-8">
      {kicker && (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.25em] text-volt">{kicker}</p>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">{title}</h2>
      {sub && <p className="mt-2 max-w-xl text-muted">{sub}</p>}
    </div>
  );
}
