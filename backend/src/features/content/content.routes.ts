import { Router } from 'express';
import { ContentController } from './content.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { contentValidators } from '../../validators/content.validator.js';

const router = Router();

router.get('/', ContentController.getAllContent);
router.get('/:section', ContentController.getContentBySection);
router.post('/', requireAuth, requireAdmin, validate(contentValidators.upsert), ContentController.upsertContent);
router.post('/bulk', requireAuth, requireAdmin, validate(contentValidators.bulkUpsert), ContentController.upsertBulkContent);
router.delete('/:section/:key', requireAuth, requireAdmin, ContentController.deleteContent);

export default router;
