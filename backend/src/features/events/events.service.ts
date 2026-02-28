import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

export class EventsService {
    static async getAllEvents() {
        return await prisma.events.findMany({
            orderBy: { date: 'desc' }
        });
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
        return { ...eventData, media: event_media };
    }

    static async createEvent(dataParams: any) {
        const {
            title,
            description,
            date,
            eventDate,
            location,
            tags
        } = dataParams;

        if (!title || !date) {
            throw new Error('Title and date are required');
        }

        return await prisma.events.create({
            data: {
                id: uuidv4(),
                title,
                description: description || null,
                date,
                event_date: eventDate || date,
                location: location || null,
                tags: tags ? JSON.stringify(tags) : null
            }
        });
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
            data.tags = JSON.stringify(dataParams.tags);
        }

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        return await prisma.events.update({
            where: { id },
            data
        });
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
