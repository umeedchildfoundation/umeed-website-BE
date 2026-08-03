import { Router } from 'express';
import { VolunteersController } from './volunteers.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { volunteerValidators } from '../../validators/volunteers.validator.js';

const router = Router();

router.get('/', requireAuth, VolunteersController.getAllVolunteers);
router.get('/:id', requireAuth, VolunteersController.getVolunteerById);
router.post('/', requireAuth, requireAdmin, validate(volunteerValidators.create), VolunteersController.createVolunteer);
router.patch('/:id', requireAuth, requireAdmin, validate(volunteerValidators.update), VolunteersController.updateVolunteer);
router.delete('/:id', requireAuth, requireAdmin, VolunteersController.deleteVolunteer);

export default router;
