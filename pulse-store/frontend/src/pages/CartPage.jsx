import { Link } from 'react-router-dom';
import { useCart } from '../context/store.jsx';
import { money } from '../lib/api.js';
import { EmptyState } from '../components/ui.jsx';

export default function CartPage() {
  const { items, updateQty, remove, clear, subtotal } = useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Your cart is empty"
          body="Every great setup starts with a single product. Go find yours."
          action={<Link to="/shop" className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">Shop now</Link>}
        />
      </div>
    );
  }

  const shipping = subtotal >= 15000 ? 0 : 999;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Cart</h1>
      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <ul className="space-y-4 lg:col-span-2">
          {items.map((i) => (
            <li key={`${i.product_id}::${i.color}`} className="flex gap-4 rounded-2xl border border-line bg-card p-4">
              <Link to={`/product/${i.slug}`} className="shrink-0">
                <img src={i.image} alt={i.name} className="h-24 w-24 rounded-xl object-cover" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/product/${i.slug}`} className="font-semibold hover:text-volt">{i.name}</Link>
                    {i.color && <p className="mt-0.5 text-xs text-muted">{i.color}</p>}
                  </div>
                  <button onClick={() => remove(i.product_id, i.color)} className="text-xs text-muted hover:text-red-400">
                    Remove
                  </button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-xl border border-line">
                    <button onClick={() => updateQty(i.product_id, i.color, i.qty - 1)} className="px-3 py-1.5 text-muted hover:text-white">−</button>
                    <span className="w-10 text-center text-sm font-semibold">{i.qty}</span>
                    <button onClick={() => updateQty(i.product_id, i.color, i.qty + 1)} className="px-3 py-1.5 text-muted hover:text-white">+</button>
                  </div>
                  <span className="font-display font-bold text-volt">{money(i.price_cents * i.qty)}</span>
                </div>
              </div>
            </li>
          ))}
          <button onClick={clear} className="text-sm text-muted hover:text-red-400">Clear cart</button>
        </ul>
        <div className="h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Summary</h2>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shipping === 0 ? <span className="text-volt">Free</span> : money(shipping)}</span>
            </div>
            {shipping > 0 && (
              <p className="text-xs text-muted">Add {money(15000 - subtotal)} more for free shipping.</p>
            )}
            <div className="flex justify-between border-t border-line pt-3 font-display text-lg font-bold">
              <span>Total</span><span className="text-volt">{money(subtotal + shipping)}</span>
            </div>
          </div>
          <Link to="/checkout" className="mt-5 block rounded-xl bg-volt py-3 text-center text-sm font-bold text-ink transition-transform hover:scale-[1.02]">
            Proceed to checkout
          </Link>
          <Link to="/shop" className="mt-2 block text-center text-sm text-muted hover:text-white">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
