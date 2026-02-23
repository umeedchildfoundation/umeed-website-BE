/**
 * Volunteer Applications Routes
 * 
 * CRUD operations for volunteer applications
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/volunteer_applications
 * Get all applications (Admin only)
 */
router.get('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const { status } = req.query;
        let sql = 'SELECT * FROM volunteer_applications';
        const params: any[] = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const applications = query(sql, params);
        res.json(applications);
    } catch (error) {
        console.error('[Applications] Get all error:', error);
        res.status(500).json({ error: 'Failed to get applications' });
    }
});

/**
 * GET /api/volunteer_applications/:id
 * Get application by ID (Admin only)
 */
router.get('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const application = queryOne('SELECT * FROM volunteer_applications WHERE id = ?', [req.params.id]);
        if (!application) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }
        res.json(application);
    } catch (error) {
        console.error('[Applications] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get application' });
    }
});

/**
 * POST /api/volunteer_applications
 * Submit a new application (Public)
 */
router.post('/', (req: Request, res: Response) => {
    try {
        const {
            full_name,
            email,
            phone,
            age,
            gender,
            address,
            occupation,
            availability,
            motivation,
            skills_subjects,
            preferred_languages,
            status = 'pending'
        } = req.body;

        if (!full_name || !email) {
            res.status(400).json({ error: 'Name and email are required' });
            return;
        }

        const id = uuidv4();

        // Handle arrays if they come as arrays (stringify them) or strings
        const skills = Array.isArray(skills_subjects) ? JSON.stringify(skills_subjects) : skills_subjects;
        const languages = Array.isArray(preferred_languages) ? JSON.stringify(preferred_languages) : preferred_languages;

        run(
            `INSERT INTO volunteer_applications (
                id, full_name, email, phone, age, gender, address, occupation, 
                availability, motivation, skills_subjects, preferred_languages, status, 
                created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                id,
                full_name,
                email,
                phone || null,
                age || null,
                gender || null,
                address || null,
                occupation || null,
                availability || null,
                motivation || null,
                skills || null,
                languages || null,
                status
            ]
        );

        const application = queryOne('SELECT * FROM volunteer_applications WHERE id = ?', [id]);
        res.status(201).json(application);
    } catch (error) {
        console.error('[Applications] Create error:', error);
        res.status(500).json({ error: 'Failed to create application' });
    }
});

/**
 * PATCH /api/volunteer_applications/:id
 * Update application status (Admin only)
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM volunteer_applications WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Application not found' });
            return;
        }

        const { status } = req.body;

        if (status) {
            run('UPDATE volunteer_applications SET status = ?, updated_at = datetime("now") WHERE id = ?', [status, targetId]);
        }

        const updated = queryOne('SELECT * FROM volunteer_applications WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Applications] Update error:', error);
        res.status(500).json({ error: 'Failed to update application' });
    }
});

/**
 * DELETE /api/volunteer_applications/:id
 * Delete application (Admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        run('DELETE FROM volunteer_applications WHERE id = ?', [targetId]);
        res.json({ message: 'Application deleted successfully' });
    } catch (error) {
        console.error('[Applications] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete application' });
    }
});

export default router;
