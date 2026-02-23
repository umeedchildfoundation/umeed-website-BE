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
        console.log('[Server] Initializing database...');
        await initializeDatabase();
        console.log('[Server] Database ready');

        // Start server
        app.listen(PORT, () => {
            console.log(`[Server] ✅ Running at http://localhost:${PORT}`);
            console.log(`[Server] Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log('[Server] Press Ctrl+C to stop');
        });

        // Graceful shutdown
        process.on('SIGINT', () => {
            console.log('\n[Server] Shutting down...');
            closeDb();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n[Server] Shutting down...');
            closeDb();
            process.exit(0);
        });

    } catch (error) {
        console.error('[Server] Failed to start:', error);
        process.exit(1);
    }
}

main();
