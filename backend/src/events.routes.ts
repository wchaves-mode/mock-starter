import { Router } from 'express';
import { eventsService } from './events.service';
import { createEventSchema } from './events.schemas';
import { validateBody } from './validate';

export const eventsRouter = Router();

eventsRouter.get('/events', async (req, res, next) => {
  try {
    res.json(await eventsService.listByCity(String(req.query.city ?? '')));
  } catch (err) {
    next(err);
  }
});

eventsRouter.get('/events/:id', async (req, res, next) => {
  try {
    res.json(await eventsService.getById(req.params.id));
  } catch (err) {
    next(err);
  }
});

eventsRouter.post('/events', validateBody(createEventSchema), async (req, res, next) => {
  try {
    res.status(201).json(await eventsService.create(req.body));
  } catch (err) {
    next(err);
  }
});
