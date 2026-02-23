/**
 * Express Application Configuration
 * 
 * Sets up middleware, routes, and error handling
 */

import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.config.js';

// Routes
import authRoutes from './routes/auth.routes.js';
import usersRoutes from './routes/users.routes.js';
import volunteersRoutes from './routes/volunteers.routes.js';
import studentsRoutes from './routes/students.routes.js';
import sessionsRoutes from './routes/sessions.routes.js';
import attendanceRoutes from './routes/attendance.routes.js';
import noticesRoutes from './routes/notices.routes.js';
import eventsRoutes from './routes/events.routes.js';
import mediaRoutes from './routes/media.routes.js';
import applicationsRoutes from './routes/applications.routes.js';
import contactRoutes from './routes/contact.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import contentRoutes from './routes/content.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ==================== MIDDLEWARE ====================

// CORS - Allow frontend to make requests
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',
    credentials: true
}));

// Parse JSON bodies
app.use(express.json());

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(uploadDir));

// Request logging in development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, _res, next) => {
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
        next();
    });
}

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
    customCss: '.swagger-ui .topbar { display: none }',
    customSiteTitle: 'UMEED API Documentation'
}));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/volunteers', volunteersRoutes);
app.use('/api/students', studentsRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/attendance', attendanceRoutes);
// Alias for frontend compatibility (dbService expects table names)
app.use('/api/student_attendance', attendanceRoutes);
app.use('/api/volunteer_attendance', attendanceRoutes);
app.use('/api/notices', noticesRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/media', mediaRoutes);
app.use('/api/volunteer_applications', applicationsRoutes);
app.use('/api/contact_messages', contactRoutes);
app.use('/api/app_settings', settingsRoutes);
app.use('/api/content', contentRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});

// Global error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    console.error('[Error]', err);

    // Multer errors
    if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
        return;
    }

    if (err.message?.includes('Invalid file type')) {
        res.status(400).json({ error: err.message });
        return;
    }

    res.status(500).json({ error: 'Internal server error' });
});

export default app;
