import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth, useCart } from '../context/store.jsx';

function Wordmark() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <span className="grid h-9 w-9 place-items-center rounded-xl bg-volt font-display text-lg font-bold text-ink transition-transform group-hover:rotate-6">
        B
      </span>
      <span className="font-display text-xl font-bold tracking-tight">
        BB24
      </span>
    </Link>
  );
}

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const { count, setDrawerOpen } = useCart();
  const navigate = useNavigate();

  const linkCls = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-volt ${isActive ? 'text-volt' : 'text-muted'}`;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-ink/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Wordmark />
        <nav className="hidden items-center gap-7 md:flex">
          <NavLink to="/" className={linkCls}>Home</NavLink>
          <NavLink to="/shop" className={linkCls}>Shop</NavLink>
          <NavLink to="/shop?category=headphones" className={linkCls}>Headphones</NavLink>
          <NavLink to="/shop?category=earbuds" className={linkCls}>Earbuds</NavLink>
          <NavLink to="/shop?category=speakers" className={linkCls}>Speakers</NavLink>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {isAdmin && (
            <Link
              to="/admin"
              className="hidden rounded-lg border border-volt/40 px-3 py-1.5 text-xs font-semibold text-volt transition-colors hover:bg-volt hover:text-ink sm:block"
            >
              ADMIN
            </Link>
          )}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/orders"
                className="hidden text-sm text-muted transition-colors hover:text-white sm:block"
                title="Order history"
              >
                {user.name.split(' ')[0]}
              </Link>
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="text-sm text-muted transition-colors hover:text-white"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link to="/login" className="text-sm font-medium text-muted transition-colors hover:text-white">
              Sign in
            </Link>
          )}
          <button
            onClick={() => setDrawerOpen(true)}
            className="relative grid h-10 w-10 place-items-center rounded-xl border border-line bg-card transition-colors hover:border-volt/50"
            aria-label="Open cart"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {count > 0 && (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-volt px-1 text-[11px] font-bold text-ink">
                {count}
              </span>
            )}
          </button>
        </div>
      </div>
      <nav className="flex items-center gap-6 overflow-x-auto border-t border-line px-4 py-2.5 md:hidden">
        <NavLink to="/" className={linkCls}>Home</NavLink>
        <NavLink to="/shop" className={linkCls}>Shop</NavLink>
        <NavLink to="/shop?category=headphones" className={linkCls}>Headphones</NavLink>
        <NavLink to="/shop?category=earbuds" className={linkCls}>Earbuds</NavLink>
        <NavLink to="/shop?category=speakers" className={linkCls}>Speakers</NavLink>
      </nav>
    </header>
  );
}
