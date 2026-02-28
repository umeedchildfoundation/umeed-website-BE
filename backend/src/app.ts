/**
 * Express Application Configuration
 * 
 * Sets up middleware, routes, and error handling
 */

import express from 'express';
import cors from 'cors';
import { join, dirname } from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import morgan, { StreamOptions } from 'morgan';
import chalk from 'chalk';
import { swaggerSpec } from './config/swagger.config.js';

// Routes
import authRoutes from './features/auth/auth.routes.js';
import usersRoutes from './features/users/users.routes.js';
import volunteersRoutes from './features/volunteers/volunteers.routes.js';
import studentsRoutes from './features/students/students.routes.js';
import sessionsRoutes from './features/sessions/sessions.routes.js';
import attendanceRoutes from './features/attendance/attendance.routes.js';
import noticesRoutes from './features/notices/notices.routes.js';
import eventsRoutes from './features/events/events.routes.js';
import mediaRoutes from './features/media/media.routes.js';
import applicationsRoutes from './features/applications/applications.routes.js';
import contactRoutes from './features/contact/contact.routes.js';
import settingsRoutes from './features/settings/settings.routes.js';
import contentRoutes from './features/content/content.routes.js';

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


// Logging setup
const logDir = join(__dirname, '..', 'logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logFilePath = join(logDir, 'dev.log');
console.log(chalk.yellow(`✅ Log file path: ${logFilePath} ✅`));

const logStream = fs.createWriteStream(logFilePath, {
  flags: 'a',
});

const stream: StreamOptions = {
  write: (message) => logStream.write(message),
};

const customMorganFormat = morgan((tokens, req, res) => {
  const status = Number(tokens.status(req, res));
  const statusColor =
    status >= 500
      ? chalk.red(status)
      : status >= 400
        ? chalk.yellow(status)
        : status >= 300
          ? chalk.cyan(status)
          : chalk.green(status);

  return [
    chalk.magenta.bold(tokens.method(req, res)),
    statusColor,
    chalk.blue(tokens.url(req, res)),
    chalk.white(`${tokens["response-time"](req, res)} ms`),
    chalk.gray(`- ${tokens["user-agent"](req, res)}`),
  ].join(" ");
});

if (process.env.NODE_ENV !== 'production') {
    app.use(customMorganFormat);
}
app.use(morgan("combined", { stream }));

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
    console.error(chalk.red('[Error]'),  err);

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
