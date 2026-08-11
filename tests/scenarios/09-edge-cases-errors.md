# 09 — Edge Cases & Errors

## Global

### EDGE-01 · Health check

**Steps:** GET `/api/health`  
**Expected:** `{ "status": "ok" }`

### EDGE-02 · Unknown route

**Steps:** GET `/api/does-not-exist`  
**Expected:** `404` JSON `{ "error": "Not found" }`

### EDGE-03 · CORS from wrong origin

**Steps:** Request from origin not in `FRONTEND_URL`  
**Expected:** Browser blocks or server rejects preflight

---

## Auth edge cases

### EDGE-04 · Expired / malformed JWT

**Steps:** `Authorization: Bearer invalid.token.here`  
**Expected:** `401`

### EDGE-05 · Valid token, deleted user

**Steps:** Delete user while token still valid  
**Expected:** `401` User not found

---

## Validation edge cases

### EDGE-06 · Missing required fields

**Steps:** POST applications without email  
**Expected:** `400` Joi validation

### EDGE-07 · Invalid email format

**Steps:** POST contact with `not-an-email`  
**Expected:** `400`

---

## Database / seed edge cases

### EDGE-08 · Seed idempotency

**Steps:** Run `npm run seed` 3 times  
**Expected:** Fixture counts unchanged; no duplicate SEED-001 student

### EDGE-09 · Full seed reset

**Steps:** `npm run seed:reset`  
**Expected:** Core users recreated; use only on dev DB

### EDGE-10 · Missing DATABASE_URL

**Steps:** Start server without env  
**Expected:** Clear error at startup

---

## Storage hygiene (Neon 500 MB)

- Delete manual test applications/contact messages older than X days in dev
- Never run `seed:reset` against production
- Monitor Neon dashboard size monthly
