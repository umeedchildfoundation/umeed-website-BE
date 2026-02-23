/**
 * Notices Routes
 * 
 * CRUD operations for notices/announcements
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/notices
 * Get all notices (public ones for unauthenticated, all for authenticated)
 */
router.get('/', optionalAuth, (req: Request, res: Response) => {
    try {
        let sql = 'SELECT * FROM notices';
        const params: any[] = [];

        // If not authenticated, only show public notices
        if (!req.user) {
            sql += ' WHERE visibility = ?';
            params.push('public');
        }

        sql += ' ORDER BY created_at DESC';

        const notices = query(sql, params);
        res.json(notices);
    } catch (error) {
        console.error('[Notices] Get all error:', error);
        res.status(500).json({ error: 'Failed to get notices' });
    }
});

/**
 * GET /api/notices/:id
 * Get notice by ID
 */
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
    try {
        const notice = queryOne('SELECT * FROM notices WHERE id = ?', [req.params.id]);

        if (!notice) {
            res.status(404).json({ error: 'Notice not found' });
            return;
        }

        // Check visibility
        if ((notice as any).visibility === 'internal' && !req.user) {
            res.status(403).json({ error: 'Access denied' });
            return;
        }

        res.json(notice);
    } catch (error) {
        console.error('[Notices] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get notice' });
    }
});

/**
 * POST /api/notices
 * Create a new notice (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            date,
            attachmentUrl,
            visibility = 'public'
        } = req.body;

        if (!title) {
            res.status(400).json({ error: 'Title is required' });
            return;
        }

        const id = uuidv4();

        run(
            `INSERT INTO notices (id, title, description, date, published_date, attachment_url, visibility, created_by, created_at, updated_at)
             VALUES (?, ?, ?, ?, datetime('now'), ?, ?, ?, datetime('now'), datetime('now'))`,
            [id, title, description || null, date || null, attachmentUrl || null, visibility, req.user!.id]
        );

        const notice = queryOne('SELECT * FROM notices WHERE id = ?', [id]);
        res.status(201).json(notice);
    } catch (error) {
        console.error('[Notices] Create error:', error);
        res.status(500).json({ error: 'Failed to create notice' });
    }
});

/**
 * PATCH /api/notices/:id
 * Update notice
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM notices WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Notice not found' });
            return;
        }

        const fields: Record<string, string> = {
            title: 'title',
            description: 'description',
            date: 'date',
            attachmentUrl: 'attachment_url',
            visibility: 'visibility'
        };

        const updates: string[] = [];
        const values: any[] = [];

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (req.body[jsField] !== undefined) {
                updates.push(`${dbField} = ?`);
                values.push(req.body[jsField]);
            }
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);
            run(`UPDATE notices SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne('SELECT * FROM notices WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Notices] Update error:', error);
        res.status(500).json({ error: 'Failed to update notice' });
    }
});

/**
 * DELETE /api/notices/:id
 * Delete notice (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM notices WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Notice not found' });
            return;
        }

        run('DELETE FROM notices WHERE id = ?', [targetId]);
        res.json({ message: 'Notice deleted successfully' });
    } catch (error) {
        console.error('[Notices] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete notice' });
    }
});

export default router;
