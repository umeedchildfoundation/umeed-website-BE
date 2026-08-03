import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

function parseTags(val: any): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') {
        try {
            const parsed = JSON.parse(val);
            return Array.isArray(parsed) ? parsed : [];
        } catch {
            return [];
        }
    }
    return [];
}

function formatEvent(e: any) {
    if (!e) return e;
    return { ...e, tags: parseTags(e.tags) };
}

export class EventsService {
    static async getAllEvents() {
        const rows = await prisma.events.findMany({
            orderBy: { date: 'desc' }
        });
        return rows.map(formatEvent);
    }

    static async getEventById(id: string) {
        const event = await prisma.events.findUnique({
            where: { id },
            include: { event_media: true }
        });

        if (!event) {
            throw new Error('Event not found');
        }

        // Remap 'event_media' to 'media' for backwards compatibility
        const { event_media, ...eventData } = event as any;
        return { ...formatEvent(eventData), media: event_media };
    }

    static async createEvent(dataParams: any) {
        const {
            title,
            description,
            date,
            event_date,
            eventDate,
            location,
            tags
        } = dataParams;

        const resolvedEventDate = event_date ?? eventDate;
        const resolvedDate = date ?? resolvedEventDate;

        if (!title || !resolvedDate) {
            throw new Error('Title and date are required');
        }

        const created = await prisma.events.create({
            data: {
                id: uuidv4(),
                title,
                description: description || null,
                date: resolvedDate,
                event_date: resolvedEventDate || resolvedDate,
                location: location || null,
                tags: tags ? JSON.stringify(tags) : null
            }
        });
        return formatEvent(created);
    }

    static async updateEvent(id: string, dataParams: any) {
        const existing = await prisma.events.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Event not found');
        }

        const fields: Record<string, string> = {
            title: 'title',
            description: 'description',
            date: 'date',
            event_date: 'event_date',
            eventDate: 'event_date',
            location: 'location'
        };

        const data: any = {};

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (dataParams[jsField] !== undefined) {
                data[dbField] = dataParams[jsField];
            }
        }

        if (dataParams.tags !== undefined) {
            data.tags = dataParams.tags ? JSON.stringify(dataParams.tags) : null;
        }

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        const updated = await prisma.events.update({
            where: { id },
            data
        });
        return formatEvent(updated);
    }

    static async deleteEvent(id: string) {
        const existing = await prisma.events.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Event not found');
        }

        await prisma.events.delete({
            where: { id }
        });

        return true;
    }
}
