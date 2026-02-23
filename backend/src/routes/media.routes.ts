/**
 * Media Routes
 * 
 * File upload and media management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import multer from 'multer';
import { existsSync, mkdirSync } from 'fs';
import { extname, join } from 'path';
import { query, queryOne, run } from '../db/index.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

// Configure upload directory
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
if (!existsSync(UPLOAD_DIR)) {
    mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        const ext = extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only images and videos are allowed.'));
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

/**
 * GET /api/media
 * Get all media files
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
    try {
        const { eventId } = req.query;

        let sql = 'SELECT * FROM media';
        const params: any[] = [];

        if (eventId) {
            sql += ' WHERE event_id = ?';
            params.push(eventId);
        }

        sql += ' ORDER BY created_at DESC';

        const media = query(sql, params);
        res.json(media);
    } catch (error) {
        console.error('[Media] Get all error:', error);
        res.status(500).json({ error: 'Failed to get media' });
    }
});

/**
 * POST /api/media/upload
 * Upload a file
 */
router.post('/upload', requireAuth, upload.single('file'), (req: Request, res: Response) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No file uploaded' });
            return;
        }

        const { eventId, caption } = req.body;
        const id = uuidv4();
        const url = `/uploads/${req.file.filename}`;
        const type = req.file.mimetype.startsWith('video/') ? 'video' : 'image';

        run(
            `INSERT INTO media (id, event_id, url, type, caption, filename, mimetype, size, uploaded_by, created_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
            [id, eventId || null, url, type, caption || null, req.file.originalname, req.file.mimetype, req.file.size, req.user!.id]
        );

        // If this is for an event, also add to event_media
        if (eventId) {
            run(
                `INSERT INTO event_media (id, event_id, url, media_type, caption, created_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'))`,
                [uuidv4(), eventId, url, type, caption || null]
            );
        }

        const media = queryOne('SELECT * FROM media WHERE id = ?', [id]);
        res.status(201).json(media);
    } catch (error) {
        console.error('[Media] Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
});

/**
 * DELETE /api/media/:id
 * Delete media (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const existing = queryOne('SELECT id FROM media WHERE id = ?', [req.params.id]);

        if (!existing) {
            res.status(404).json({ error: 'Media not found' });
            return;
        }

        // Note: We're not deleting the actual file to avoid orphaned references
        // In production, you'd want to handle this properly
        run('DELETE FROM media WHERE id = ?', [req.params.id]);
        res.json({ message: 'Media deleted successfully' });
    } catch (error) {
        console.error('[Media] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete media' });
    }
});

export default router;
