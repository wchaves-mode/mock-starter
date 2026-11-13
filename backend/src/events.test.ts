import request from 'supertest';
import { beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { app } from './app';
import { query, ready, stats } from './db';

beforeAll(() => ready);
beforeEach(() => {
  stats.queries = 0;
});

describe('GET /events', () => {
  it('lists events of a city with the venue name', async () => {
    const [{ count }] = await query<{ count: number }>("SELECT count(*)::int AS count FROM events WHERE city = 'bogota'");
    const res = await request(app).get('/events?city=bogota');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(count);
    expect(res.body[0]).toEqual({ id: 'e1', name: 'Rock Night', date: '2026-12-01', venueName: 'Arena Norte' });
  });

  it.skip('uses a fixed number of queries, whatever the number of events', async () => {
    await request(app).get('/events?city=bogota');
    expect(stats.queries).toBe(2);
  });
});

describe('GET /events/:id', () => {
  it('returns 404 when the event does not exist', async () => {
    const res = await request(app).get('/events/nope');
    expect(res.status).toBe(404);
  });
});

describe('POST /events', () => {
  it('rejects unknown fields', async () => {
    const res = await request(app).post('/events').send({ name: 'X', city: 'bogota', date: '2026-12-20', venueId: 'v1', admin: true });
    expect(res.status).toBe(400);
  });
});
