
import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, 'db', 'data', 'umeed.db');

const db = new Database(dbPath);

function migrate() {
    try {
        console.log('Checking users table for preferences column...');
        const columns = db.pragma('table_info(users)') as any[];
        const hasPreferences = columns.some(col => col.name === 'preferences');

        if (!hasPreferences) {
            console.log('Adding preferences column to users table...');
            db.prepare('ALTER TABLE users ADD COLUMN preferences TEXT').run();
            console.log('Successfully added preferences column.');
        } else {
            console.log('preferences column already exists.');
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        db.close();
    }
}

migrate();
