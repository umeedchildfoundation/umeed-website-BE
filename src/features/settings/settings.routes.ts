import { Router } from 'express';
import { SettingsController } from './settings.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { settingsValidators } from '../../validators/settings.validator.js';

const router = Router();

router.get('/', SettingsController.getAllSettings);
router.post('/', requireAuth, requireAdmin, validate(settingsValidators.upsert), SettingsController.upsertSetting);
router.delete('/:key', requireAuth, requireAdmin, SettingsController.deleteSetting);

export default router;
