import { Router } from 'express';
import { UsersController } from './users.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../../middleware/role.middleware.js';

const router = Router();

router.get('/', requireAuth, requireAdmin, UsersController.getAllUsers);
router.get('/:id', requireAuth, requireAdmin, UsersController.getUserById);
router.patch('/:id', requireAuth, requireAdmin, UsersController.updateUser);
router.delete('/:id', requireAuth, requireSuperAdmin, UsersController.deleteUser);

export default router;
