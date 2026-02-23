/**
 * Users Routes
 * 
 * CRUD operations for user management
 * Restricted to admins
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin, requireSuperAdmin } from '../middleware/role.middleware.js';
import { hashPassword } from '../utils/password.js';

const router = Router();

/**
 * GET /api/users
 * Get all users (admin only)
 */
router.get('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const users = query(`
            SELECT id, email, full_name, role, avatar_url, created_at, updated_at 
            FROM users 
            ORDER BY created_at DESC
        `);

        res.json(users);
    } catch (error) {
        console.error('[Users] Get all error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
});

/**
 * GET /api/users/:id
 * Get user by ID
 */
router.get('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const user = queryOne(
            'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users WHERE id = ?',
            [req.params.id]
        );

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json(user);
    } catch (error) {
        console.error('[Users] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * PATCH /api/users/:id
 * Update user
 */
router.patch('/:id', requireAuth, requireAdmin, async (req: Request, res: Response) => {
    try {
        const { fullName, role, avatarUrl } = req.body;
        const targetId = req.params.id;

        // Check if target user exists
        const target = queryOne<{ role: string }>('SELECT role FROM users WHERE id = ?', [targetId]);
        if (!target) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Only super_admin can modify other admins or super_admins
        if ((target.role === 'admin' || target.role === 'super_admin') && req.user!.role !== 'super_admin') {
            res.status(403).json({ error: 'Cannot modify admin users' });
            return;
        }

        // Build update query
        const updates: string[] = [];
        const values: any[] = [];

        if (fullName !== undefined) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (role !== undefined && req.user!.role === 'super_admin') {
            updates.push('role = ?');
            values.push(role);
        }
        if (avatarUrl !== undefined) {
            updates.push('avatar_url = ?');
            values.push(avatarUrl);
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);

            run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne(
            'SELECT id, email, full_name, role, avatar_url, created_at, updated_at FROM users WHERE id = ?',
            [targetId]
        );

        res.json(updated);
    } catch (error) {
        console.error('[Users] Update error:', error);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

/**
 * DELETE /api/users/:id
 * Delete user (super_admin only)
 */
router.delete('/:id', requireAuth, requireSuperAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;

        // Prevent self-deletion
        if (targetId === req.user!.id) {
            res.status(400).json({ error: 'Cannot delete yourself' });
            return;
        }

        const target = queryOne('SELECT id FROM users WHERE id = ?', [targetId]);
        if (!target) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        run('DELETE FROM users WHERE id = ?', [targetId]);

        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('[Users] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

export default router;
