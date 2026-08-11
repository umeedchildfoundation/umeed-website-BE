# 07 — Contact, Content, Settings

## Contact — `/api/contact_messages`

### CON-01 · Public submit contact form

**Steps:** POST `/` `{ "name", "email", "message" }`  
**Expected:** `201`, `is_read: 0`

### CON-02 · Admin lists messages

**Pre:** Admin token  
**Expected:** Unread + read seed messages

### CON-03 · Mark as read

**Steps:** PATCH `/{unreadId}` `{ "is_read": 1 }`  
**Expected:** `200`

### CON-04 · Delete message

**Pre:** Admin  
**Expected:** `200`

---

## Site content — `/api/content`

### CNT-01 · Public get all content

**Steps:** GET `/`  
**Expected:** home.hero_title from seed

### CNT-02 · Get section

**Steps:** GET `/home`  
**Expected:** hero_title, hero_subtitle

### CNT-03 · Admin upsert content

**Steps:** POST `/` or POST `/bulk`  
**Expected:** `200`/`201`

### CNT-04 · Delete content key

**Steps:** DELETE `/{section}/{key}`  
**Expected:** `200`

---

## App settings — `/api/app_settings`

### SET-01 · Public read settings

**Steps:** GET `/`  
**Expected:** `site_name` present

### SET-02 · Admin upsert setting

**Steps:** POST `{ "key": "...", "value": "..." }`  
**Expected:** Upsert success

### SET-03 · Admin delete setting

**Expected:** `200`

---

## Frontend cross-check

- Contact us form → CON-01
- CMS / editable homepage text → CNT-02/CNT-03
- Footer site name → SET-01
