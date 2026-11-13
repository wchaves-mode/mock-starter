import { query, type Event, type Venue } from './db';

export type EventsRepository = {
  findByCity(city: string): Promise<Event[]>;
  findById(id: string): Promise<Event | null>;
  create(event: Event): Promise<Event>;
};

const EVENT_COLUMNS = `id, name, city, date::text AS date, venue_id AS "venueId"`;

export const eventsRepository: EventsRepository = {
  findByCity: (city: string) => query<Event>(`SELECT ${EVENT_COLUMNS} FROM events WHERE city = $1 ORDER BY date, id`, [city]),
  findById: async (id: string) => (await query<Event>(`SELECT ${EVENT_COLUMNS} FROM events WHERE id = $1`, [id]))[0] ?? null,
  create: async (event: Event) =>
    (
      await query<Event>(`INSERT INTO events (id, name, city, date, venue_id) VALUES ($1, $2, $3, $4, $5) RETURNING ${EVENT_COLUMNS}`, [
        event.id,
        event.name,
        event.city,
        event.date,
        event.venueId,
      ])
    )[0],
};

export const venuesRepository = {
  findById: async (id: string) => (await query<Venue>('SELECT id, name, capacity FROM venues WHERE id = $1', [id]))[0] ?? null,
  findByIds: (ids: string[]) => query<Venue>('SELECT id, name, capacity FROM venues WHERE id = ANY($1)', [ids]),
};
