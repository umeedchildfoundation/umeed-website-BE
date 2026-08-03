import { Router } from 'express';
import { StudentsController } from './students.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { studentValidators } from '../../validators/students.validator.js';

const router = Router();

router.get('/', requireAuth, StudentsController.getAllStudents);
router.get('/:id', requireAuth, StudentsController.getStudentById);
router.post('/', requireAuth, requireAdmin, validate(studentValidators.create), StudentsController.createStudent);
router.patch('/:id', requireAuth, requireAdmin, validate(studentValidators.update), StudentsController.updateStudent);
router.delete('/:id', requireAuth, requireAdmin, StudentsController.deleteStudent);

export default router;
