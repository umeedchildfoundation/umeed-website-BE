# UMEED Backend — Manual Test Scenarios

Use these scenarios to verify the API + frontend integration. Each file is editable — add notes, mark pass/fail, assign owners.

## Before testing

```bash
npm run seed          # safe re-run: replaces fixture data only (~30 rows)
npm run dev           # API on :3001
# Frontend on :8080 with FRONTEND_URL=http://localhost:8080 in .env
```

### Seed accounts

| Email | Password | Role |
|-------|----------|------|
| preet@umeed.org | admin2026 | super_admin |
| admin@umeed.org | admin2026 | admin |
| volunteer@umeed.org | volunteer2026 | volunteer (approved) |
| pending@seed.umeed.local | volunteer2026 | volunteer (pending) |

### Seed fixture IDs (stable across seed runs)

| Entity | ID | Notes |
|--------|-----|-------|
| Pending application | `00000000-0000-4000-8000-000000000051` | Use to test approval + email |
| Rejected application | `00000000-0000-4000-8000-000000000052` | Edge case: already rejected |
| Active student | `00000000-0000-4000-8000-000000000031` | roll `SEED-001` |
| Upcoming session | `00000000-0000-4000-8000-000000000041` | RSVP enabled |

### Email on approval

Handled by the **frontend (Google Apps Script)** after a successful PATCH approval — not by this API.

The backend only updates `status`, `reviewed_by`, and `reviewed_at`.

---

## Scenario index

| # | File | Area |
|---|------|------|
| 01 | [01-auth.md](./01-auth.md) | Login, register, profile, password |
| 02 | [02-volunteer-applications.md](./02-volunteer-applications.md) | Public form, admin review, approval email |
| 03 | [03-volunteers-users.md](./03-volunteers-users.md) | Volunteer CRUD, user admin |
| 04 | [04-students.md](./04-students.md) | Student CRUD, active/inactive |
| 05 | [05-sessions-attendance.md](./05-sessions-attendance.md) | Sessions, RSVP, attendance, assignments |
| 06 | [06-notices-events.md](./06-notices-events.md) | Notices visibility, events |
| 07 | [07-contact-content-settings.md](./07-contact-content-settings.md) | Contact form, CMS, settings |
| 08 | [08-media.md](./08-media.md) | S3 uploads (requires AWS creds) |
| 09 | [09-edge-cases-errors.md](./09-edge-cases-errors.md) | Auth failures, validation, duplicates |

---

## Checklist template

Copy per test run:

```
Date: ___________
Tester: ___________
Branch: ___________

[ ] 01-auth
[ ] 02-volunteer-applications
[ ] 03-volunteers-users
[ ] 04-students
[ ] 05-sessions-attendance
[ ] 06-notices-events
[ ] 07-contact-content-settings
[ ] 08-media (skip if no S3)
[ ] 09-edge-cases-errors
```

---

## Storage note (Neon 500 MB free tier)

- `npm run seed` **deletes then recreates** fixture rows (fixed UUIDs) — no unbounded growth
- Real user submissions (applications, contact) **do accumulate** — periodically delete test rows or use `npm run seed:reset` on dev only
- `@seed.umeed.local` emails are safe to bulk-delete in dev
