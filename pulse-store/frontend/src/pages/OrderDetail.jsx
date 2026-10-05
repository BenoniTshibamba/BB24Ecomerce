import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, money } from '../lib/api.js';
import { EmptyState, Skeleton } from '../components/ui.jsx';
import { StatusBadge } from './Orders.jsx';

const TIMELINE = [
  { key: 'processing', label: 'Order received', desc: 'We are preparing your items.' },
  { key: 'shipped', label: 'Shipped', desc: 'Your package is on its way.' },
  { key: 'delivered', label: 'Delivered', desc: 'Enjoy the sound.' },
];

export default function OrderDetail() {
  const { id } = useParams();
  const [search] = useSearchParams();
  const fresh = search.get('fresh') === '1';
  const [order, setOrder] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    api.order(id).then((d) => setOrder(d.order)).catch(() => setNotFound(true));
  }, [id]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Order not found"
          body="Check your order history for the right link."
          action={<Link to="/orders" className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">Order history</Link>}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="mt-6 h-64" />
      </div>
    );
  }

  const stageIdx = order.status === 'cancelled' ? -1 : TIMELINE.findIndex((t) => t.key === order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      {fresh && (
        <div className="animate-fade-up rounded-2xl border border-volt/40 bg-volt/10 p-6 text-center">
          <p className="font-display text-3xl">✓</p>
          <h1 className="mt-2 font-display text-2xl font-bold">Order confirmed</h1>
          <p className="mt-1 text-muted">
            Thanks, {order.shipping_name.split(' ')[0]}. A confirmation was sent to {order.email}.
          </p>
        </div>
      )}
      <div className={`flex flex-wrap items-center justify-between gap-3 ${fresh ? 'mt-8' : ''}`}>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-volt">Order</p>
          <h1 className="mt-1 font-display text-3xl font-bold">{order.order_number}</h1>
          <p className="mt-1 text-sm text-muted">
            Placed {new Date(order.created_at).toLocaleString('en-CA', { dateStyle: 'medium', timeStyle: 'short' })}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>

      {order.status === 'cancelled' ? (
        <div className="mt-8 rounded-2xl border border-red-400/30 bg-red-400/5 p-6 text-sm text-red-200">
          This order was cancelled. If you did not request this, contact support.
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Tracking</h2>
          <ol className="mt-5 space-y-0">
            {TIMELINE.map((t, i) => {
              const done = i <= stageIdx;
              const current = i === stageIdx;
              return (
                <li key={t.key} className="relative flex gap-4 pb-6 last:pb-0">
                  {i < TIMELINE.length - 1 && (
                    <span className={`absolute left-[15px] top-8 h-full w-0.5 ${done ? 'bg-volt' : 'bg-line'}`} />
                  )}
                  <span className={`z-10 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${
                    done ? 'border-volt bg-volt text-ink' : 'border-line text-muted'
                  }`}>
                    {done ? '✓' : i + 1}
                  </span>
                  <div>
                    <p className={`font-semibold ${current ? 'text-volt' : done ? 'text-white' : 'text-muted'}`}>{t.label}</p>
                    <p className="text-sm text-muted">{t.desc}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-2">
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Items</h2>
          <ul className="mt-4 space-y-3">
            {order.items.map((it) => (
              <li key={it.id} className="flex justify-between gap-3 text-sm">
                <span>{it.name} <span className="text-muted">× {it.qty}</span></span>
                <span className="font-semibold">{money(it.price_cents * it.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(order.subtotal_cents)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{order.shipping_cents === 0 ? 'Free' : money(order.shipping_cents)}</span></div>
            <div className="flex justify-between font-display text-base font-bold"><span>Total</span><span className="text-volt">{money(order.total_cents)}</span></div>
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-card p-6">
          <h2 className="font-display text-lg font-semibold">Ship to</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            {order.shipping_name}<br />
            {order.shipping_address}<br />
            {order.shipping_city}, {order.shipping_postal}<br />
            {order.email}
          </p>
          <Link to="/orders" className="mt-5 inline-block text-sm text-volt hover:underline">
            ← Back to order history
          </Link>
        </div>
      </div>
    </div>
  );
}
