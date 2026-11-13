import { PGlite } from '@electric-sql/pglite';

export type Event = { id: string; name: string; city: string; date: string; venueId: string };
export type Venue = { id: string; name: string; capacity: number };
export type Order = { id: string; eventId: string; email: string; quantity: number; createdAt: string };

export const stats = { queries: 0 };

const pg = new PGlite();

export async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  stats.queries++;
  const result = await pg.query<T>(sql, params);
  return result.rows;
}

const CITIES = ['bogota', 'medellin', 'cali', 'barranquilla', 'cartagena'];
const CITY_WEIGHTS = [0.3, 0.2, 0.2, 0.15, 0.15];
const GENRES = ['Rock', 'Jazz', 'Salsa', 'Indie', 'Electro', 'Vallenato', 'Cumbia', 'Reggae', 'Pop', 'Blues', 'Folk', 'Hip Hop'];
const FORMATS = ['Night', 'Live', 'Fest', 'Session', 'Showcase', 'Marathon', 'Unplugged', 'Gala'];
const PLACES = ['Auditorio', 'Coliseo', 'Teatro', 'Sala', 'Club', 'Plaza', 'Galeria', 'Estadio'];
const PLACE_NAMES = ['del Rio', 'Mayor', 'Colon', 'del Sol', 'Libertad', 'Botero', 'del Mar', 'Andino', 'Real', 'Moderno'];

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildSeed() {
  const rand = mulberry32(42);
  const int = (min: number, max: number) => min + Math.floor(rand() * (max - min + 1));
  const pick = <T>(items: T[]) => items[Math.floor(rand() * items.length)];
  const pickCity = () => {
    let r = rand();
    for (let i = 0; i < CITIES.length; i++) {
      r -= CITY_WEIGHTS[i];
      if (r < 0) return CITIES[i];
    }
    return CITIES[CITIES.length - 1];
  };

  const venues: Venue[] = [
    { id: 'v1', name: 'Arena Norte', capacity: 5000 },
    { id: 'v2', name: 'Teatro Central', capacity: 800 },
    { id: 'v3', name: 'Sala Pequena', capacity: 10 },
  ];
  const events: Event[] = [
    { id: 'e1', name: 'Rock Night', city: 'bogota', date: '2026-12-01', venueId: 'v1' },
    { id: 'e2', name: 'Jazz Live', city: 'bogota', date: '2026-12-05', venueId: 'v2' },
    { id: 'e3', name: 'Indie Fest', city: 'bogota', date: '2026-12-10', venueId: 'v1' },
    { id: 'e4', name: 'Opera Gala', city: 'medellin', date: '2026-12-12', venueId: 'v2' },
    { id: 'e5', name: 'Acoustic Session', city: 'medellin', date: '2026-12-15', venueId: 'v3' },
  ];
  const orders: Order[] = [
    { id: 'o1', eventId: 'e5', email: 'ana@example.com', quantity: 6, createdAt: '2026-11-01T10:00:00Z' },
    { id: 'o2', eventId: 'e5', email: 'luis@example.com', quantity: 3, createdAt: '2026-11-02T10:00:00Z' },
  ];

  for (let i = 4; i <= 33; i++) {
    venues.push({ id: `v${i}`, name: `${pick(PLACES)} ${pick(PLACE_NAMES)}`, capacity: int(5, 60) * 50 });
  }

  const startOf2027 = Date.UTC(2027, 0, 1);
  const day = 24 * 60 * 60 * 1000;
  for (let i = 6; i <= 2005; i++) {
    const date = new Date(startOf2027 + int(0, 364) * day).toISOString().slice(0, 10);
    events.push({ id: `e${i}`, name: `${pick(GENRES)} ${pick(FORMATS)}`, city: pickCity(), date, venueId: pick(venues).id });
  }

  const capacityById = new Map(venues.map(v => [v.id, v.capacity]));
  let orderId = 3;
  for (const event of events.slice(5)) {
    if (rand() > 0.3) continue;
    let remaining = capacityById.get(event.venueId)!;
    for (let n = int(1, 3); n > 0 && remaining > 0; n--) {
      const quantity = Math.min(int(1, 8), remaining);
      remaining -= quantity;
      const createdAt = new Date(Date.UTC(2026, 9, 1) + int(0, 40 * 24 * 60) * 60_000).toISOString();
      orders.push({ id: `o${orderId++}`, eventId: event.id, email: `fan${int(1, 500)}@example.com`, quantity, createdAt });
    }
  }

  return { venues, events, orders };
}

async function insertAll(table: string, columns: string[], rows: unknown[][]) {
  const params: unknown[] = [];
  const values = rows.map(row => `(${row.map(value => `$${params.push(value)}`).join(', ')})`);
  await pg.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES ${values.join(', ')}`, params);
}

async function init() {
  await pg.exec(`
    CREATE TABLE venues (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      capacity INTEGER NOT NULL
    );
    CREATE TABLE events (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      city TEXT NOT NULL,
      date DATE NOT NULL,
      venue_id TEXT NOT NULL REFERENCES venues(id)
    );
    CREATE TABLE orders (
      id TEXT PRIMARY KEY,
      event_id TEXT NOT NULL REFERENCES events(id),
      email TEXT NOT NULL,
      quantity INTEGER NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);

  const { venues, events, orders } = buildSeed();
  await insertAll(
    'venues',
    ['id', 'name', 'capacity'],
    venues.map(v => [v.id, v.name, v.capacity]),
  );
  await insertAll(
    'events',
    ['id', 'name', 'city', 'date', 'venue_id'],
    events.map(e => [e.id, e.name, e.city, e.date, e.venueId]),
  );
  await insertAll(
    'orders',
    ['id', 'event_id', 'email', 'quantity', 'created_at'],
    orders.map(o => [o.id, o.eventId, o.email, o.quantity, o.createdAt]),
  );
}

export const ready: Promise<void> = init();
