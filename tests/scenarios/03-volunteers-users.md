# 03 — Volunteers & Users

## Volunteers — `/api/volunteers`

### VOL-01 · List volunteers (authenticated)

**Pre:** Any valid token  
**Steps:** GET `/`  
**Expected:** Includes seed volunteers UMV1001–UMV1004

### VOL-02 · Filter by status

**Steps:** GET `/?status=pending`  
**Expected:** Includes pending@seed.umeed.local volunteer

### VOL-03 · Admin creates volunteer

**Pre:** Admin token  
**Steps:** POST `/` with name, email, status  
**Expected:** `201`

### VOL-04 · Admin updates volunteer status

**Steps:** PATCH `/{id}` `{ "status": "inactive" }`  
**Expected:** `200`

### VOL-05 · Volunteer cannot create

**Pre:** Volunteer token  
**Steps:** POST `/`  
**Expected:** `403`

---

## Users — `/api/users` (admin only)

### USER-01 · List users

**Pre:** Admin token  
**Expected:** Seed users visible

### USER-02 · Super admin deletes user

**Pre:** Super admin token (preet@umeed.org)  
**Steps:** DELETE non-critical test user  
**Expected:** `200`

### USER-03 · Admin cannot delete (edge)

**Pre:** Admin token (not super_admin)  
**Steps:** DELETE user  
**Expected:** `403`

### USER-04 · Update user role

**Pre:** Super admin  
**Steps:** PATCH user role  
**Expected:** `200` — verify role change affects access
