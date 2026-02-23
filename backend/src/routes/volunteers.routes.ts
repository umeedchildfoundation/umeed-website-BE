/**
 * Volunteers Routes
 * 
 * CRUD operations for volunteer management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { generateVolunteerId } from '../utils/idGenerator.js';
import { requireAuth, optionalAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/volunteers
 * Get all volunteers
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
    try {
        const { status } = req.query;

        let sql = 'SELECT * FROM volunteers';
        const params: any[] = [];

        if (status) {
            sql += ' WHERE status = ?';
            params.push(status);
        }

        sql += ' ORDER BY created_at DESC';

        const volunteers = query(sql, params);
        res.json(volunteers);
    } catch (error) {
        console.error('[Volunteers] Get all error:', error);
        res.status(500).json({ error: 'Failed to get volunteers' });
    }
});

/**
 * GET /api/volunteers/:id
 * Get volunteer by ID
 */
router.get('/:id', requireAuth, (req: Request, res: Response) => {
    try {
        const volunteer = queryOne('SELECT * FROM volunteers WHERE id = ?', [req.params.id]);

        if (!volunteer) {
            res.status(404).json({ error: 'Volunteer not found' });
            return;
        }

        res.json(volunteer);
    } catch (error) {
        console.error('[Volunteers] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get volunteer' });
    }
});

/**
 * POST /api/volunteers
 * Create a new volunteer (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const {
            userId,
            volunteerId,
            name,
            email,
            phone,
            age,
            gender,
            address,
            occupation,
            skills,
            preferredLanguages,
            availability,
            status = 'pending'
        } = req.body;

        if (!name || !email) {
            res.status(400).json({ error: 'Name and email are required' });
            return;
        }

        const id = uuidv4();
        const volId = volunteerId || generateVolunteerId();

        run(
            `INSERT INTO volunteers (id, user_id, volunteer_id, name, email, phone, age, gender, address, occupation, skills, preferred_languages, availability, status, joined_at, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
            [id, userId || null, volId, name, email, phone || null, age || null, gender || null, address || null, occupation || null, skills || null, preferredLanguages || null, availability || null, status]
        );

        const volunteer = queryOne('SELECT * FROM volunteers WHERE id = ?', [id]);
        res.status(201).json(volunteer);
    } catch (error) {
        console.error('[Volunteers] Create error:', error);
        res.status(500).json({ error: 'Failed to create volunteer' });
    }
});

/**
 * PATCH /api/volunteers/:id
 * Update volunteer
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM volunteers WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Volunteer not found' });
            return;
        }

        const {
            name,
            email,
            phone,
            age,
            gender,
            address,
            occupation,
            skills,
            preferredLanguages,
            availability,
            status,
            profilePicture
        } = req.body;

        const updates: string[] = [];
        const values: any[] = [];

        if (name !== undefined) { updates.push('name = ?'); values.push(name); }
        if (email !== undefined) { updates.push('email = ?'); values.push(email); }
        if (phone !== undefined) { updates.push('phone = ?'); values.push(phone); }
        if (age !== undefined) { updates.push('age = ?'); values.push(age); }
        if (gender !== undefined) { updates.push('gender = ?'); values.push(gender); }
        if (address !== undefined) { updates.push('address = ?'); values.push(address); }
        if (occupation !== undefined) { updates.push('occupation = ?'); values.push(occupation); }
        if (skills !== undefined) { updates.push('skills = ?'); values.push(skills); }
        if (preferredLanguages !== undefined) { updates.push('preferred_languages = ?'); values.push(preferredLanguages); }
        if (availability !== undefined) { updates.push('availability = ?'); values.push(availability); }
        if (status !== undefined) { updates.push('status = ?'); values.push(status); }
        if (profilePicture !== undefined) { updates.push('profile_picture = ?'); values.push(profilePicture); }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);
            run(`UPDATE volunteers SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne('SELECT * FROM volunteers WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Volunteers] Update error:', error);
        res.status(500).json({ error: 'Failed to update volunteer' });
    }
});

/**
 * DELETE /api/volunteers/:id
 * Delete volunteer (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM volunteers WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Volunteer not found' });
            return;
        }

        run('DELETE FROM volunteers WHERE id = ?', [targetId]);
        res.json({ message: 'Volunteer deleted successfully' });
    } catch (error) {
        console.error('[Volunteers] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete volunteer' });
    }
});

export default router;
