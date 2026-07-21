import { Router } from 'express';
import { SessionRsvpsController } from './session_rsvps.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sessionRsvpValidators } from '../../validators/session_rsvps.validator.js';

const router = Router();

router.get('/', requireAuth, SessionRsvpsController.getRsvps);
router.post('/', requireAuth, validate(sessionRsvpValidators.upsert), SessionRsvpsController.upsertRsvp);

export default router;
