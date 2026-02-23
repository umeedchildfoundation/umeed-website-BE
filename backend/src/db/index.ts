/**
 * Database Connection Module (sql.js for Node.js)
 * 
 * Server-side SQLite database using sql.js (pure JavaScript)
 * Data is persisted to a file on disk.
 */

import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Database path from environment or default
const DB_PATH = process.env.DB_PATH || './data/umeed.db';

let db: SqlJsDatabase | null = null;

/**
 * Initialize the database
 */
export async function initializeDatabase(): Promise<SqlJsDatabase> {
    const SQL = await initSqlJs();

    // Ensure data directory exists
    const dataDir = dirname(DB_PATH);
    if (!existsSync(dataDir)) {
        mkdirSync(dataDir, { recursive: true });
    }

    // Try to load existing database
    if (existsSync(DB_PATH)) {
        try {
            const fileBuffer = readFileSync(DB_PATH);
            db = new SQL.Database(fileBuffer);
            console.log('[DB] Loaded existing database from:', DB_PATH);
        } catch (error) {
            console.error('[DB] Failed to load database, creating new:', error);
            db = new SQL.Database();
        }
    } else {
        db = new SQL.Database();
        console.log('[DB] Created new database');
    }

    // Initialize schema
    const schemaPath = join(__dirname, 'schema.sql');
    const schema = readFileSync(schemaPath, 'utf-8');
    db.run(schema);
    console.log('[DB] Schema initialized');

    // Check/migrate columns
    try {
        const columns = db.exec("PRAGMA table_info(users)")[0].values;
        // sql.js exec returns [{columns, values: [...]}]
        // values is array of arrays [cid, name, type, notnull, dflt_value, pk]

        const columnNames = columns.map((col: any) => col[1]); // name is at index 1

        if (!columnNames.includes('preferences')) {
            console.log('Migrating: Adding preferences column to users table...');
            db.run('ALTER TABLE users ADD COLUMN preferences TEXT');
        }

        if (!columnNames.includes('raw_user_meta_data')) {
            console.log('Migrating: Adding raw_user_meta_data column to users table...');
            db.run('ALTER TABLE users ADD COLUMN raw_user_meta_data TEXT');
        }
    } catch (error) {
        console.error('Migration error:', error);
    }

    // Save initial state
    saveDatabase();

    return db;
}

/**
 * Save database to file
 */
export function saveDatabase(): void {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        writeFileSync(DB_PATH, buffer);
        console.log('[DB] Database saved to:', DB_PATH);
    } catch (error) {
        console.error('[DB] Failed to save database:', error);
    }
}

/**
 * Get the database instance
 */
export function getDb(): SqlJsDatabase {
    if (!db) {
        throw new Error('Database not initialized. Call initializeDatabase() first.');
    }
    return db;
}

/**
 * Close the database connection
 */
export function closeDb(): void {
    if (db) {
        saveDatabase();
        db.close();
        db = null;
        console.log('[DB] Connection closed');
    }
}

/**
 * Run a query with parameters and return all results
 */
export function query<T = any>(sql: string, params: any[] = []): T[] {
    const database = getDb();
    const stmt = database.prepare(sql);
    stmt.bind(params);

    const results: T[] = [];
    while (stmt.step()) {
        const row = stmt.getAsObject() as T;
        results.push(row);
    }
    stmt.free();
    return results;
}

/**
 * Run a query and return the first result
 */
export function queryOne<T = any>(sql: string, params: any[] = []): T | undefined {
    const results = query<T>(sql, params);
    return results[0];
}

/**
 * Run an insert/update/delete statement
 */
export function run(sql: string, params: any[] = []): void {
    const database = getDb();
    database.run(sql, params);
    saveDatabase();
}

/**
 * Run multiple statements in a transaction
 */
export function transaction<T>(fn: () => T): T {
    const database = getDb();
    database.run('BEGIN TRANSACTION');
    try {
        const result = fn();
        database.run('COMMIT');
        saveDatabase();
        return result;
    } catch (error) {
        database.run('ROLLBACK');
        throw error;
    }
}

export default { initializeDatabase, getDb, closeDb, query, queryOne, run, transaction, saveDatabase };
