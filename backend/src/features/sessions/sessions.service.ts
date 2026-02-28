import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

export class SessionsService {
    static async getAllSessions(filters: { date?: string; status?: string }) {
        const where: any = {};
        if (filters.date) {
            where.OR = [
                { date: String(filters.date) },
                { session_date: String(filters.date) }
            ];
        }
        if (filters.status) {
            where.status = String(filters.status);
        }

        return await prisma.sessions.findMany({
            where,
            orderBy: [{ date: 'desc' }, { start_time: 'asc' }]
        });
    }

    static async getSessionById(id: string) {
        const session = await prisma.sessions.findUnique({
            where: { id }
        });

        if (!session) {
            throw new Error('Session not found');
        }

        const assignments = await prisma.session_assignments.findMany({
            where: { session_id: id },
            include: {
                volunteer: { select: { name: true } },
                student: { select: { full_name: true } }
            }
        });

        // Map the flattened structure needed by the client codebase
        const mappedAssignments = assignments.map(a => ({
            ...a,
            volunteer_name: a.volunteer?.name,
            student_name: a.student?.full_name
        }));

        return { ...session, assignments: mappedAssignments };
    }

    static async createSession(dataParams: any, userId: string) {
        const {
            title, date, sessionDate, startTime, endTime,
            location, notes, status, rsvpEnabled
        } = dataParams;

        if (!date) {
            throw new Error('Date is required');
        }

        return await prisma.sessions.create({
            data: {
                id: uuidv4(),
                title: title || null,
                date,
                session_date: sessionDate || date,
                start_time: startTime || null,
                end_time: endTime || null,
                location: location || null,
                notes: notes || null,
                status: status || 'scheduled',
                rsvp_enabled: rsvpEnabled ? 1 : 0,
                created_by: userId
            }
        });
    }

    static async updateSession(id: string, dataParams: any) {
        const existing = await prisma.sessions.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Session not found');
        }

        const fields: Record<string, string> = {
            title: 'title',
            date: 'date',
            sessionDate: 'session_date',
            startTime: 'start_time',
            endTime: 'end_time',
            location: 'location',
            notes: 'notes',
            status: 'status'
        };

        const data: any = {};

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (dataParams[jsField] !== undefined) {
                data[dbField] = dataParams[jsField];
            }
        }

        if (dataParams.rsvpEnabled !== undefined) {
            data.rsvp_enabled = dataParams.rsvpEnabled ? 1 : 0;
        }

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        return await prisma.sessions.update({
            where: { id },
            data
        });
    }

    static async deleteSession(id: string) {
        const existing = await prisma.sessions.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Session not found');
        }

        await prisma.sessions.delete({
            where: { id }
        });

        return true;
    }
}
