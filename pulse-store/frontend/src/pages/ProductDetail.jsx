import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, money } from '../lib/api.js';
import { useAuth, useCart, useToast } from '../context/store.jsx';
import { EmptyState, Field, ProductCard, SectionTitle, Skeleton, Stars, inputCls } from '../components/ui.jsx';

function ReviewForm({ productId, onAdded }) {
  const { push } = useToast();
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (title.trim().length < 3) errs.title = 'Give your review a title';
    if (body.trim().length < 10) errs.body = 'Tell us a little more (10+ characters)';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const d = await api.addReview({ product_id: productId, rating, title: title.trim(), body: body.trim() });
      push('Review published. Thanks!');
      setTitle(''); setBody(''); setRating(5);
      onAdded(d.review);
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6 rounded-2xl border border-line bg-card p-5">
      <h3 className="font-display text-lg font-semibold">Write a review</h3>
      <div className="mt-3 flex items-center gap-1.5">
        <span className="text-sm text-muted">Your rating:</span>
        {[1, 2, 3, 4, 5].map((i) => (
          <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill={i <= rating ? '#D4FF3F' : 'none'}
              stroke={i <= rating ? '#D4FF3F' : '#52525B'} strokeWidth="1.6">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        ))}
      </div>
      <div className="mt-4 grid gap-4">
        <Field label="Title" error={errors.title}>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Sums it up in a line"
            className={inputCls(errors.title)} />
        </Field>
        <Field label="Review" error={errors.body}>
          <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4}
            placeholder="What did you love? What should others know?"
            className={inputCls(errors.body)} />
        </Field>
      </div>
      <button type="submit" disabled={busy}
        className="mt-4 rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink transition-transform hover:scale-105 disabled:opacity-50">
        {busy ? 'Publishing…' : 'Publish review'}
      </button>
    </form>
  );
}

export default function ProductDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const { add } = useCart();
  const { push } = useToast();
  const [data, setData] = useState(null);
  const [notFound, setNotFound] = useState(false);
  const [color, setColor] = useState(null);
  const [qty, setQty] = useState(1);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    setData(null);
    setNotFound(false);
    api.product(slug)
      .then((d) => {
        setData(d);
        setReviews(d.reviews);
        setColor(d.product.colors?.[0] || null);
        setQty(1);
      })
      .catch(() => setNotFound(true));
  }, [slug]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Product not found"
          body="This one slipped off the shelf. Browse the lineup instead."
          action={<Link to="/shop" className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">Back to shop</Link>}
        />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <Skeleton className="aspect-square" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-2/3" />
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-12 w-48" />
          </div>
        </div>
      </div>
    );
  }

  const { product, related } = data;
  const discount = product.compare_at_cents
    ? Math.round((1 - product.price_cents / product.compare_at_cents) * 100)
    : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="grid gap-10 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-line bg-surface">
          <img src={product.image} alt={product.name} className="aspect-square w-full object-cover" />
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-volt">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{product.name}</h1>
          <p className="mt-2 text-lg text-muted">{product.tagline}</p>
          <div className="mt-3 flex items-center gap-2">
            <Stars rating={product.rating} size={16} />
            <span className="text-sm text-muted">{product.rating} · {product.review_count.toLocaleString()} reviews</span>
          </div>
          <div className="mt-5 flex items-baseline gap-3">
            <span className="font-display text-4xl font-bold text-volt">{money(product.price_cents)}</span>
            {product.compare_at_cents && (
              <>
                <span className="text-xl text-muted line-through">{money(product.compare_at_cents)}</span>
                <span className="rounded-lg bg-volt px-2 py-1 text-xs font-bold text-ink">SAVE {discount}%</span>
              </>
            )}
          </div>
          <p className="mt-2 text-sm text-muted">All prices in CAD. Free shipping over $150.</p>

          {product.colors?.length > 0 && (
            <div className="mt-6">
              <p className="text-sm font-medium text-muted">Finish: <span className="text-white">{color}</span></p>
              <div className="mt-2 flex gap-2">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColor(c)}
                    className={`rounded-full border px-4 py-1.5 text-sm transition-colors ${
                      color === c ? 'border-volt bg-volt/10 text-volt' : 'border-line text-muted hover:border-volt/50 hover:text-white'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-3">
            <div className="flex items-center rounded-xl border border-line">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-muted hover:text-white">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="px-4 py-3 text-muted hover:text-white">+</button>
            </div>
            <button
              disabled={product.stock === 0}
              onClick={() => { add(product, qty, color); push(`${product.name} added to cart`); }}
              className="flex-1 rounded-xl bg-volt py-3.5 text-sm font-bold text-ink shadow-glow transition-transform hover:scale-[1.02] disabled:opacity-40"
            >
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>
          <p className="mt-3 text-sm">
            {product.stock === 0
              ? <span className="text-red-400">Out of stock — check back soon.</span>
              : product.stock <= 10
                ? <span className="text-amber-300">Only {product.stock} left in stock.</span>
                : <span className="text-volt">✓ In stock, ships within 24 hours</span>}
          </p>

          <div className="mt-8 border-t border-line pt-6">
            <h3 className="font-display text-lg font-semibold">About this product</h3>
            <p className="mt-2 leading-relaxed text-muted">{product.description}</p>
          </div>
        </div>
      </div>

      {/* REVIEWS */}
      <div className="mt-16 grid gap-10 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <h2 className="font-display text-2xl font-bold">Reviews ({reviews.length})</h2>
          {reviews.length === 0 ? (
            <p className="mt-4 text-sm text-muted">No reviews yet — be the first to weigh in.</p>
          ) : (
            <ul className="mt-5 space-y-4">
              {reviews.map((r) => (
                <li key={r.id} className="rounded-2xl border border-line bg-card p-5">
                  <div className="flex items-center justify-between">
                    <Stars rating={r.rating} />
                    <span className="text-xs text-muted">{new Date(r.created_at).toLocaleDateString('en-CA')}</span>
                  </div>
                  <p className="mt-2 font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{r.body}</p>
                  <p className="mt-3 text-xs text-muted">— {r.user_name}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="lg:col-span-2">
          {user ? (
            <ReviewForm productId={product.id} onAdded={(r) => setReviews([r, ...reviews])} />
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-line bg-card/50 p-6 text-center">
              <p className="font-semibold">Want to review this product?</p>
              <p className="mt-1 text-sm text-muted">Sign in to share your take.</p>
              <Link to="/login" className="mt-4 inline-block rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* RELATED */}
      {related.length > 0 && (
        <div className="mt-16">
          <SectionTitle title="Pairs well with" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}
