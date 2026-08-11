# 05 — Sessions, RSVP, Attendance, Assignments

## Sessions — `/api/sessions`

### SES-01 · List sessions

**Pre:** Auth token  
**Expected:** Upcoming + completed seed sessions

### SES-02 · Admin creates session

**Steps:** POST with title, date, status `scheduled`  
**Expected:** `201`

### SES-03 · Cancel session

**Steps:** PATCH `{ "status": "cancelled" }`  
**Expected:** `200`

---

## RSVPs — `/api/session_rsvps`

### RSVP-01 · Volunteer RSVPs yes

**Pre:** Volunteer token, upcoming session `...0041`  
**Steps:** POST `{ "session_id": "...", "status": "yes" }`  
**Expected:** Upsert success

### RSVP-02 · Change RSVP to no

**Steps:** POST same session `{ "status": "no" }`  
**Expected:** Updated

### RSVP-03 · Invalid response (edge)

**Steps:** POST `{ "status": "invalid" }`  
**Expected:** `400`

---

## Attendance — `/api/attendance`

### ATT-01 · Student attendance for session

**Steps:** GET `/students/{sessionId}`  
**Expected:** Seed completed session shows present for SEED-001

### ATT-02 · Mark student present

**Pre:** Auth token  
**Steps:** POST `/students` with session_id, student_id, status `present`  
**Expected:** `201` or update

### ATT-03 · Bulk mark (admin)

**Pre:** Admin token  
**Steps:** POST `/students/bulk`  
**Expected:** Multiple rows updated

### ATT-04 · Volunteer attendance

**Steps:** GET `/volunteers/{sessionId}`, POST `/volunteers`  
**Expected:** Same pattern as student

---

## Assignments — `/api/attendance/assignments`

### ASG-01 · List assignments for session

**Steps:** GET `/assignments/{upcomingSessionId}`  
**Expected:** Volunteer UMV1003 assigned to SEED-001

### ASG-02 · Admin creates assignment

**Steps:** POST `/assignments` session + volunteer + student  
**Expected:** `201`

### ASG-03 · Delete assignment

**Pre:** Admin  
**Steps:** DELETE `/assignments/{id}`  
**Expected:** `200`

---

## Frontend cross-check

- Session calendar / list
- Attendance marking UI for a session
- Volunteer RSVP toggle
