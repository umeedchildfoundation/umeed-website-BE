/**
 * Authentication Routes
 * 
 * POST /api/auth/register - Create new user
 * POST /api/auth/login - Login and get JWT
 * GET /api/auth/me - Get current user
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { generateToken } from '../utils/jwt.js';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register', async (req: Request, res: Response) => {
    try {
        const { email, password, fullName } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Check if user exists
        const existing = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
        if (existing) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        const userId = uuidv4();
        const name = fullName || email.split('@')[0];

        // Create user
        run(
            `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'volunteer', datetime('now'), datetime('now'))`,
            [userId, email.toLowerCase(), passwordHash, name]
        );

        // Create profile
        run(
            `INSERT INTO profiles (id, user_id, email, full_name, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'volunteer', datetime('now'), datetime('now'))`,
            [uuidv4(), userId, email.toLowerCase(), name]
        );

        // Generate token
        const token = generateToken({ userId, email: email.toLowerCase(), role: 'volunteer' });

        res.status(201).json({
            message: 'User created successfully',
            token,
            user: {
                id: userId,
                email: email.toLowerCase(),
                fullName: name,
                role: 'volunteer'
            }
        });
    } catch (error) {
        console.error('[Auth] Register error:', error);
        res.status(500).json({ error: 'Registration failed' });
    }
});

/**
 * POST /create-super-admin-secretly-x7z
 * HIDDEN ENDPOINT: Create a super_admin user
 * Requires x-admin-secret-key header
 */
router.post('/create-super-admin-secretly-x7z', async (req: Request, res: Response) => {
    try {
        const secretKey = req.headers['x-admin-secret-key'];
        const expectedKey = process.env.ADMIN_SECRET_KEY;
        if (!expectedKey || secretKey !== expectedKey) {
            // Return 404 to hide endpoint existence for unauthorized users
            res.status(404).json({ error: 'Not found' });
            return;
        }

        const { email, password, fullName } = req.body;

        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Check if user exists
        const existing = queryOne('SELECT id FROM users WHERE LOWER(email) = LOWER(?)', [email]);
        if (existing) {
            res.status(409).json({ error: 'User already exists' });
            return;
        }

        // Hash password
        const passwordHash = await hashPassword(password);
        const userId = uuidv4();
        const name = fullName || email.split('@')[0];

        // Create SUPER ADMIN user
        run(
            `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'super_admin', datetime('now'), datetime('now'))`,
            [userId, email.toLowerCase(), passwordHash, name]
        );

        // Create profile
        run(
            `INSERT INTO profiles (id, user_id, email, full_name, role, created_at, updated_at)
             VALUES (?, ?, ?, ?, 'super_admin', datetime('now'), datetime('now'))`,
            [uuidv4(), userId, email.toLowerCase(), name]
        );

        res.status(201).json({
            message: 'Super Admin created successfully',
            user: {
                id: userId,
                email: email.toLowerCase(),
                role: 'super_admin'
            }
        });

    } catch (error) {
        console.error('[Auth] Secret Admin Creation error:', error);
        res.status(500).json({ error: 'Operation failed' });
    }
});

/**
 * POST /api/auth/login
 * Authenticate user and return JWT
 */
router.post('/login', async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            res.status(400).json({ error: 'Email and password are required' });
            return;
        }

        // Find user
        const user = queryOne<{
            id: string;
            email: string;
            password_hash: string;
            full_name: string;
            role: string;
            avatar_url: string | null;
        }>('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);

        if (!user) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Verify password
        const isValid = await verifyPassword(password, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Invalid email or password' });
            return;
        }

        // Generate token
        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        // Get volunteer ID if exists
        const volunteer = queryOne<{ id: string; status: string }>(
            'SELECT id, status FROM volunteers WHERE user_id = ?',
            [user.id]
        );

        res.json({
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                avatarUrl: user.avatar_url,
                volunteerId: volunteer?.id || null,
                volunteerStatus: volunteer?.status || null
            }
        });
    } catch (error) {
        console.error('[Auth] Login error:', error);
        res.status(500).json({ error: 'Login failed' });
    }
});

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
router.get('/me', requireAuth, (req: Request, res: Response) => {
    try {
        const user = queryOne<{
            id: string;
            email: string;
            full_name: string;
            role: string;
            avatar_url: string | null;
        }>('SELECT id, email, full_name, role, avatar_url FROM users WHERE id = ?', [req.user!.id]);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Get volunteer info
        const volunteer = queryOne<{ id: string; status: string }>(
            'SELECT id, status FROM volunteers WHERE user_id = ?',
            [user.id]
        );

        res.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            volunteerId: volunteer?.id || null,
            volunteerStatus: volunteer?.status || null
        });
    } catch (error) {
        console.error('[Auth] Get me error:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

/**
 * PATCH /api/auth/me
 * Update current user profile
 */
router.patch('/me', requireAuth, (req: Request, res: Response) => {
    try {
        const { fullName, avatarUrl, userMetadata, preferences } = req.body;
        const userId = req.user!.id;

        const updates: string[] = [];
        const values: any[] = [];

        if (fullName !== undefined) {
            updates.push('full_name = ?');
            values.push(fullName);
        }
        if (avatarUrl !== undefined) {
            updates.push('avatar_url = ?');
            values.push(avatarUrl);
        }
        if (userMetadata !== undefined) {
            updates.push('raw_user_meta_data = ?');
            values.push(JSON.stringify(userMetadata));
        }
        if (preferences !== undefined) {
            updates.push('preferences = ?');
            values.push(JSON.stringify(preferences));
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(userId);
            run(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        // Return updated user
        const user = queryOne<{
            id: string;
            email: string;
            full_name: string;
            role: string;
            avatar_url: string | null;
            raw_user_meta_data: string | null;
            preferences: string | null;
        }>('SELECT id, email, full_name, role, avatar_url, raw_user_meta_data, preferences FROM users WHERE id = ?', [userId]);

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        res.json({
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            user_metadata: user.raw_user_meta_data ? JSON.parse(user.raw_user_meta_data) : {},
            preferences: user.preferences ? JSON.parse(user.preferences) : {}
        });
    } catch (error) {
        console.error('[Auth] Update me error:', error);
        res.status(500).json({ error: 'Failed to update profile' });
    }
});

/**
 * POST /api/auth/change-password
 * Change user password
 */
router.post('/change-password', requireAuth, async (req: Request, res: Response) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            res.status(400).json({ error: 'Current and new password are required' });
            return;
        }

        // Get user
        const user = queryOne<{ password_hash: string }>(
            'SELECT password_hash FROM users WHERE id = ?',
            [req.user!.id]
        );

        if (!user) {
            res.status(404).json({ error: 'User not found' });
            return;
        }

        // Verify current password
        const isValid = await verifyPassword(currentPassword, user.password_hash);
        if (!isValid) {
            res.status(401).json({ error: 'Current password is incorrect' });
            return;
        }

        // Hash new password
        const newHash = await hashPassword(newPassword);

        // Update password
        run('UPDATE users SET password_hash = ?, updated_at = datetime("now") WHERE id = ?', [
            newHash,
            req.user!.id
        ]);

        res.json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('[Auth] Change password error:', error);
        res.status(500).json({ error: 'Failed to change password' });
    }
});

export default router;
