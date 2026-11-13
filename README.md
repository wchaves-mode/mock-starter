# Tickets starter

A small ticketing project with two apps:

- `backend/`: Express + TypeScript API backed by PGlite (an in-memory Postgres, no setup needed), tested with Vitest and Supertest.
- `frontend/`: React 18 + TypeScript app built with Vite, with MUI 5, Redux Toolkit, Formik and Yup installed. It uses a mock API, so it doesn't need the backend running.

## Requirements

- Node.js 18 or newer
- npm

No Docker or external database is needed.

## Backend

```bash
cd backend
npm install
npm test            # run the tests
npm run typecheck   # check types
npm run dev         # start the API on http://localhost:3000
```

Try `GET /events?city=bogota`, `GET /events/e1` and `POST /events`.

## Frontend

```bash
cd frontend
npm install
npm run dev         # http://localhost:5173
npm run typecheck   # check types
```

The mock API lives in `src/api.ts` and the Redux store in `src/store.ts`.

## Run in the browser

You can also open each app on StackBlitz without installing anything:

- Backend: https://stackblitz.com/github/wchaves-mode/mock-starter/tree/main/backend
- Frontend: https://stackblitz.com/github/wchaves-mode/mock-starter/tree/main/frontend