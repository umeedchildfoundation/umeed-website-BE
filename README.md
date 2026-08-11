# UMEED Backend API

REST API for **UMEED Children Foundation**. Node.js, Express, TypeScript, PostgreSQL (Prisma ORM). Handles auth, users, volunteers, students, sessions, attendance, notices, events, media, volunteer applications, contact messages, and site content.

---

## Quick Start

```bash
npm install

cp .env.example .env
# Edit .env: set DATABASE_URL (Neon/local Postgres), JWT_SECRET, FRONTEND_URL

npx prisma migrate deploy   # apply migrations
npm run seed                # idempotent — replaces fixture data, safe to re-run

npm run dev
```

Server runs at **http://localhost:3001**

- Health: `curl http://localhost:3001/api/health`
- API docs: http://localhost:3001/api-docs
- Test scenarios: `tests/scenarios/README.md`

**Approval emails** are sent by the **frontend via Google Apps Script**, not this API.

---

## Prerequisites

- **Node.js** v20 or higher
- **PostgreSQL** database (local or cloud, e.g. Neon)
- **npm**

---

## Environment variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string (`?sslmode=require` for Neon) | Yes |
| `PORT` | Server port | No (default `3001`) |
| `NODE_ENV` | `development` / `production` | No |
| `FRONTEND_URL` | CORS allowed origin | No (default `http://localhost:8080`) |
| `JWT_SECRET` | JWT signing secret | Yes |
| `JWT_EXPIRES_IN` | Token expiry | No (default `7d`) |
| `AWS_REGION` | S3 region for media uploads | For uploads |
| `AWS_ACCESS_KEY_ID` | S3 access key | For uploads |
| `AWS_SECRET_ACCESS_KEY` | S3 secret key | For uploads |
| `AWS_S3_BUCKET_NAME` | S3 bucket name | For uploads |

Copy from `.env.example` and adjust.

---

## Database

- **Engine:** PostgreSQL via **Prisma ORM** with `@prisma/adapter-pg`
- **Schema:** multi-file under `prisma/` (`schema.prisma` + `prisma/models/*.prisma`)
- **Config:** `prisma.config.ts` (connection URL for CLI/migrations)
- **Migrations:** `prisma/migrations/`

```bash
npx prisma migrate dev      # create/apply migrations (local dev)
npx prisma migrate deploy   # apply migrations (production/CI)
npm run seed                # seed demo users
```

**Demo accounts after seeding:**

| Role | Email | Password |
|------|-------|----------|
| Super Admin | preet@umeed.org | admin2026 |
| Admin | admin@umeed.org | admin2026 |
| Volunteer | volunteer@umeed.org | volunteer2026 |

---

## Project structure

```
├── src/
│   ├── app.ts              # Express app, middleware, routes
│   ├── server.ts           # Entry point
│   ├── db/                 # Prisma client + pg pool
│   ├── shared/             # Shared utilities (pg pool config)
│   ├── features/           # Route handlers by domain
│   ├── middleware/         # Auth, validation, roles
│   ├── utils/              # JWT, password, S3, etc.
│   └── config/             # Swagger
├── prisma/
│   ├── schema.prisma       # datasource + generator
│   ├── models/             # Prisma models (multi-file)
│   ├── migrations/
│   └── seed.ts
├── prisma.config.ts        # Prisma CLI config (DATABASE_URL)
├── nodemon.json            # Dev auto-reload
├── uploads/                # Local file uploads
├── logs/
├── .env.example
└── Dockerfile
```

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server with nodemon (auto-runs `prisma generate`) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run production build |
| `npm run seed` | Seed demo users + test fixtures (idempotent) |
| `npm run seed:reset` | Full seed reset (dev only) |
| `npm run prisma:generate` | Generate Prisma client |
| `npm run prisma:migrate` | Create/apply migrations (dev) |

---

## Production

1. Set `NODE_ENV=production`, strong `JWT_SECRET`, and real `DATABASE_URL`.
2. Set `FRONTEND_URL` to your frontend origin.
3. Build and run:

   ```bash
   npx prisma migrate deploy
   npm run build
   npm start
   ```

Docker:

```bash
docker build -t umeed-backend .
docker run -p 3001:3001 --env-file .env umeed-backend
```

At **build** time, Docker uses a placeholder `DATABASE_URL` only for `prisma generate`. At **runtime**, pass the real `DATABASE_URL`.

---

## Troubleshooting

- **Port in use:** Change `PORT` in `.env` or stop the process on 3001.
- **CORS errors:** Ensure `FRONTEND_URL` matches your frontend origin.
- **DB connection fails:** Check `DATABASE_URL`, wake Neon DB if paused, use `?sslmode=require` for cloud Postgres.
- **No users / login fails:** Run `npm run seed`.
- **Prisma IDE errors:** Reload the window after schema changes; schema lives in `prisma/` folder.

---

## License

UMEED Children Foundation — Backend API
