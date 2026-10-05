import { Link } from 'react-router-dom';
import { useCart } from '../context/store.jsx';
import { money } from '../lib/api.js';

export default function CartDrawer() {
  const { items, updateQty, remove, subtotal, drawerOpen, setDrawerOpen } = useCart();
  if (!drawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="animate-fade-in absolute inset-0 bg-black/70" onClick={() => setDrawerOpen(false)} />
      <aside className="animate-slide-in-right absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-line bg-surface">
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h3 className="font-display text-lg font-semibold">Your cart ({items.reduce((n, i) => n + i.qty, 0)})</h3>
          <button
            onClick={() => setDrawerOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-volt/50 hover:text-white"
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <p className="font-display text-lg font-semibold">Your cart is empty</p>
              <p className="mt-2 text-sm text-muted">Good sound is waiting.</p>
              <Link
                to="/shop"
                onClick={() => setDrawerOpen(false)}
                className="mt-5 rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink transition-transform hover:scale-105"
              >
                Shop now
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {items.map((i) => (
                <li key={`${i.product_id}::${i.color}`} className="flex gap-3 rounded-xl border border-line bg-card p-3">
                  <Link to={`/product/${i.slug}`} onClick={() => setDrawerOpen(false)} className="shrink-0">
                    <img src={i.image} alt={i.name} className="h-20 w-20 rounded-lg object-cover" />
                  </Link>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-semibold leading-tight">{i.name}</p>
                        {i.color && <p className="mt-0.5 text-xs text-muted">{i.color}</p>}
                      </div>
                      <button
                        onClick={() => remove(i.product_id, i.color)}
                        className="text-xs text-muted transition-colors hover:text-red-400"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="flex items-center rounded-lg border border-line">
                        <button
                          onClick={() => updateQty(i.product_id, i.color, i.qty - 1)}
                          className="px-2.5 py-1 text-muted hover:text-white"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm">{i.qty}</span>
                        <button
                          onClick={() => updateQty(i.product_id, i.color, i.qty + 1)}
                          className="px-2.5 py-1 text-muted hover:text-white"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-volt">{money(i.price_cents * i.qty)}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {items.length > 0 && (
          <div className="border-t border-line px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted">Subtotal</span>
              <span className="font-display text-lg font-bold text-volt">{money(subtotal)}</span>
            </div>
            <p className="mt-1 text-xs text-muted">Shipping & taxes calculated at checkout.</p>
            <Link
              to="/checkout"
              onClick={() => setDrawerOpen(false)}
              className="mt-4 block rounded-xl bg-volt py-3 text-center text-sm font-bold text-ink transition-transform hover:scale-[1.02]"
            >
              Checkout
            </Link>
            <Link
              to="/cart"
              onClick={() => setDrawerOpen(false)}
              className="mt-2 block rounded-xl border border-line py-3 text-center text-sm font-semibold text-muted transition-colors hover:border-volt/50 hover:text-white"
            >
              View full cart
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
