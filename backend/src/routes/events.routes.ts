/**
 * Events Routes
 * 
 * CRUD operations for events
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/events
 * Get all events (public)
 */
router.get('/', optionalAuth, (req: Request, res: Response) => {
    try {
        const events = query('SELECT * FROM events ORDER BY date DESC');
        res.json(events);
    } catch (error) {
        console.error('[Events] Get all error:', error);
        res.status(500).json({ error: 'Failed to get events' });
    }
});

/**
 * GET /api/events/:id
 * Get event by ID with media
 */
router.get('/:id', optionalAuth, (req: Request, res: Response) => {
    try {
        const event = queryOne('SELECT * FROM events WHERE id = ?', [req.params.id]);

        if (!event) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        // Get associated media
        const media = query('SELECT * FROM event_media WHERE event_id = ?', [req.params.id]);

        res.json({ ...event, media });
    } catch (error) {
        console.error('[Events] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get event' });
    }
});

/**
 * POST /api/events
 * Create a new event (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const {
            title,
            description,
            date,
            eventDate,
            location,
            tags
        } = req.body;

        if (!title || !date) {
            res.status(400).json({ error: 'Title and date are required' });
            return;
        }

        const id = uuidv4();

        run(
            `INSERT INTO events (id, title, description, date, event_date, location, tags, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [id, title, description || null, date, eventDate || date, location || null, tags ? JSON.stringify(tags) : null]
        );

        const event = queryOne('SELECT * FROM events WHERE id = ?', [id]);
        res.status(201).json(event);
    } catch (error) {
        console.error('[Events] Create error:', error);
        res.status(500).json({ error: 'Failed to create event' });
    }
});

/**
 * PATCH /api/events/:id
 * Update event
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM events WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        const fields: Record<string, string> = {
            title: 'title',
            description: 'description',
            date: 'date',
            eventDate: 'event_date',
            location: 'location'
        };

        const updates: string[] = [];
        const values: any[] = [];

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (req.body[jsField] !== undefined) {
                updates.push(`${dbField} = ?`);
                values.push(req.body[jsField]);
            }
        }

        if (req.body.tags !== undefined) {
            updates.push('tags = ?');
            values.push(JSON.stringify(req.body.tags));
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);
            run(`UPDATE events SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne('SELECT * FROM events WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Events] Update error:', error);
        res.status(500).json({ error: 'Failed to update event' });
    }
});

/**
 * DELETE /api/events/:id
 * Delete event (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM events WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Event not found' });
            return;
        }

        run('DELETE FROM events WHERE id = ?', [targetId]);
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        console.error('[Events] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete event' });
    }
});

export default router;
