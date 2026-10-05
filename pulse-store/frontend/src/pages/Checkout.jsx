import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api, money } from '../lib/api.js';
import { useAuth, useCart, useToast } from '../context/store.jsx';
import { EmptyState, Field, inputCls } from '../components/ui.jsx';

const STEPS = ['Contact', 'Shipping', 'Payment'];

function validateContact(v) {
  const e = {};
  if (!v.name.trim()) e.name = 'Name is required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim())) e.email = 'Enter a valid email';
  if (!/^[\d\s()+.-]{7,}$/.test(v.phone.trim())) e.phone = 'Enter a valid phone number';
  return e;
}
function validateShipping(v) {
  const e = {};
  if (v.address.trim().length < 5) e.address = 'Enter your street address';
  if (v.city.trim().length < 2) e.city = 'Enter your city';
  if (!/^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(v.postal.trim())) e.postal = 'Enter a valid postal code (e.g. H2X 1Y4)';
  return e;
}
function validatePayment(v) {
  const e = {};
  if (!/^\d{12,19}$/.test(v.card_number.replace(/\s/g, ''))) e.card_number = 'Enter a valid card number';
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(v.expiry.trim())) e.expiry = 'Use MM/YY';
  if (!/^\d{3,4}$/.test(v.cvc.trim())) e.cvc = 'Enter the CVC';
  return e;
}

export default function Checkout() {
  const { items, subtotal, clear } = useCart();
  const { user } = useAuth();
  const { push } = useToast();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState({ name: user?.name || '', email: user?.email || '', phone: '' });
  const [shipping, setShipping] = useState({ address: '', city: '', postal: '' });
  const [payment, setPayment] = useState({ card_number: '', expiry: '', cvc: '' });

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <EmptyState
          title="Nothing to check out"
          body="Your cart is empty — add something worth hearing first."
          action={<Link to="/shop" className="rounded-xl bg-volt px-6 py-2.5 text-sm font-bold text-ink">Shop now</Link>}
        />
      </div>
    );
  }

  const shippingCents = subtotal >= 15000 ? 0 : 999;
  const total = subtotal + shippingCents;

  const next = () => {
    const validators = [validateContact, validateShipping, validatePayment];
    const values = [contact, shipping, payment];
    const errs = validators[step](values[step]);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(step + 1);
  };

  const placeOrder = async () => {
    const errs = validatePayment(payment);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const d = await api.checkout({
        email: contact.email.trim(),
        items: items.map((i) => ({ product_id: i.product_id, qty: i.qty })),
        shipping: { name: contact.name.trim(), address: shipping.address.trim(), city: shipping.city.trim(), postal: shipping.postal.trim().toUpperCase() },
        payment: { card_number: payment.card_number, expiry: payment.expiry.trim(), cvc: payment.cvc.trim() },
      });
      clear();
      push('Order placed. Thank you!');
      navigate(`/order/${d.order.id}?fresh=1`, { replace: true });
    } catch (err) {
      push(err.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const bind = (setter, obj, key) => ({
    value: obj[key],
    onChange: (e) => setter({ ...obj, [key]: e.target.value }),
    className: inputCls(errors[key]),
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Checkout</h1>

      <div className="mt-6 flex items-center gap-2">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <span className={`grid h-8 w-8 place-items-center rounded-full text-sm font-bold ${
              i < step ? 'bg-volt text-ink' : i === step ? 'border-2 border-volt text-volt' : 'border border-line text-muted'
            }`}>
              {i < step ? '✓' : i + 1}
            </span>
            <span className={`text-sm font-medium ${i === step ? 'text-white' : 'text-muted'}`}>{s}</span>
            {i < STEPS.length - 1 && <span className="mx-2 h-px w-8 bg-line sm:w-16" />}
          </div>
        ))}
      </div>

      <div className="mt-8 grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="grid gap-4 rounded-2xl border border-line bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Contact information</h2>
              <Field label="Full name" error={errors.name}>
                <input placeholder="Alex Tremblay" {...bind(setContact, contact, 'name')} />
              </Field>
              <Field label="Email" error={errors.email}>
                <input placeholder="alex@email.com" {...bind(setContact, contact, 'email')} />
              </Field>
              <Field label="Phone" error={errors.phone}>
                <input placeholder="(514) 555-0123" {...bind(setContact, contact, 'phone')} />
              </Field>
            </div>
          )}
          {step === 1 && (
            <div className="grid gap-4 rounded-2xl border border-line bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Shipping address</h2>
              <Field label="Street address" error={errors.address}>
                <input placeholder="1234 Rue Sainte-Catherine O" {...bind(setShipping, shipping, 'address')} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="City" error={errors.city}>
                  <input placeholder="Montréal" {...bind(setShipping, shipping, 'city')} />
                </Field>
                <Field label="Postal code" error={errors.postal} hint="Canadian format, e.g. H2X 1Y4">
                  <input placeholder="H2X 1Y4" {...bind(setShipping, shipping, 'postal')} />
                </Field>
              </div>
              <p className="text-xs text-muted">We ship anywhere in Canada. Free shipping on orders over $150.</p>
            </div>
          )}
          {step === 2 && (
            <div className="grid gap-4 rounded-2xl border border-line bg-card p-6">
              <h2 className="font-display text-lg font-semibold">Payment</h2>
              <div className="rounded-xl border border-volt/30 bg-volt/5 px-4 py-3 text-xs text-volt">
                Demo checkout — no real charge is made. Use any test card, e.g. 4242 4242 4242 4242.
              </div>
              <Field label="Card number" error={errors.card_number}>
                <input inputMode="numeric" placeholder="4242 4242 4242 4242" {...bind(setPayment, payment, 'card_number')} />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Expiry" error={errors.expiry} hint="MM/YY">
                  <input placeholder="12/28" {...bind(setPayment, payment, 'expiry')} />
                </Field>
                <Field label="CVC" error={errors.cvc}>
                  <input inputMode="numeric" placeholder="123" {...bind(setPayment, payment, 'cvc')} />
                </Field>
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <button
              onClick={() => setStep(Math.max(0, step - 1))}
              disabled={step === 0}
              className="rounded-xl border border-line px-6 py-2.5 text-sm font-semibold text-muted transition-colors hover:border-volt/50 hover:text-white disabled:opacity-40"
            >
              Back
            </button>
            {step < 2 ? (
              <button onClick={next} className="rounded-xl bg-volt px-8 py-2.5 text-sm font-bold text-ink transition-transform hover:scale-105">
                Continue
              </button>
            ) : (
              <button
                onClick={placeOrder}
                disabled={busy}
                className="rounded-xl bg-volt px-8 py-2.5 text-sm font-bold text-ink shadow-glow transition-transform hover:scale-105 disabled:opacity-50"
              >
                {busy ? 'Placing order…' : `Pay ${money(total)}`}
              </button>
            )}
          </div>
        </div>

        <div className="h-fit rounded-2xl border border-line bg-card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Order summary</h2>
          <ul className="mt-4 space-y-3">
            {items.map((i) => (
              <li key={`${i.product_id}::${i.color}`} className="flex items-center gap-3">
                <img src={i.image} alt={i.name} className="h-12 w-12 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-medium leading-tight">{i.name}</p>
                  <p className="text-xs text-muted">× {i.qty}</p>
                </div>
                <span className="text-sm font-semibold">{money(i.price_cents * i.qty)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{money(subtotal)}</span></div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span>{shippingCents === 0 ? <span className="text-volt">Free</span> : money(shippingCents)}</span>
            </div>
            <div className="flex justify-between font-display text-lg font-bold">
              <span>Total</span><span className="text-volt">{money(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
