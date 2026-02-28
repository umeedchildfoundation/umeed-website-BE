import { Router } from 'express';
import { AuthController } from './auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { authValidators } from '../../validators/auth.validator.js';

const router = Router();

router.post('/register', validate(authValidators.register), AuthController.register);
router.post('/login', validate(authValidators.login), AuthController.login);
router.get('/me', requireAuth, AuthController.getMe);
router.patch('/me', requireAuth, validate(authValidators.updateMe), AuthController.updateMe);
router.post('/change-password', requireAuth, validate(authValidators.changePassword), AuthController.changePassword);

export default router;
