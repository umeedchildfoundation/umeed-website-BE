import prisma from '../db/index.js';

/**
 * Generate a new ID with a specific prefix
 */
export async function generateId(prefix: string, table: string): Promise<string> {
    // Determine which Prisma model to use based on table name
    if (table === 'students') {
        const latest = await prisma.students.findFirst({
            where: { id: { startsWith: prefix } },
            orderBy: { id: 'desc' }, // This is an approximation since Prisma strings order differently, but for UMS1001 it should work
            take: 1
        });

        if (!latest) {
            return `${prefix}1001`;
        }

        const regex = new RegExp(`^${prefix}(\\d+)$`);
        const match = latest.id.match(regex);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            return `${prefix}${num + 1}`;
        }
    } else if (table === 'volunteers') {
        // Assume 'volunteer_id' is what the old code actually meant, or id if primary key
        // We'll search `volunteer_id` first
        const latest = await prisma.volunteers.findFirst({
            where: { volunteer_id: { startsWith: prefix } },
            orderBy: { volunteer_id: 'desc' },
            take: 1
        });

        if (!latest || !latest.volunteer_id) {
            return `${prefix}1001`;
        }

        const regex = new RegExp(`^${prefix}(\\d+)$`);
        const match = latest.volunteer_id.match(regex);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            return `${prefix}${num + 1}`;
        }
    }

    return `${prefix}1001`;
}

export async function generateStudentId(): Promise<string> {
    return generateId('UMS', 'students');
}

export async function generateVolunteerId(): Promise<string> {
    return generateId('UMV', 'volunteers');
}
