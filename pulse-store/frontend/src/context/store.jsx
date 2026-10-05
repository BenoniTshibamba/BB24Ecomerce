import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, getToken, setToken } from '../lib/api';

/* ---------------- Toast ---------------- */
const ToastCtx = createContext(null);
let toastId = 0;
export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const push = useCallback((message, type = 'success') => {
    const id = ++toastId;
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 3400);
  }, []);
  return (
    <ToastCtx.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-5 right-5 z-[100] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-toast-in max-w-xs rounded-xl border px-4 py-3 text-sm shadow-card ${
              t.type === 'error'
                ? 'border-red-500/40 bg-[#1c1214] text-red-200'
                : 'border-volt/30 bg-[#141a0a] text-volt'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);

/* ---------------- Auth ---------------- */
const AuthCtx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) return setLoading(false);
    api.me()
      .then((d) => setUser(d.user))
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const d = await api.login({ email, password });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const d = await api.register({ name, email, password });
    setToken(d.token);
    setUser(d.user);
    return d.user;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, isAdmin: user?.role === 'admin' }),
    [user, loading, login, register, logout]
  );
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
export const useAuth = () => useContext(AuthCtx);

/* ---------------- Cart ---------------- */
const CartCtx = createContext(null);
const CART_KEY = 'bb24_cart';

function loadCart() {
  try {
    return JSON.parse(localStorage.getItem(CART_KEY)) || [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(loadCart); // [{product_id, slug, name, image, price_cents, color, qty}]
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const add = useCallback((product, qty = 1, color = null) => {
    setItems((prev) => {
      const key = (i) => `${i.product_id}::${i.color || ''}`;
      const incoming = {
        product_id: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        price_cents: product.price_cents,
        color: color || (product.colors && product.colors[0]) || null,
        qty,
      };
      const found = prev.find((i) => key(i) === key(incoming));
      if (found)
        return prev.map((i) => (key(i) === key(incoming) ? { ...i, qty: i.qty + qty } : i));
      return [...prev, incoming];
    });
    setDrawerOpen(true);
  }, []);

  const updateQty = useCallback((product_id, color, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => !(i.product_id === product_id && i.color === color))
        : prev.map((i) =>
            i.product_id === product_id && i.color === color ? { ...i, qty } : i
          )
    );
  }, []);

  const remove = useCallback((product_id, color) => {
    setItems((prev) => prev.filter((i) => !(i.product_id === product_id && i.color === color)));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const { count, subtotal } = useMemo(() => {
    return {
      count: items.reduce((n, i) => n + i.qty, 0),
      subtotal: items.reduce((n, i) => n + i.qty * i.price_cents, 0),
    };
  }, [items]);

  const value = useMemo(
    () => ({ items, add, updateQty, remove, clear, count, subtotal, drawerOpen, setDrawerOpen }),
    [items, add, updateQty, remove, clear, count, subtotal, drawerOpen]
  );
  return <CartCtx.Provider value={value}>{children}</CartCtx.Provider>;
}
export const useCart = () => useContext(CartCtx);
