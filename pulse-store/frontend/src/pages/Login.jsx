import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../context/store.jsx';
import { Field, inputCls } from '../components/ui.jsx';

export default function Login() {
  const { login } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email';
    if (!password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const user = await login(email.trim(), password);
      push(`Welcome back, ${user.name.split(' ')[0]}.`);
      navigate(user.role === 'admin' ? '/admin' : '/');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-line bg-card p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">Welcome back to BB24.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Email" error={errors.email}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" className={inputCls(errors.email)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••" className={inputCls(errors.password)} />
          </Field>
          <button type="submit" disabled={busy}
            className="rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.02] disabled:opacity-50">
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          New here? <Link to="/register" className="font-semibold text-volt hover:underline">Create an account</Link>
        </p>
        <div className="mt-6 rounded-xl border border-line bg-surface p-3 text-xs text-muted">
          Demo customer: <span className="text-white">demo@bb24.shop</span> / <span className="text-white">demo1234</span>
        </div>
      </div>
    </div>
  );
}
