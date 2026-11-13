import { randomUUID } from 'node:crypto';
import { eventsRepository, venuesRepository } from './events.repository';
import { NotFoundError } from './errors';
import type { CreateEventInput } from './events.schemas';

export type EventResponse = { id: string; name: string; date: string; venueName: string | null };

export const eventsService = {
  async listByCity(city: string): Promise<EventResponse[]> {
    const events = await eventsRepository.findByCity(city);
    const result: EventResponse[] = [];
    for (const event of events) {
      const venue = await venuesRepository.findById(event.venueId);
      result.push({ id: event.id, name: event.name, date: event.date, venueName: venue?.name ?? null });
    }
    return result;
  },

  async getById(id: string): Promise<EventResponse> {
    const event = await eventsRepository.findById(id);
    if (!event) throw new NotFoundError(`Event ${id} not found`);
    const venue = await venuesRepository.findById(event.venueId);
    return { id: event.id, name: event.name, date: event.date, venueName: venue?.name ?? null };
  },

  async create(input: CreateEventInput): Promise<EventResponse> {
    const venue = await venuesRepository.findById(input.venueId);
    if (!venue) throw new NotFoundError(`Venue ${input.venueId} not found`);
    const event = await eventsRepository.create({ id: randomUUID(), ...input });
    return { id: event.id, name: event.name, date: event.date, venueName: venue.name };
  },
};
