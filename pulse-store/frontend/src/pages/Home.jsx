import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api.js';
import { ProductCard, SectionTitle, Skeleton, Stars } from '../components/ui.jsx';
import NewsletterForm from '../components/NewsletterForm.jsx';

const MARQUEE_ITEMS = [
  '48H ANC',
  '60-HOUR BATTERY',
  'LOSSLESS AUDIO',
  'FREE SHIPPING OVER $150',
  '2-YEAR WARRANTY',
  '30-DAY RETURNS',
];

function Marquee() {
  const row = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS];
  return (
    <div className="overflow-hidden border-y border-line bg-surface py-3.5">
      <div className="animate-marquee flex w-max items-center gap-10 whitespace-nowrap">
        {row.map((t, i) => (
          <span key={i} className="flex items-center gap-10 font-display text-sm font-semibold tracking-widest text-muted">
            {t} <span className="text-volt">✦</span>
          </span>
        ))}
      </div>
    </div>
  );
}

const TESTIMONIALS = [
  {
    quote: 'I mix on the Studio Max now. The imaging is precise enough to place reverb tails — I have stopped second-guessing my masters.',
    name: 'Elena V.', role: 'Music producer, Toronto',
  },
  {
    quote: 'Thunder Boom carried a backyard party of thirty people without breaking a sweat. The bass is genuinely physical.',
    name: 'Victor E.', role: 'Verified buyer',
  },
  {
    quote: 'Turned on the Echo Buds Pro ANC in a subway car and the rumble just dropped away. I keep hearing instruments I missed before.',
    name: 'Maya C.', role: 'Verified buyer',
  },
];

export default function Home() {
  const [featured, setFeatured] = useState(null);
  const [categories, setCategories] = useState(null);

  useEffect(() => {
    api.products({ featured: '1', limit: 8 }).then((d) => setFeatured(d.products)).catch(() => setFeatured([]));
    api.categories().then((d) => setCategories(d.categories)).catch(() => setCategories([]));
  }, []);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src="/images/hero-banner.jpg" alt="BB24 Apex One headphones" className="h-full w-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent" />
        </div>
        <div className="relative mx-auto flex min-h-[540px] max-w-7xl flex-col justify-center px-4 py-20 sm:px-6">
          <p className="animate-fade-up text-xs font-bold uppercase tracking-[0.3em] text-volt">
            New — Apex One
          </p>
          <h1 className="animate-fade-up mt-4 max-w-2xl font-display text-5xl font-bold leading-[1.05] tracking-tight sm:text-7xl">
            Silence the world.<br />Keep the <span className="text-volt">sound.</span>
          </h1>
          <p className="animate-fade-up mt-5 max-w-xl text-lg text-muted">
            Flagship noise cancelling, beryllium drivers, 60-hour battery.
            The Apex One is the headphone we built to end the argument.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3">
            <Link
              to="/product/apex-one"
              className="rounded-xl bg-volt px-8 py-3.5 text-sm font-bold text-ink shadow-glow transition-transform hover:scale-105"
            >
              Shop Apex One — $549.99
            </Link>
            <Link
              to="/shop"
              className="rounded-xl border border-line bg-card/60 px-8 py-3.5 text-sm font-semibold backdrop-blur transition-colors hover:border-volt/60 hover:text-volt"
            >
              Explore the lineup
            </Link>
          </div>
        </div>
      </section>

      <Marquee />

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle
          kicker="Best sellers"
          title="The icons"
          sub="Four products our customers refuse to shut up about."
        />
        {!featured ? (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="aspect-[3/4]" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {featured.map((p) => <ProductCard key={p.id} product={p} />)}
          </div>
        )}
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        <SectionTitle kicker="Find your sound" title="Shop by category" />
        {!categories ? (
          <div className="grid gap-4 md:grid-cols-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[16/10]" />)}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {categories.map((c) => (
              <Link
                key={c.slug}
                to={`/shop?category=${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-line"
              >
                <img
                  src={c.image}
                  alt={c.name}
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-5">
                  <div>
                    <h3 className="font-display text-2xl font-bold">{c.name}</h3>
                    <p className="text-sm text-muted">{c.product_count} products</p>
                  </div>
                  <span className="grid h-10 w-10 place-items-center rounded-full border border-volt/40 text-volt transition-all group-hover:bg-volt group-hover:text-ink">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* TECH HIGHLIGHT */}
      <section className="border-y border-line bg-surface">
        <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-volt">Inside BB24</p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Engineered in the dark.<br />Tuned for the obsessed.
            </h2>
            <p className="mt-4 leading-relaxed text-muted">
              Every BB24 driver is hand-matched within 0.5dB before it earns the badge.
              Our acoustic lab runs 200 hours of burn-in testing on every design, and our
              ANC array samples the world 48,000 times per second — then deletes it.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                ['Beryllium drivers', 'Stiffer, lighter, faster — detail without harshness.'],
                ['Hybrid ANC', 'Six mics, 48dB of silence, zero pressure feeling.'],
                ['Lossless wireless', 'LDAC and USB-C digital audio on flagship models.'],
              ].map(([t, d]) => (
                <li key={t} className="flex gap-3">
                  <span className="mt-0.5 text-volt">✦</span>
                  <span><strong className="text-white">{t}</strong> <span className="text-muted">— {d}</span></span>
                </li>
              ))}
            </ul>
            <Link to="/shop" className="mt-8 inline-block rounded-xl border border-volt/50 px-6 py-3 text-sm font-semibold text-volt transition-colors hover:bg-volt hover:text-ink">
              Hear the difference
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['48dB', 'Max noise reduction'],
              ['60h', 'Longest battery life'],
              ['0.5dB', 'Driver matching tolerance'],
              ['200h', 'Burn-in testing per design'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-2xl border border-line bg-card p-6 text-center">
                <p className="font-display text-4xl font-bold text-volt">{n}</p>
                <p className="mt-1 text-sm text-muted">{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <SectionTitle kicker="Wall of sound" title="Loved out loud" />
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="flex flex-col rounded-2xl border border-line bg-card p-6">
              <Stars rating={5} />
              <blockquote className="mt-4 flex-1 text-sm leading-relaxed text-white/90">“{t.quote}”</blockquote>
              <figcaption className="mt-5 text-sm">
                <p className="font-semibold">{t.name}</p>
                <p className="text-muted">{t.role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="border-t border-line bg-surface">
        <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6">
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-volt">The Frequency</p>
          <h2 className="mx-auto mt-3 max-w-lg font-display text-3xl font-bold tracking-tight">
            Drops, deals and tuning notes. Straight to you.
          </h2>
          <NewsletterForm />
          <p className="mt-3 text-xs text-muted">Join 40,000+ listeners. Unsubscribe anytime.</p>
        </div>
      </section>
    </div>
  );
}
