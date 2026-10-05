import { useState } from 'react';
import { api } from '../lib/api.js';
import { useToast } from '../context/store.jsx';
import { inputCls } from './ui.jsx';

export default function NewsletterForm({ compact = false }) {
  const { push } = useToast();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Enter a valid email address');
      return;
    }
    setBusy(true);
    try {
      await api.newsletter(email.trim());
      push('You are on the list. Welcome to BB24.');
      setEmail('');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className={compact ? '' : 'mx-auto mt-6 flex max-w-md flex-col gap-3 sm:flex-row'}>
      <div className={compact ? '' : 'flex-1'}>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className={inputCls(!!error)}
        />
        {error && <p className="mt-1 text-xs text-red-400">{error}</p>}
      </div>
      <button
        type="submit"
        disabled={busy}
        className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink transition-transform hover:scale-105 disabled:opacity-50"
      >
        {busy ? 'Joining…' : 'Subscribe'}
      </button>
    </form>
  );
}
