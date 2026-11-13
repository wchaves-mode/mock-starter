import type { RequestHandler } from 'express';
import type { ZodSchema } from 'zod';

export const validateBody =
  (schema: ZodSchema): RequestHandler =>
  (req, res, next) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Invalid request', details: parsed.error.flatten() });
      return;
    }
    req.body = parsed.data;
    next();
  };
