import bcrypt from 'bcryptjs';
import { db, migrate, isSeeded } from './db.js';

const CATEGORIES = [
  { slug: 'headphones', name: 'Headphones', image: '/images/cat-headphones.jpg' },
  { slug: 'earbuds', name: 'Earbuds', image: '/images/cat-earbuds.jpg' },
  { slug: 'speakers', name: 'Speakers', image: '/images/cat-speakers.jpg' },
];

const PRODUCTS = [
  {
    slug: 'apex-one', name: 'BB24 Apex One',
    tagline: 'Our flagship. Silence, then sound.',
    description:
      'The Apex One is the headphone we built to end the conversation about noise. Custom 45mm beryllium drivers deliver a soundstage that feels carved out of air, while the six-microphone hybrid ANC array erases up to 48dB of the world around you. A 60-hour battery, memory-foam earcups wrapped in vegan leather, and multipoint Bluetooth mean it disappears into your day — until the music starts.',
    price_cents: 54999, compare_at_cents: 64999, category: 'headphones',
    image: '/images/apex-one.jpg', colors: ['Matte Black', 'Lunar Silver'],
    rating: 4.9, review_count: 2314, stock: 42, featured: 1,
  },
  {
    slug: 'drift', name: 'BB24 Drift',
    tagline: 'Featherweight on-ears for all-day everything.',
    description:
      'At 178 grams, the Drift is the on-ear you forget you are wearing. A tuned 40mm driver keeps the mids honest and the bass present without the bloat, and the fold-flat design slips into any bag. Twenty-eight hours of playback, USB-C fast charging that buys you 5 hours from 10 minutes, and a mic array that keeps calls crisp on windy streets.',
    price_cents: 24999, compare_at_cents: null, category: 'headphones',
    image: '/images/drift.jpg', colors: ['Matte Black', 'Sand', 'Sage'],
    rating: 4.6, review_count: 864, stock: 120, featured: 0,
  },
  {
    slug: 'studio-max', name: 'BB24 Studio Max',
    tagline: 'Reference sound, no studio required.',
    description:
      'Studio Max is tuned flat on purpose. A hand-matched driver pair, open-back-inspired acoustic chamber, and support for LDAC and USB-C lossless turn any desk into a mixing position. Detachable cable with a 6.35mm adapter included, because your interface deserves better than a dongle.',
    price_cents: 39999, compare_at_cents: 45999, category: 'headphones',
    image: '/images/studio-max.jpg', colors: ['Matte Black'],
    rating: 4.8, review_count: 1102, stock: 35, featured: 0,
  },
  {
    slug: 'orbit', name: 'BB24 Orbit',
    tagline: 'Hear the footstep before it happens.',
    description:
      'Orbit is built for competitive play: ultra-low-latency 2.4GHz wireless plus Bluetooth 5.4, a broadcast-grade detachable boom mic with AI noise rejection, and spatial audio tuned for positional cues. Memory-foam cooling-gel earcups keep you comfortable through overtime, and the 50-hour battery outlasts every tournament bracket.',
    price_cents: 32999, compare_at_cents: null, category: 'headphones',
    image: '/images/orbit.jpg', colors: ['Matte Black', 'Arctic White'],
    rating: 4.7, review_count: 693, stock: 58, featured: 0,
  },
  {
    slug: 'echo-buds-pro', name: 'BB24 Echo Buds Pro',
    tagline: 'Pro silence. Pocket size.',
    description:
      'Echo Buds Pro pack our flagship ANC into a bud that weighs 4.8 grams. Dual drivers — a dynamic bass unit plus a balanced armature — keep every layer of the mix separated, while adaptive EQ tunes itself to your ear shape in seconds. Six mics, wireless charging, and an IPX5 rating mean they are ready for the commute, the gym, and the red-eye alike.',
    price_cents: 29999, compare_at_cents: 34999, category: 'earbuds',
    image: '/images/echo-buds-pro.jpg', colors: ['Matte Black', 'Lunar Silver', 'Midnight Blue'],
    rating: 4.8, review_count: 3120, stock: 200, featured: 1,
  },
  {
    slug: 'echo-buds-air', name: 'BB24 Echo Buds Air',
    tagline: 'Everyday buds, done right.',
    description:
      'The Buds Air are the pair you reach for without thinking: 13mm drivers with real low-end, four mics for clear calls, and 32 hours of total playtime with the pocketable case. Touch controls you can actually remember, and a fit tuned from ten thousand ear scans.',
    price_cents: 14999, compare_at_cents: null, category: 'earbuds',
    image: '/images/echo-buds-air.jpg', colors: ['Matte Black', 'Arctic White', 'Sage'],
    rating: 4.5, review_count: 1876, stock: 340, featured: 0,
  },
  {
    slug: 'sprint-buds', name: 'BB24 Sprint Buds',
    tagline: 'Lock in. Tune out. Move.',
    description:
      'Sprint Buds use a flexible ear-wing that locks the bud in place no matter how hard the interval gets. IP57 sweat and dust proofing, a bass-forward tune that keeps your cadence honest, and wind-guard mics so your running partner hears you, not the traffic. Eight hours per charge, 30 with the case.',
    price_cents: 17999, compare_at_cents: 21999, category: 'earbuds',
    image: '/images/sprint-buds.jpg', colors: ['Matte Black', 'Volt'],
    rating: 4.6, review_count: 942, stock: 150, featured: 0,
  },
  {
    slug: 'halo-pods', name: 'BB24 Halo Pods',
    tagline: 'Open ears, full sound.',
    description:
      'Halo Pods rest outside the ear canal, so you stay aware of the city while a directed sound field keeps your audio private. Perfect for cyclists, runners, and open offices. Sixteen hours of battery, feather-light titanium hooks, and a call quality that surprises everyone on the other end.',
    price_cents: 19999, compare_at_cents: null, category: 'earbuds',
    image: '/images/halo-pods.jpg', colors: ['Matte Black'],
    rating: 4.4, review_count: 517, stock: 88, featured: 0,
  },
  {
    slug: 'thunder-boom', name: 'BB24 Thunder Boom',
    tagline: 'The party, portable.',
    description:
      'Thunder Boom moves serious air: dual 4-inch woofers and twin tweeters push 120 watts of room-filling sound with bass you feel in your chest. IP67 waterproofing, 24 hours of playtime, and a light ring that pulses with the beat. Pair two for true wireless stereo and take the night with you.',
    price_cents: 44999, compare_at_cents: null, category: 'speakers',
    image: '/images/thunder-boom.jpg', colors: ['Matte Black'],
    rating: 4.9, review_count: 1508, stock: 64, featured: 1,
  },
  {
    slug: 'ember', name: 'BB24 Ember',
    tagline: 'Warm sound for slow mornings.',
    description:
      'Ember is the speaker that lives in your kitchen and never leaves. A 360-degree acoustic design fills the room evenly, the fabric finish shrugs off splashes, and voice control handles timers, playlists, and trivia while your hands are covered in flour. Multiroom pairing links every Ember in the house.',
    price_cents: 27999, compare_at_cents: 32999, category: 'speakers',
    image: '/images/ember.jpg', colors: ['Charcoal', 'Sand'],
    rating: 4.7, review_count: 830, stock: 95, featured: 0,
  },
  {
    slug: 'halo-bar', name: 'BB24 Halo Bar',
    tagline: 'Cinema sound, one bar.',
    description:
      'Eleven drivers, Dolby Atmos virtualization, and a wireless subwoofer that hits 30Hz turn movie night into a private screening. HDMI eARC, dialogue-enhance mode for whispered prestige dramas, and a night mode that keeps the explosions from waking the house.',
    price_cents: 59999, compare_at_cents: null, category: 'speakers',
    image: '/images/halo-bar.jpg', colors: ['Matte Black'],
    rating: 4.8, review_count: 426, stock: 28, featured: 0,
  },
  {
    slug: 'ripple-mini', name: 'BB24 Ripple Mini',
    tagline: 'Small speaker. Absurd sound.',
    description:
      'Ripple Mini is the size of a coffee mug and sounds like cheating. A passive bass radiator and DSP tuning squeeze genuine low-end out of a pocketable cylinder, with 12 hours of playtime and full IP67 waterproofing. Clip it to a backpack, toss it in a tote, take the soundtrack anywhere.',
    price_cents: 12999, compare_at_cents: 15999, category: 'speakers',
    image: '/images/ripple-mini.jpg', colors: ['Matte Black', 'Midnight Blue', 'Volt'],
    rating: 4.6, review_count: 2034, stock: 210, featured: 1,
  },
];

const REVIEWS = {
  'apex-one': [
    ['Marcus T.', 5, 'Worth every dollar', 'I fly weekly for work and the ANC on these is genuinely unreal — engine drone just vanishes. The soundstage is wide without feeling artificial. Battery easily lasts my whole travel week.'],
    ['Priya S.', 5, 'Upgraded from a big-name brand', 'I A/B tested these against my old $600 pair and the Apex One won on comfort and clarity. Multipoint switching between my laptop and phone is instant.'],
    ['Jonah K.', 4, 'Superb, with one nitpick', 'Sound and noise cancelling are best-in-class. I only wish the case were a touch slimmer for my carry-on. Otherwise flawless.'],
  ],
  drift: [
    ['Alina R.', 5, 'My daily drivers', 'So light I forget they are on. The fast charge saved me twice before flights — 10 minutes, 5 hours. Wild.'],
    ['Devon M.', 4, 'Great for the price', 'Comfortable for long work days and the mic is solid on calls. Bass heads might want more thump, but the tuning is honest.'],
  ],
  'studio-max': [
    ['Elena V.', 5, 'Mixing on these now', 'Flat, detailed, and the stereo imaging is precise enough to place reverb tails. The USB-C lossless mode is a real step up from Bluetooth.'],
    ['Sam O.', 5, 'Reference quality', 'I produce as a hobby and these revealed details in my own tracks I had never heard. Build feels like it will last a decade.'],
  ],
  orbit: [
    ['Kai L.', 5, 'Clutch in ranked', 'The positional audio is no joke — I hear reloads and footsteps clearly before my teammates do. Mic gets compliments every session.'],
    ['Renee D.', 4, 'Comfortable for marathons', 'Wore them for a 6-hour session with zero ear fatigue. Cooling gel earcups actually work. Dock would be nice but the battery lasts forever.'],
  ],
  'echo-buds-pro': [
    ['Maya C.', 5, 'The ANC is scary good', 'Turned it on in a subway car and the rumble just dropped away. Sound is layered — I keep noticing instruments I missed before.'],
    ['Tom H.', 5, 'Gym-proof and call-proof', 'They stay put on runs, survive my sweatiest workouts, and callers say I sound like I am in a quiet room. The case feels premium too.'],
    ['Aisha B.', 4, 'Excellent, app could be better', 'Hardware is five stars — fit, sound, battery. The companion app EQ is a bit fiddly but the default tune is already great.'],
  ],
  'echo-buds-air': [
    ['Leo P.', 5, 'Best value buds I have owned', 'For this price the sound is honestly ridiculous. I bought a second pair for my partner.'],
    ['Nina W.', 4, 'Solid everyday pick', 'Comfortable for hours, case is tiny, and calls are clear. No wireless charging at this price, which is fair.'],
  ],
  'sprint-buds': [
    ['Chris B.', 5, 'They do not move. At all.', 'Sprints, burpees, box jumps — locked in. The wing design is the real deal and the bass keeps me pushing.'],
    ['Dana F.', 4, 'Great for training', 'IP57 gives me confidence in rain and sweat. Wind noise on calls is handled better than any buds I have tried.'],
  ],
  'halo-pods': [
    ['Omar J.', 5, 'Perfect for cycling', 'I hear traffic clearly and my podcasts sound full. People next to me hear nothing. Exactly what I wanted.'],
    ['Grace L.', 4, 'Comfortable all day', 'No ear fatigue since nothing goes in the canal. Bass is lighter than sealed buds, as expected, but the trade-off is worth it.'],
  ],
  'thunder-boom': [
    ['Victor E.', 5, 'It rattled my deck railing', 'The bass on this thing is physical. We used it for a backyard party of 30 people and it carried the whole yard without breaking a sweat.'],
    ['Hannah G.', 5, 'Survived the lake', 'Knocked it off a dock into the water — fished it out, kept playing. 24-hour battery claim is real; we got through a full weekend.'],
    ['Paul N.', 4, 'Loud and proud', 'Stereo pairing two of these is transformative. It is hefty, but that is the price of this much sound. Worth it.'],
  ],
  ember: [
    ['Sofia M.', 5, 'The heart of our kitchen', 'Music while cooking, timers by voice, and it looks beautiful on the counter. Multiroom with the bedroom unit is seamless.'],
    ['Ben K.', 4, 'Warm and easy', 'Sound is rich without being boomy. Setup took five minutes. Wish it came in more colors, but the charcoal looks sharp.'],
  ],
  'halo-bar': [
    ['Derek S.', 5, 'My living room is a cinema now', 'Dialogue mode fixed the mumbled-dialogue problem completely, and action scenes hit hard thanks to the sub. eARC setup was plug-and-play.'],
    ['Iris T.', 5, 'Night mode is genius', 'Two kids asleep upstairs and I can still enjoy a blockbuster at full clarity without shaking the walls. Brilliant feature.'],
  ],
  'ripple-mini': [
    ['Jake W.', 5, 'Impossible sound for the size', 'I keep handing it to friends and watching their faces. It should not sound this big. Battery easily does a full beach day.'],
    ['Mia D.', 5, 'Bought three as gifts', 'One for my desk, two as gifts — everyone asks about it. The volt color pops without looking cheap.'],
    ['Alex R.', 4, 'Tiny titan', 'Genuine bass from something this small still surprises me. Gets plenty loud for a shower or a picnic.'],
  ],
};

export function runSeed() {
  migrate();

  const insertCat = db.prepare('INSERT OR IGNORE INTO categories (slug, name, image) VALUES (?, ?, ?)');
  for (const c of CATEGORIES) insertCat.run(c.slug, c.name, c.image);

  const insertProduct = db.prepare(
    `INSERT OR IGNORE INTO products
     (slug, name, tagline, description, price_cents, compare_at_cents, category, image, colors, rating, review_count, stock, featured)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const productIds = {};
  for (const p of PRODUCTS) {
    insertProduct.run(
      p.slug, p.name, p.tagline, p.description, p.price_cents, p.compare_at_cents,
      p.category, p.image, JSON.stringify(p.colors), p.rating, p.review_count, p.stock, p.featured
    );
    const row = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
    productIds[p.slug] = row.id;
  }

  const insertReview = db.prepare(
    'INSERT INTO reviews (product_id, user_name, rating, title, body) VALUES (?, ?, ?, ?, ?)'
  );
  const existing = db.prepare('SELECT COUNT(*) AS c FROM reviews').get().c;
  if (existing === 0) {
    for (const [slug, list] of Object.entries(REVIEWS)) {
      for (const [user_name, rating, title, body] of list) {
        insertReview.run(productIds[slug], user_name, rating, title, body);
      }
    }
  }

  const hashAdmin = bcrypt.hashSync('admin123', 10);
  const hashDemo = bcrypt.hashSync('demo1234', 10);
  const insertUser = db.prepare(
    'INSERT OR IGNORE INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)'
  );
  insertUser.run('Store Admin', 'admin@bb24.shop', hashAdmin, 'admin');
  insertUser.run('Demo Customer', 'demo@bb24.shop', hashDemo, 'customer');

  console.log('Seed complete: 12 products, 28 reviews, 3 categories, 2 users.');
}

// Run directly: `node backend/src/seed.js`
if (process.argv[1] && import.meta.url.endsWith(process.argv[1].split(/[\\/]/).pop())) {
  runSeed();
}
