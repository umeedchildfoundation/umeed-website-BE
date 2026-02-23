/**
 * Attendance Routes
 * 
 * Manage student and volunteer attendance
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run, transaction } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Compatibility Middleware for Aliased Routes
// Compatibility Handlers for Aliased Routes (/api/student_attendance, /api/volunteer_attendance)

/**
 * GET /
 * Handle list/get for aliases
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
    // Student Attendance Alias
    if (req.baseUrl.endsWith('student_attendance')) {
        if (req.query.session_id) {
            // Forward to existing logic logic (manually call query)
            // Or just rewrite URL and call handle? No, explicit is better.
            const attendance = query(
                `SELECT sa.*, s.full_name as student_name, s.class_grade
                 FROM student_attendance sa
                 LEFT JOIN students s ON sa.student_id = s.id
                 WHERE sa.session_id = ?
                 ORDER BY s.full_name`,
                [req.query.session_id]
            );
            res.json(attendance);
        } else {
            // List all (fallback)
            const attendance = query(
                `SELECT sa.*, s.full_name as student_name, s.class_grade
                 FROM student_attendance sa
                 LEFT JOIN students s ON sa.student_id = s.id
                 ORDER BY sa.marked_at DESC LIMIT 100`
            );
            res.json(attendance);
        }
    }
    // Volunteer Attendance Alias
    else if (req.baseUrl.endsWith('volunteer_attendance')) {
        if (req.query.session_id) {
            const attendance = query(
                `SELECT va.*, v.name as volunteer_name
                 FROM volunteer_attendance va
                 LEFT JOIN volunteers v ON va.volunteer_id = v.id
                 WHERE va.session_id = ?
                 ORDER BY v.name`,
                [req.query.session_id]
            );
            res.json(attendance);
        } else {
            const attendance = query(
                `SELECT va.*, v.name as volunteer_name
                 FROM volunteer_attendance va
                 LEFT JOIN volunteers v ON va.volunteer_id = v.id
                 ORDER BY va.marked_at DESC LIMIT 100`
            );
            res.json(attendance);
        }
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

/**
 * POST /
 * Handle create for aliases
 */
router.post('/', requireAuth, (req: Request, res: Response) => {
    if (req.baseUrl.endsWith('student_attendance')) {
        // Delegate to student attendance logic
        // We can just call the handler if we extracted it, but for now duplicate logic or internal redirect.
        // Duplicating logic is safer than internal redirect hack.
        try {
            const { sessionId, studentId, status, remark } = req.body;
            if (!sessionId || !studentId || !status) {
                res.status(400).json({ error: 'Session ID, student ID, and status are required' });
                return;
            }
            const existing = queryOne('SELECT id FROM student_attendance WHERE session_id = ? AND student_id = ?', [sessionId, studentId]);
            if (existing) {
                run('UPDATE student_attendance SET status = ?, remark = ?, marked_at = datetime(\'now\'), marked_by = ? WHERE session_id = ? AND student_id = ?', [status, remark || null, req.user!.id, sessionId, studentId]);
            } else {
                run('INSERT INTO student_attendance (id, session_id, student_id, status, remark, marked_at, marked_by) VALUES (?, ?, ?, ?, ?, datetime(\'now\'), ?)', [uuidv4(), sessionId, studentId, status, remark || null, req.user!.id]);
            }
            res.json({ message: 'Attendance marked successfully' });
        } catch (error) {
            console.error('[Attendance] Mark student attendance error:', error);
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    } else if (req.baseUrl.endsWith('volunteer_attendance')) {
        try {
            const { sessionId, volunteerId, status, remark } = req.body;
            if (!sessionId || !volunteerId || !status) {
                res.status(400).json({ error: 'Session ID, volunteer ID, and status are required' });
                return;
            }
            const existing = queryOne('SELECT id FROM volunteer_attendance WHERE session_id = ? AND volunteer_id = ?', [sessionId, volunteerId]);
            if (existing) {
                run('UPDATE volunteer_attendance SET status = ?, remark = ?, marked_at = datetime(\'now\'), marked_by = ? WHERE session_id = ? AND volunteer_id = ?', [status, remark || null, req.user!.id, sessionId, volunteerId]);
            } else {
                run('INSERT INTO volunteer_attendance (id, session_id, volunteer_id, status, remark, marked_at, marked_by) VALUES (?, ?, ?, ?, ?, datetime(\'now\'), ?)', [uuidv4(), sessionId, volunteerId, status, remark || null, req.user!.id]);
            }
            res.json({ message: 'Attendance marked successfully' });
        } catch (error) {
            console.error('[Attendance] Mark volunteer attendance error:', error);
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

// ==================== STUDENT ATTENDANCE ====================

/**
 * GET /api/attendance/students/:sessionId
 * Get student attendance for a session
 */
router.get('/students/:sessionId', requireAuth, (req: Request, res: Response) => {
    try {
        const attendance = query(
            `SELECT sa.*, s.full_name as student_name, s.class_grade
             FROM student_attendance sa
             LEFT JOIN students s ON sa.student_id = s.id
             WHERE sa.session_id = ?
             ORDER BY s.full_name`,
            [req.params.sessionId]
        );

        res.json(attendance);
    } catch (error) {
        console.error('[Attendance] Get student attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance' });
    }
});

/**
 * POST /api/attendance/students
 * Mark student attendance
 */
router.post('/students', requireAuth, (req: Request, res: Response) => {
    try {
        const { sessionId, studentId, status, remark } = req.body;

        if (!sessionId || !studentId || !status) {
            res.status(400).json({ error: 'Session ID, student ID, and status are required' });
            return;
        }

        // Check if already exists
        const existing = queryOne(
            'SELECT id FROM student_attendance WHERE session_id = ? AND student_id = ?',
            [sessionId, studentId]
        );

        if (existing) {
            // Update existing
            run(
                `UPDATE student_attendance SET status = ?, remark = ?, marked_at = datetime('now'), marked_by = ? WHERE session_id = ? AND student_id = ?`,
                [status, remark || null, req.user!.id, sessionId, studentId]
            );
        } else {
            // Insert new
            run(
                `INSERT INTO student_attendance (id, session_id, student_id, status, remark, marked_at, marked_by)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
                [uuidv4(), sessionId, studentId, status, remark || null, req.user!.id]
            );
        }

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('[Attendance] Mark student attendance error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

/**
 * POST /api/attendance/students/bulk
 * Mark attendance for multiple students
 */
router.post('/students/bulk', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { sessionId, attendanceRecords } = req.body;

        if (!sessionId || !Array.isArray(attendanceRecords)) {
            res.status(400).json({ error: 'Session ID and attendance records are required' });
            return;
        }

        transaction(() => {
            for (const record of attendanceRecords) {
                const { studentId, status, remark } = record;

                const existing = queryOne(
                    'SELECT id FROM student_attendance WHERE session_id = ? AND student_id = ?',
                    [sessionId, studentId]
                );

                if (existing) {
                    run(
                        `UPDATE student_attendance SET status = ?, remark = ?, marked_at = datetime('now'), marked_by = ? WHERE session_id = ? AND student_id = ?`,
                        [status, remark || null, req.user!.id, sessionId, studentId]
                    );
                } else {
                    run(
                        `INSERT INTO student_attendance (id, session_id, student_id, status, remark, marked_at, marked_by)
                         VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
                        [uuidv4(), sessionId, studentId, status, remark || null, req.user!.id]
                    );
                }
            }
        });

        res.json({ message: 'Bulk attendance marked successfully' });
    } catch (error) {
        console.error('[Attendance] Bulk student attendance error:', error);
        res.status(500).json({ error: 'Failed to mark bulk attendance' });
    }
});

// ==================== VOLUNTEER ATTENDANCE ====================

/**
 * GET /api/attendance/volunteers/:sessionId
 * Get volunteer attendance for a session
 */
router.get('/volunteers/:sessionId', requireAuth, (req: Request, res: Response) => {
    try {
        const attendance = query(
            `SELECT va.*, v.name as volunteer_name
             FROM volunteer_attendance va
             LEFT JOIN volunteers v ON va.volunteer_id = v.id
             WHERE va.session_id = ?
             ORDER BY v.name`,
            [req.params.sessionId]
        );

        res.json(attendance);
    } catch (error) {
        console.error('[Attendance] Get volunteer attendance error:', error);
        res.status(500).json({ error: 'Failed to get attendance' });
    }
});

/**
 * POST /api/attendance/volunteers
 * Mark volunteer attendance
 */
router.post('/volunteers', requireAuth, (req: Request, res: Response) => {
    try {
        const { sessionId, volunteerId, status, remark } = req.body;

        if (!sessionId || !volunteerId || !status) {
            res.status(400).json({ error: 'Session ID, volunteer ID, and status are required' });
            return;
        }

        // Check if already exists
        const existing = queryOne(
            'SELECT id FROM volunteer_attendance WHERE session_id = ? AND volunteer_id = ?',
            [sessionId, volunteerId]
        );

        if (existing) {
            run(
                `UPDATE volunteer_attendance SET status = ?, remark = ?, marked_at = datetime('now'), marked_by = ? WHERE session_id = ? AND volunteer_id = ?`,
                [status, remark || null, req.user!.id, sessionId, volunteerId]
            );
        } else {
            run(
                `INSERT INTO volunteer_attendance (id, session_id, volunteer_id, status, remark, marked_at, marked_by)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), ?)`,
                [uuidv4(), sessionId, volunteerId, status, remark || null, req.user!.id]
            );
        }

        res.json({ message: 'Attendance marked successfully' });
    } catch (error) {
        console.error('[Attendance] Mark volunteer attendance error:', error);
        res.status(500).json({ error: 'Failed to mark attendance' });
    }
});

// ==================== SESSION ASSIGNMENTS ====================

/**
 * GET /api/attendance/assignments/:sessionId
 * Get volunteer-student assignments for a session
 */
router.get('/assignments/:sessionId', requireAuth, (req: Request, res: Response) => {
    try {
        const assignments = query(
            `SELECT sa.*, v.name as volunteer_name, s.full_name as student_name
             FROM session_assignments sa
             LEFT JOIN volunteers v ON sa.volunteer_id = v.id
             LEFT JOIN students s ON sa.student_id = s.id
             WHERE sa.session_id = ?`,
            [req.params.sessionId]
        );

        res.json(assignments);
    } catch (error) {
        console.error('[Attendance] Get assignments error:', error);
        res.status(500).json({ error: 'Failed to get assignments' });
    }
});

/**
 * POST /api/attendance/assignments
 * Create a volunteer-student assignment
 */
router.post('/assignments', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { sessionId, volunteerId, studentId } = req.body;

        if (!sessionId || !volunteerId || !studentId) {
            res.status(400).json({ error: 'Session ID, volunteer ID, and student ID are required' });
            return;
        }

        // Check if already exists
        const existing = queryOne(
            'SELECT id FROM session_assignments WHERE session_id = ? AND volunteer_id = ? AND student_id = ?',
            [sessionId, volunteerId, studentId]
        );

        if (existing) {
            res.status(409).json({ error: 'Assignment already exists' });
            return;
        }

        const id = uuidv4();
        run(
            `INSERT INTO session_assignments (id, session_id, volunteer_id, student_id, created_at)
             VALUES (?, ?, ?, ?, datetime('now'))`,
            [id, sessionId, volunteerId, studentId]
        );

        const assignment = queryOne('SELECT * FROM session_assignments WHERE id = ?', [id]);
        res.status(201).json(assignment);
    } catch (error) {
        console.error('[Attendance] Create assignment error:', error);
        res.status(500).json({ error: 'Failed to create assignment' });
    }
});

/**
 * DELETE /api/attendance/assignments/:id
 * Delete an assignment
 */
router.delete('/assignments/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const existing = queryOne('SELECT id FROM session_assignments WHERE id = ?', [req.params.id]);

        if (!existing) {
            res.status(404).json({ error: 'Assignment not found' });
            return;
        }

        run('DELETE FROM session_assignments WHERE id = ?', [req.params.id]);
        res.json({ message: 'Assignment deleted successfully' });
    } catch (error) {
        console.error('[Attendance] Delete assignment error:', error);
        res.status(500).json({ error: 'Failed to delete assignment' });
    }
});

export default router;
