# 01 — Authentication

Base URL: `http://localhost:3001/api/auth`

## AUTH-01 · Login success (admin)

**Pre:** `npm run seed`  
**Steps:**
1. POST `/login` `{ "email": "admin@umeed.org", "password": "admin2026" }`
2. Save `token` from response

**Expected:** `200`, JWT returned, role `admin`

---

## AUTH-02 · Login success (volunteer)

**Steps:** POST `/login` with `volunteer@umeed.org` / `volunteer2026`  
**Expected:** `200`, role `volunteer`

---

## AUTH-03 · Login wrong password

**Steps:** POST `/login` with valid email, wrong password  
**Expected:** `401`, no token

---

## AUTH-04 · Login unknown email

**Steps:** POST `/login` `{ "email": "nobody@example.com", "password": "x" }`  
**Expected:** `401`

---

## AUTH-05 · Get current user

**Pre:** Admin token from AUTH-01  
**Steps:** GET `/me` with `Authorization: Bearer <token>`  
**Expected:** `200`, email matches admin

---

## AUTH-06 · Get me without token

**Steps:** GET `/me` without header  
**Expected:** `401`

---

## AUTH-07 · Register new volunteer

**Steps:** POST `/register` with new unique email, password, fullName  
**Expected:** `201`, user created, linked volunteer with `status: pending`

**Edge:** Register same email twice → expect error / 409 or 400

---

## AUTH-08 · Update profile

**Pre:** Volunteer token  
**Steps:** PATCH `/me` `{ "fullName": "Updated Name" }`  
**Expected:** `200`, name updated in `/me`

---

## AUTH-09 · Change password

**Pre:** Volunteer token  
**Steps:** POST `/change-password` `{ "currentPassword": "...", "newPassword": "newpass2026" }`  
**Expected:** `200`, can login with new password

**Edge:** Wrong current password → `400`

---

## Frontend cross-check

| UI flow | Maps to |
|---------|---------|
| Admin login page | AUTH-01 |
| Volunteer login | AUTH-02 |
| Register from website | AUTH-07 |
| Profile settings | AUTH-08 |
