/**
 * Contact Messages Routes
 * 
 * CRUD operations for contact messages
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/contact_messages
 * Get all messages (Admin only)
 */
router.get('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const messages = query('SELECT * FROM contact_messages ORDER BY created_at DESC');
        res.json(messages);
    } catch (error) {
        console.error('[Contact] Get all error:', error);
        res.status(500).json({ error: 'Failed to get messages' });
    }
});

/**
 * POST /api/contact_messages
 * Submit a new message (Public)
 */
router.post('/', (req: Request, res: Response) => {
    try {
        const { name, email, message } = req.body;

        if (!name || !email || !message) {
            res.status(400).json({ error: 'All fields are required' });
            return;
        }

        const id = uuidv4();

        run(
            `INSERT INTO contact_messages (id, name, email, message, is_read, created_at)
             VALUES (?, ?, ?, ?, 0, datetime('now'))`,
            [id, name, email, message]
        );

        const newMessage = queryOne('SELECT * FROM contact_messages WHERE id = ?', [id]);
        res.status(201).json(newMessage);
    } catch (error) {
        console.error('[Contact] Create error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

/**
 * PATCH /api/contact_messages/:id
 * Mark as read/unread (Admin only)
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { is_read } = req.body;
        const targetId = req.params.id;

        if (is_read !== undefined) {
            run('UPDATE contact_messages SET is_read = ? WHERE id = ?', [is_read ? 1 : 0, targetId]);
        }

        const updated = queryOne('SELECT * FROM contact_messages WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Contact] Update error:', error);
        res.status(500).json({ error: 'Failed to update message' });
    }
});

/**
 * DELETE /api/contact_messages/:id
 * Delete message (Admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        run('DELETE FROM contact_messages WHERE id = ?', [req.params.id]);
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        console.error('[Contact] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete message' });
    }
});

export default router;
