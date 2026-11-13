import { z } from 'zod';

export const createEventSchema = z
  .object({
    name: z.string().min(1),
    city: z.string().min(1),
    date: z.iso.date(),
    venueId: z.string().min(1),
  })
  .strict();

export type CreateEventInput = z.infer<typeof createEventSchema>;
