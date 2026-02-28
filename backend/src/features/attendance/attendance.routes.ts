import { Router } from 'express';
import { AttendanceController } from './attendance.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { attendanceValidators } from '../../validators/attendance.validator.js';

const router = Router();

// Alias Handlers
router.get('/', requireAuth, AttendanceController.getAlias);
router.post('/', requireAuth, AttendanceController.postAlias);

// Student Attendance
router.get('/students/:sessionId', requireAuth, AttendanceController.getStudentAttendance);
router.post('/students', requireAuth, validate(attendanceValidators.markStudent), AttendanceController.markStudentAttendance);
router.post('/students/bulk', requireAuth, requireAdmin, validate(attendanceValidators.bulkMarkStudent), AttendanceController.markBulkStudentAttendance);

// Volunteer Attendance
router.get('/volunteers/:sessionId', requireAuth, AttendanceController.getVolunteerAttendance);
router.post('/volunteers', requireAuth, validate(attendanceValidators.markVolunteer), AttendanceController.markVolunteerAttendance);

// Session Assignments
router.get('/assignments/:sessionId', requireAuth, AttendanceController.getSessionAssignments);
router.post('/assignments', requireAuth, requireAdmin, validate(attendanceValidators.assignVolunteer), AttendanceController.createSessionAssignment);
router.delete('/assignments/:id', requireAuth, requireAdmin, AttendanceController.deleteSessionAssignment);

export default router;
