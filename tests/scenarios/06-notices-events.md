# 06 — Notices & Events

## Notices — `/api/notices`

### NOT-01 · Public notice without login

**Steps:** GET `/` without token  
**Expected:** Includes `Seed Public Notice`, excludes internal-only

### NOT-02 · Internal notice with auth

**Pre:** Logged-in user  
**Expected:** Both public + internal visible

### NOT-03 · Admin creates notice

**Steps:** POST with visibility `public` or `internal`  
**Expected:** `201`

### NOT-04 · Update / delete notice

**Pre:** Admin  
**Expected:** `200`

---

## Events — `/api/events`

### EVT-01 · List events (public)

**Steps:** GET `/`  
**Expected:** `Seed Annual Day` present after seed

### EVT-02 · Get event detail

**ID:** `00000000-0000-4000-8000-000000000071`  
**Expected:** tags, location populated

### EVT-03 · Admin CRUD

**Steps:** POST, PATCH, DELETE  
**Expected:** Standard admin-only access

---

## Frontend cross-check

- Home/notices page (public vs logged-in)
- Events gallery / detail page
- Admin notice editor
