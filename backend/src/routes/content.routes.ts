/**
 * Content Routes
 * 
 * CRUD operations for site content (CMS)
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/content
 * Get all content organized by section
 */
router.get('/', (req: Request, res: Response) => {
    try {
        const result = query('SELECT section, key, value FROM site_content ORDER BY section, key');
        const content: Record<string, Record<string, string | null>> = {};

        result.forEach((row: any) => {
            const section = row.section;
            const key = row.key;
            const value = row.value;

            if (!content[section]) {
                content[section] = {};
            }
            content[section][key] = value;
        });

        res.json(content);
    } catch (error) {
        console.error('[Content] Get all error:', error);
        res.status(500).json({ error: 'Failed to get content' });
    }
});

/**
 * GET /api/content/:section
 * Get content for a specific section
 */
router.get('/:section', (req: Request, res: Response) => {
    try {
        const { section } = req.params;
        const result = query('SELECT key, value FROM site_content WHERE section = ?', [section]);

        const content: Record<string, string | null> = {};
        result.forEach((row: any) => {
            content[row.key] = row.value;
        });

        res.json(content);
    } catch (error) {
        console.error('[Content] Get section error:', error);
        res.status(500).json({ error: 'Failed to get section content' });
    }
});

/**
 * POST /api/content
 * Upsert content item (Admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { section, key, value, type = 'text' } = req.body;

        if (!section || !key) {
            res.status(400).json({ error: 'Section and key are required' });
            return;
        }

        const existing = queryOne('SELECT id FROM site_content WHERE section = ? AND key = ?', [section, key]);

        if (existing) {
            run('UPDATE site_content SET value = ?, type = ?, updated_at = datetime("now") WHERE section = ? AND key = ?', [
                value, type, section, key
            ]);
        } else {
            const id = uuidv4();
            run('INSERT INTO site_content (id, section, key, value, type, updated_at) VALUES (?, ?, ?, ?, ?, datetime("now"))', [
                id, section, key, value, type
            ]);
        }

        res.json({ message: 'Content saved successfully' });
    } catch (error) {
        console.error('[Content] Save error:', error);
        res.status(500).json({ error: 'Failed to save content' });
    }
});

/**
 * POST /api/content/bulk
 * Upsert multiple content items (Admin only)
 */
router.post('/bulk', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { items } = req.body; // Array of { section, key, value, type }

        if (!Array.isArray(items)) {
            res.status(400).json({ error: 'Items must be an array' });
            return;
        }

        run('BEGIN TRANSACTION');
        try {
            for (const item of items) {
                const { section, key, value, type = 'text' } = item;
                if (!section || !key) continue;

                // Check existence manually or use INSERT OR REPLACE if unique constraint exists
                // Schema has UNIQUE(section, key)
                run(`INSERT OR REPLACE INTO site_content (id, section, key, value, type, updated_at) 
                     VALUES (
                        COALESCE((SELECT id FROM site_content WHERE section = ? AND key = ?), ?),
                        ?, ?, ?, ?, datetime('now')
                     )`,
                    [section, key, uuidv4(), section, key, value, type]);
            }
            run('COMMIT');
            res.json({ message: 'Content saved successfully' });
        } catch (e) {
            run('ROLLBACK');
            throw e;
        }

    } catch (error) {
        console.error('[Content] Bulk save error:', error);
        res.status(500).json({ error: 'Failed to save bulk content' });
    }
});

/**
 * DELETE /api/content/:section/:key
 * Delete content item (Admin only)
 */
router.delete('/:section/:key', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { section, key } = req.params;
        run('DELETE FROM site_content WHERE section = ? AND key = ?', [section, key]);
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('[Content] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

export default router;
