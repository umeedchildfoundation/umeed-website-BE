import { Router } from 'express';
import { ContactController } from './contact.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { contactValidators } from '../../validators/contact.validator.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, ContactController.getAllMessages);
router.post('/', validate(contactValidators.submit), ContactController.submitMessage);
router.patch('/:id', requireAuth, requireAdmin, validate(contactValidators.updateStatus), ContactController.updateMessageReadStatus);
router.delete('/:id', requireAuth, requireAdmin, ContactController.deleteMessage);

export default router;
