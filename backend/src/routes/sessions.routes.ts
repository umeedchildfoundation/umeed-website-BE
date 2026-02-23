/**
 * Sessions Routes
 * 
 * CRUD operations for session management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/sessions
 * Get all sessions
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
    try {
        const { date, status } = req.query;

        let sql = 'SELECT * FROM sessions WHERE 1=1';
        const params: any[] = [];

        if (date) {
            sql += ' AND (date = ? OR session_date = ?)';
            params.push(date, date);
        }
        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }

        sql += ' ORDER BY date DESC, start_time ASC';

        const sessions = query(sql, params);
        res.json(sessions);
    } catch (error) {
        console.error('[Sessions] Get all error:', error);
        res.status(500).json({ error: 'Failed to get sessions' });
    }
});

/**
 * GET /api/sessions/:id
 * Get session by ID with assignments
 */
router.get('/:id', requireAuth, (req: Request, res: Response) => {
    try {
        const session = queryOne('SELECT * FROM sessions WHERE id = ?', [req.params.id]);

        if (!session) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        // Get assignments
        const assignments = query(
            `SELECT sa.*, v.name as volunteer_name, s.full_name as student_name
             FROM session_assignments sa
             LEFT JOIN volunteers v ON sa.volunteer_id = v.id
             LEFT JOIN students s ON sa.student_id = s.id
             WHERE sa.session_id = ?`,
            [req.params.id]
        );

        res.json({ ...session, assignments });
    } catch (error) {
        console.error('[Sessions] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get session' });
    }
});

/**
 * POST /api/sessions
 * Create a new session (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const {
            title,
            date,
            sessionDate,
            startTime,
            endTime,
            location,
            notes,
            status,
            rsvpEnabled
        } = req.body;

        if (!date) {
            res.status(400).json({ error: 'Date is required' });
            return;
        }

        const id = uuidv4();

        run(
            `INSERT INTO sessions (id, title, date, session_date, start_time, end_time, location, notes, status, rsvp_enabled, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [id, title || null, date, sessionDate || date, startTime || null, endTime || null, location || null, notes || null, status || 'scheduled', rsvpEnabled ? 1 : 0, req.user!.id]
        );

        const session = queryOne('SELECT * FROM sessions WHERE id = ?', [id]);
        res.status(201).json(session);
    } catch (error) {
        console.error('[Sessions] Create error:', error);
        res.status(500).json({ error: 'Failed to create session' });
    }
});

/**
 * PATCH /api/sessions/:id
 * Update session
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM sessions WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        const fields: Record<string, string> = {
            title: 'title',
            date: 'date',
            sessionDate: 'session_date',
            startTime: 'start_time',
            endTime: 'end_time',
            location: 'location',
            notes: 'notes',
            status: 'status'
        };

        const updates: string[] = [];
        const values: any[] = [];

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (req.body[jsField] !== undefined) {
                updates.push(`${dbField} = ?`);
                values.push(req.body[jsField]);
            }
        }

        if (req.body.rsvpEnabled !== undefined) {
            updates.push('rsvp_enabled = ?');
            values.push(req.body.rsvpEnabled ? 1 : 0);
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);
            run(`UPDATE sessions SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne('SELECT * FROM sessions WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Sessions] Update error:', error);
        res.status(500).json({ error: 'Failed to update session' });
    }
});

/**
 * DELETE /api/sessions/:id
 * Delete session (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM sessions WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }

        run('DELETE FROM sessions WHERE id = ?', [targetId]);
        res.json({ message: 'Session deleted successfully' });
    } catch (error) {
        console.error('[Sessions] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete session' });
    }
});

export default router;
