import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, money } from '../lib/api.js';
import { EmptyState, Skeleton } from '../components/ui.jsx';

const STATUS_STYLE = {
  processing: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
  shipped: 'border-blue-400/40 bg-blue-400/10 text-blue-300',
  delivered: 'border-volt/40 bg-volt/10 text-volt',
  cancelled: 'border-red-400/40 bg-red-400/10 text-red-300',
};

export function StatusBadge({ status }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-xs font-semibold capitalize ${STATUS_STYLE[status] || STATUS_STYLE.processing}`}>
      {status}
    </span>
  );
}

export default function Orders() {
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    api.orders().then((d) => setOrders(d.orders)).catch(() => setOrders([]));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Order history</h1>
      <div className="mt-8">
        {!orders ? (
          <div className="space-y-4">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : orders.length === 0 ? (
          <EmptyState
            title="No orders yet"
            body="When you place an order it will show up here with live tracking."
            action={<Link to="/shop" className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">Start shopping</Link>}
          />
        ) : (
          <ul className="space-y-4">
            {orders.map((o) => (
              <li key={o.id}>
                <Link
                  to={`/order/${o.id}`}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-card p-5 transition-colors hover:border-volt/40"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-volt/15 font-display text-lg font-bold text-volt">
                    {o.items.reduce((n, i) => n + i.qty, 0)}
                  </div>
                  <div className="flex-1">
                    <p className="font-display font-bold">{o.order_number}</p>
                    <p className="text-sm text-muted">
                      {new Date(o.created_at).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}
                      {' · '}{o.items.length} item{o.items.length !== 1 && 's'}
                    </p>
                  </div>
                  <StatusBadge status={o.status} />
                  <span className="font-display font-bold text-volt">{money(o.total_cents)}</span>
                  <span className="text-volt">→</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
