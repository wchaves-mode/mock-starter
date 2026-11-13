// Mock API: no backend needed. Do not change this file.
export type TicketEvent = {
  id: string;
  name: string;
  city: string;
  date: string;
  venueName: string;
  availableSeats: number;
  priceCents: number;
  currency: string;
};

export type OrderInput = { email: string; quantity: number };
export type Order = { id: string; eventId: string; quantity: number };

const events: TicketEvent[] = [
  { id: 'e1', name: 'Rock Night', city: 'Bogota', date: '2026-12-01', venueName: 'Arena Norte', availableSeats: 4200, priceCents: 8500, currency: 'USD' },
  { id: 'e2', name: 'Jazz Live', city: 'Bogota', date: '2026-12-05', venueName: 'Teatro Central', availableSeats: 120, priceCents: 6000, currency: 'USD' },
  { id: 'e3', name: 'Opera Gala', city: 'Medellin', date: '2026-12-12', venueName: 'Teatro Central', availableSeats: 0, priceCents: 15000, currency: 'USD' },
  { id: 'e4', name: 'Acoustic Session', city: 'Medellin', date: '2026-12-15', venueName: 'Sala Pequena', availableSeats: 1, priceCents: 4000, currency: 'USD' },
];

const delay = (ms: number) => new Promise(r => setTimeout(r, ms));

export async function fetchEvents(): Promise<TicketEvent[]> {
  await delay(800);
  // Add ?fail=1 to the URL to simulate a server error
  if (new URLSearchParams(window.location.search).has('fail')) throw new Error('Server error');
  return events.map(e => ({ ...e }));
}

export async function createOrder(eventId: string, input: OrderInput): Promise<Order> {
  await delay(800);
  const event = events.find(e => e.id === eventId);
  if (!event) throw new Error('Event not found');
  if (input.quantity > event.availableSeats) throw new Error('Not enough seats left');
  event.availableSeats -= input.quantity;
  return { id: `o-${Date.now()}`, eventId, quantity: input.quantity };
}
