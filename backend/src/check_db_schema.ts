
import { initializeDatabase, getDb } from './db/index.js';

async function checkSchema() {
    try {
        await initializeDatabase();
        const db = getDb();

        console.log('Checking users table columns...');
        const result = db.exec("PRAGMA table_info(users)");

        if (result.length > 0) {
            const columns = result[0].values;
            console.log('Columns found:', columns.map((c: any) => c[1])); // Name is at index 1

            const hasPreferences = columns.some((c: any) => c[1] === 'preferences');
            console.log('Has preferences column:', hasPreferences);
        } else {
            console.log('Could not get table info for users');
        }

    } catch (error) {
        console.error('Check failed:', error);
    }
}

checkSchema();
