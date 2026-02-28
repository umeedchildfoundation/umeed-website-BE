import { Router } from 'express';
import { NoticesController } from './notices.controller.js';
import { requireAuth, optionalAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { noticeValidators } from '../../validators/notices.validator.js';

const router = Router();

router.get('/', optionalAuth, NoticesController.getAllNotices);
router.get('/:id', optionalAuth, NoticesController.getNoticeById);
router.post('/', requireAuth, requireAdmin, validate(noticeValidators.create), NoticesController.createNotice);
router.patch('/:id', requireAuth, requireAdmin, validate(noticeValidators.update), NoticesController.updateNotice);
router.delete('/:id', requireAuth, requireAdmin, NoticesController.deleteNotice);

export default router;
