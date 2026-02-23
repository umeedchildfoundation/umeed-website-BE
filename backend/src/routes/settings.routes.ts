/**
 * App Settings Routes
 * 
 * CRUD operations for app settings and site content
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/app_settings
 * Get all settings
 */
router.get('/', (req: Request, res: Response) => {
    try {
        const settings = query('SELECT * FROM app_settings');
        // Convert array to object key-value pair for frontend convenience if needed, 
        // but typically standard is returning list of objects.
        res.json(settings);
    } catch (error) {
        console.error('[Settings] Get all error:', error);
        res.status(500).json({ error: 'Failed to get settings' });
    }
});

/**
 * POST /api/app_settings
 * Create or Update setting (Admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { key, value } = req.body;

        if (!key) {
            res.status(400).json({ error: 'Key is required' });
            return;
        }

        const existing = queryOne('SELECT id FROM app_settings WHERE key = ?', [key]);

        if (existing) {
            run('UPDATE app_settings SET value = ?, updated_at = datetime("now") WHERE key = ?', [value, key]);
        } else {
            const id = uuidv4();
            run('INSERT INTO app_settings (id, key, value, created_at, updated_at) VALUES (?, ?, ?, datetime("now"), datetime("now"))', [id, key, value]);
        }

        const updated = queryOne('SELECT * FROM app_settings WHERE key = ?', [key]);
        res.json(updated);
    } catch (error) {
        console.error('[Settings] Upsert error:', error);
        res.status(500).json({ error: 'Failed to save setting' });
    }
});

/**
 * DELETE /api/app_settings/:key
 * Delete setting (Admin only)
 */
router.delete('/:key', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        run('DELETE FROM app_settings WHERE key = ?', [req.params.key]);
        res.json({ message: 'Setting deleted successfully' });
    } catch (error) {
        console.error('[Settings] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete setting' });
    }
});

export default router;
