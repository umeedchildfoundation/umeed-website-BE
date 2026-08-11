# 02 — Volunteer Applications

Base URL: `http://localhost:3001/api/volunteer_applications`

## APP-01 · Public submit application (frontend form)

**Steps:**
1. From website volunteer form, submit name + email + required fields
2. Or POST `/` (no auth):

```json
{
  "full_name": "Manual Test Applicant",
  "email": "manual.test@example.com",
  "phone": "9999999999",
  "motivation": "Testing flow",
  "skills_subjects": ["Science"],
  "preferred_languages": ["English"]
}
```

**Expected:** `201`, `status: pending`

---

## APP-02 · Admin sees pending applications

**Pre:** Admin token  
**Steps:** GET `/?status=pending`  
**Expected:** List includes seed applicant `applicant.pending@seed.umeed.local` (after seed)

---

## APP-03 · Approve application

**Pre:** Admin token, seed run  
**Steps:**
1. PATCH `/{id}` `{ "status": "approved" }`  
   Use ID: `00000000-0000-4000-8000-000000000051`
2. Verify frontend triggers Apps Script email to applicant

**Expected:**
- `200`, status `approved`, `reviewed_by` set, `reviewed_at` set
- Email delivery tested on **frontend** (Apps Script), not API response

**Frontend:** After successful PATCH, FE should call Apps Script with applicant email + status

---

## APP-04 · Reject application

**Steps:** Submit new application, PATCH `{ "status": "rejected" }`  
**Expected:** Status updated; FE sends rejection email via Apps Script if configured

---

## APP-05 · Invalid status `reviewed`

**Steps:** PATCH with `{ "status": "reviewed" }`  
**Expected:** `400` validation error (removed — not a valid DB enum)

---

## APP-06 · Approve already rejected (edge)

**Pre:** Seed rejected app `00000000-0000-4000-8000-000000000052`  
**Steps:** PATCH to `approved`  
**Expected:** `200` — allowed by API (business rule: confirm if UI should block)

---

## APP-07 · Non-admin cannot list

**Pre:** Volunteer token  
**Steps:** GET `/`  
**Expected:** `403`

---

## APP-08 · Delete application

**Pre:** Admin token  
**Steps:** DELETE `/{id}` on a test application  
**Expected:** `200`, row removed

---

## APP-09 · Re-seed does not duplicate fixtures

**Steps:**
1. `npm run seed`
2. Count pending seed applications (should be exactly 1 with fixed email)
3. `npm run seed` again
4. Count again

**Expected:** Still 1 — not 2

---

## Known gaps (document for product)

- Approving an application does **not** auto-create a user/volunteer account
- Applicant must register separately or admin creates volunteer manually
