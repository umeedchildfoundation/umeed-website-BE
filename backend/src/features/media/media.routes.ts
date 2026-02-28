import { Router } from 'express';
import { MediaController } from './media.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { requireAdmin } from '../../middleware/role.middleware.js';
import multer from 'multer';
// removed unused imports

const router = Router();

// Configure multer to use memory storage
const storage = multer.memoryStorage();

// File filter
const fileFilter = (_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
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

router.get('/', requireAuth, MediaController.getAllMedia);
router.post('/upload', requireAuth, upload.single('file'), MediaController.uploadMedia);
router.delete('/:id', requireAuth, requireAdmin, MediaController.deleteMedia);

export default router;
