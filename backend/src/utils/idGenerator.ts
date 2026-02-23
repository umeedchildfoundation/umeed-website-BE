
import { queryOne } from '../db/index.js';

/**
 * Generate a new Student ID in the format UMxxxx (e.g., UM1001)
 */
/**
 * Generate a new ID with a specific prefix
 */
export function generateId(prefix: string, table: string): string {
    // Find the latest ID that matches the prefix pattern
    const latest = queryOne<{ id: string }>(
        `SELECT id FROM ${table} WHERE id LIKE '${prefix}%' ORDER BY length(id) DESC, id DESC LIMIT 1`
    );

    if (!latest) {
        return `${prefix}1001`;
    }

    // Extract number part
    const regex = new RegExp(`^${prefix}(\\d+)$`);
    const match = latest.id.match(regex);
    if (match && match[1]) {
        const num = parseInt(match[1], 10);
        return `${prefix}${num + 1}`;
    }

    return `${prefix}1001`;
}

export function generateStudentId(): string {
    return generateId('UMS', 'students');
}

export function generateVolunteerId(): string {
    return generateId('UMV', 'volunteers');
}
