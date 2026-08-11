# 04 — Students

Base URL: `http://localhost:3001/api/students`

## STU-01 · List students (authenticated)

**Pre:** Volunteer token  
**Expected:** Seed students `SEED-001` (active), `SEED-002` (inactive)

## STU-02 · Get student by ID

**ID:** `00000000-0000-4000-8000-000000000031`  
**Expected:** `200`, full_name `Seed Student Active`

## STU-03 · Admin creates student

**Pre:** Admin token  
**Steps:** POST with full_name, roll_number, class_grade  
**Expected:** `201`

## STU-04 · Admin updates student to inactive

**Steps:** PATCH active student `{ "status": "inactive" }`  
**Expected:** `200`

## STU-05 · Volunteer cannot create

**Pre:** Volunteer token, POST  
**Expected:** `403`

## STU-06 · Delete student with assignments (edge)

**Pre:** Student linked in session assignment  
**Steps:** DELETE student  
**Expected:** Cascade or error — verify DB behavior matches product expectation

## Frontend cross-check

- Student list page shows active/inactive filter
- Admin add/edit student forms map to STU-03/STU-04
