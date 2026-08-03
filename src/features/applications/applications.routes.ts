import { Router } from 'express';
import { ApplicationsController } from './applications.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { applicationValidators } from '../../validators/applications.validator.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, ApplicationsController.getAllApplications);
router.get('/:id', requireAuth, requireAdmin, ApplicationsController.getApplicationById);
router.post('/', validate(applicationValidators.submit), ApplicationsController.submitApplication);
router.patch('/:id', requireAuth, requireAdmin, validate(applicationValidators.updateStatus), ApplicationsController.updateApplicationStatus);
router.delete('/:id', requireAuth, requireAdmin, ApplicationsController.deleteApplication);

export default router;
