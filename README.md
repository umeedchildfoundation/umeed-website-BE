# UMEED Backend API

REST API for **UMEED Children Foundation**. Node.js, Express, TypeScript, SQLite (sql.js). Handles auth, users, volunteers, students, sessions, attendance, notices, events, media, volunteer applications, contact messages, and site content.

**Use this repo as the root of your backend GitHub repository.** Copy the entire contents of the `backend` folder into the repo (so that this README and `package.json` are at the repo root).

---

## Quick Start

```bash
# Clone your backend repo, then:
npm install

# Create .env (see Environment Variables below)
cp .env.example .env
# Edit .env: set JWT_SECRET, FRONTEND_URL if needed

# Seed demo users (optional but recommended for local dev)
npm run seed

# Start development server
npm run dev
```

Server runs at **http://localhost:3001**. Health check: `curl http://localhost:3001/api/health`

---

## Prerequisites

- **Node.js** v16 or higher
- **npm** (or yarn/pnpm)

---

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Environment file

Create a `.env` file in the **project root** (same folder as this README):

```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:8080
JWT_SECRET=umeed-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
DB_PATH=./data/umeed.db
UPLOAD_DIR=./uploads
```

Copy from `.env.example` if available and adjust.

### 3. Seed demo data (optional)

Creates demo users and sample data so you can log in from the frontend:

```bash
npm run seed
```

**Demo accounts after seeding:**

| Role        | Email               | Password     |
|------------|---------------------|--------------|
| Super Admin | preet@umeed.org    | admin2026    |
| Admin      | admin@umeed.org    | admin2026    |
| Volunteer  | volunteer@umeed.org | volunteer2026 |

### 4. Start server

```bash
npm run dev
```

- API: http://localhost:3001  
- Swagger docs: http://localhost:3001/api-docs  

---

## Project structure (repo root = backend)

```
├── src/
│   ├── app.ts                 # Express app
│   ├── server.ts              # Entry point
│   ├── db/
│   │   ├── index.ts           # DB connection (sql.js)
│   │   └── schema.sql        # SQLite schema
│   ├── routes/                # API routes (auth, users, volunteers, students, sessions, attendance, etc.)
│   ├── middleware/           # Auth (JWT), role checks
│   ├── utils/                 # Password, JWT, idGenerator
│   └── config/                # Swagger
├── sql/                       # Optional SQL migration/script files
├── scripts/                   # Scripts (e.g. show-db.ts)
├── data/                      # SQLite file (created at runtime) — umeed.db
├── uploads/                   # Uploaded files
├── tests/
├── .env                       # Your env (do not commit)
├── .env.example
├── package.json
├── tsconfig.json
└── README.md                  # This file
```

---

## Environment variables

| Variable       | Description           | Default / Note                    |
|----------------|-----------------------|-----------------------------------|
| `PORT`         | Server port           | `3001`                            |
| `NODE_ENV`     | development / production | `development`                 |
| `FRONTEND_URL` | Allowed CORS origin   | `http://localhost:8080`           |
| `JWT_SECRET`   | Secret for JWT        | **Required**; change in production |
| `JWT_EXPIRES_IN` | Token expiry       | `7d`                              |
| `DB_PATH`      | SQLite file path      | `./data/umeed.db`                 |
| `UPLOAD_DIR`   | File upload directory | `./uploads`                       |

---

## Database

- **Engine:** SQLite via **sql.js** (file persisted to disk).
- **File:** `data/umeed.db` (created on first run).
- **Schema:** `src/db/schema.sql`.

**Backup:**

```bash
cp data/umeed.db data/umeed.db.backup
```

**Restore:**

```bash
cp data/umeed.db.backup data/umeed.db
```

If the database or `data/` is missing:

```bash
mkdir -p data
npm run dev
```

---

## Main API areas

- **Auth:** `/api/auth` — login, register, me, change-password  
- **Users:** `/api/users` (admin)  
- **Volunteers:** `/api/volunteers`  
- **Students:** `/api/students`  
- **Sessions:** `/api/sessions`  
- **Attendance:** `/api/attendance` (students & volunteers, assignments)  
- **Notices:** `/api/notices`  
- **Events:** `/api/events`  
- **Media:** `/api/media/upload`  
- **Applications:** `/api/volunteer_applications`  
- **Contact:** `/api/contact_messages`  
- **Settings:** `/api/app_settings`  
- **Content:** `/api/content` (site CMS)  

Full interactive docs: **http://localhost:3001/api-docs** (Swagger).

---

## Scripts

| Command              | Description                |
|----------------------|----------------------------|
| `npm run dev`        | Start dev server (tsx watch) |
| `npm run build`      | TypeScript build            |
| `npm start`          | Run production build        |
| `npm run seed`       | Seed demo users & data      |
| `npm run test:endpoints` | Run API tests          |
| `npx tsx scripts/show-db.ts` | Print DB contents (read-only) |

---

## Production

1. Set `NODE_ENV=production` and a strong `JWT_SECRET`.
2. Set `FRONTEND_URL` to your frontend origin (e.g. `https://your-app.vercel.app`).
3. Build and run:

   ```bash
   npm run build
   npm start
   ```

Deploy to Railway, Render, Heroku, DigitalOcean, AWS, etc., and configure env vars there.

---

## Troubleshooting

- **Port in use:** Change `PORT` in `.env` or stop the process using 3001.
- **CORS errors:** Ensure `FRONTEND_URL` in `.env` matches the frontend origin.
- **No users / login fails:** Run `npm run seed` and restart the server so it reloads the DB.

---

## License

UMEED Children Foundation — Backend API
