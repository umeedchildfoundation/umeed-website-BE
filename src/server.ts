import chalk from 'chalk';
/**
 * Server Entry Point
 * 
 * Initializes database and starts the Express server
 */

import 'dotenv/config';
import app from './app.js';
import { initializeDatabase, closeDb } from './db/index.js';

const PORT = process.env.PORT || 3001;

async function main() {
    try {
        // Initialize database
        console.log(chalk.green('[Server] Initializing database...'));
        await initializeDatabase();
        console.log(chalk.green('[Server] Database ready'));

        // Start server
        const server = app.listen(PORT, () => {
            console.log(chalk.green(`[Server] ✅ Running at http://localhost:${PORT}`));
            console.log(chalk.green(`[Server] API docs: http://localhost:${PORT}/api-docs`));
            console.log(chalk.green(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`));
            console.log(chalk.green('[Server] Press Ctrl+C to stop'));
        });

        server.on('error', (error: NodeJS.ErrnoException) => {
            if (error.code === 'EADDRINUSE') {
                console.error(chalk.red(`[Server] Port ${PORT} is already in use. Stop the other process or change PORT in .env`));
                process.exit(1);
            }
            throw error;
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log(chalk.green('\n[Server] Shutting down...'));
            closeDb();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log(chalk.green('\n[Server] Shutting down...'));
            closeDb();
            process.exit(0);
        });

    } catch (error) {
        console.error(chalk.red('[Server] Failed to start:'),  error);
        process.exit(1);
    }
}

main();
