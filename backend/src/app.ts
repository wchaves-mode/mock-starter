import express, { type ErrorRequestHandler } from 'express';
import { eventsRouter } from './events.routes';
import { NotFoundError } from './errors';

export const app = express();
app.use(express.json());
app.use(eventsRouter);

const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof NotFoundError) {
    res.status(404).json({ error: err.message });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
};
app.use(errorHandler);
