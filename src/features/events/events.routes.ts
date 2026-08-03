import { Router } from 'express';
import { EventsController } from './events.controller.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { eventValidators } from '../../validators/events.validator.js';

const router = Router();

router.get('/', optionalAuth, EventsController.getAllEvents);
router.get('/:id', optionalAuth, EventsController.getEventById);
router.post('/', requireAuth, requireAdmin, validate(eventValidators.create), EventsController.createEvent);
router.patch('/:id', requireAuth, requireAdmin, validate(eventValidators.update), EventsController.updateEvent);
router.delete('/:id', requireAuth, requireAdmin, EventsController.deleteEvent);

export default router;
