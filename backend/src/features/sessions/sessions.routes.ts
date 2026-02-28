import { Router } from 'express';
import { SessionsController } from './sessions.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { sessionValidators } from '../../validators/sessions.validator.js';

const router = Router();

router.get('/', requireAuth, SessionsController.getAllSessions);
router.get('/:id', requireAuth, SessionsController.getSessionById);
router.post('/', requireAuth, requireAdmin, validate(sessionValidators.create), SessionsController.createSession);
router.patch('/:id', requireAuth, requireAdmin, validate(sessionValidators.update), SessionsController.updateSession);
router.delete('/:id', requireAuth, requireAdmin, SessionsController.deleteSession);

export default router;
