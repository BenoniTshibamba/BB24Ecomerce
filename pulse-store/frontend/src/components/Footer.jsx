import { Link } from 'react-router-dom';
import NewsletterForm from './NewsletterForm.jsx';

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-volt font-display text-lg font-bold text-ink">B</span>
            <span className="font-display text-xl font-bold tracking-tight">BB24</span>
          </div>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted">
            Premium wireless audio, engineered in the dark and tuned for the obsessed.
            Headphones, earbuds and speakers that earn their place.
          </p>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link to="/shop?category=headphones" className="transition-colors hover:text-volt">Headphones</Link></li>
            <li><Link to="/shop?category=earbuds" className="transition-colors hover:text-volt">Earbuds</Link></li>
            <li><Link to="/shop?category=speakers" className="transition-colors hover:text-volt">Speakers</Link></li>
            <li><Link to="/shop" className="transition-colors hover:text-volt">All products</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Account</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-muted">
            <li><Link to="/login" className="transition-colors hover:text-volt">Sign in</Link></li>
            <li><Link to="/register" className="transition-colors hover:text-volt">Create account</Link></li>
            <li><Link to="/orders" className="transition-colors hover:text-volt">Order history</Link></li>
            <li><Link to="/cart" className="transition-colors hover:text-volt">Cart</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-display text-sm font-semibold uppercase tracking-widest text-white">Stay in the loop</h4>
          <p className="mt-4 text-sm text-muted">Drops, deals and tuning notes. No spam.</p>
          <div className="mt-3"><NewsletterForm compact /></div>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 py-5 text-xs text-muted sm:flex-row sm:px-6">
          <span>© 2026 BB24 Audio. All prices in CAD.</span>
          <span className="font-display font-semibold tracking-widest text-volt/80">BUILT WITH LOVE AND CAFFEINE BY BB24</span>
        </div>
      </div>
    </footer>
  );
}
