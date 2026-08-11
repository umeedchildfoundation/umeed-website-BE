# 08 — Media Uploads (S3)

Base URL: `http://localhost:3001/api/media`

**Requires valid AWS credentials in `.env`**. Skip if using placeholder keys.

## MED-01 · List media

**Pre:** Auth token  
**Steps:** GET `/`  
**Expected:** `200`, array (may be empty)

## MED-02 · Upload image

**Pre:** Auth token  
**Steps:** POST `/upload` multipart form, file field, image < 10MB  
**Expected:** `201`, URL returned, row in DB

## MED-03 · File too large (edge)

**Steps:** Upload > 10MB  
**Expected:** `400` LIMIT_FILE_SIZE

## MED-04 · Invalid file type (edge)

**Steps:** Upload `.exe` or unsupported type  
**Expected:** `400`

## MED-05 · Admin delete media

**Pre:** Admin token  
**Steps:** DELETE `/{id}`  
**Expected:** `200`, S3 object removed (verify in bucket)

## MED-06 · Link media to event

**Pre:** Event exists  
**Steps:** Upload with event_id or attach via events flow  
**Expected:** Media associated in list

---

## Without AWS (dev workaround)

- Test MED-01, MED-03, MED-04 only (validation paths)
- Document that MED-02/MED-05 need real S3
