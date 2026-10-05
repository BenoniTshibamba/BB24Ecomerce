import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth, useToast } from '../context/store.jsx';
import { Field, inputCls } from '../components/ui.jsx';

export default function Register() {
  const { register } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (name.trim().length < 2) errs.name = 'Enter your name';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = 'Enter a valid email';
    if (password.length < 6) errs.password = 'At least 6 characters';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const user = await register(name.trim(), email.trim(), password);
      push(`Welcome to BB24, ${user.name.split(' ')[0]}.`);
      navigate('/');
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-line bg-card p-8">
        <h1 className="font-display text-3xl font-bold tracking-tight">Create account</h1>
        <p className="mt-2 text-sm text-muted">Join BB24 for faster checkout and order tracking.</p>
        <form onSubmit={submit} className="mt-6 grid gap-4">
          <Field label="Full name" error={errors.name}>
            <input value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Alex Tremblay" className={inputCls(errors.name)} />
          </Field>
          <Field label="Email" error={errors.email}>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="you@email.com" className={inputCls(errors.email)} />
          </Field>
          <Field label="Password" error={errors.password}>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters" className={inputCls(errors.password)} />
          </Field>
          <button type="submit" disabled={busy}
            className="rounded-xl bg-volt py-3 text-sm font-bold text-ink transition-transform hover:scale-[1.02] disabled:opacity-50">
            {busy ? 'Creating…' : 'Create account'}
          </button>
        </form>
        <p className="mt-5 text-center text-sm text-muted">
          Already have one? <Link to="/login" className="font-semibold text-volt hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
