import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

export class SessionRsvpsService {
    static async getRsvpsForSession(sessionId: string) {
        const rows = await prisma.session_rsvps.findMany({
            where: { session_id: sessionId },
            include: {
                volunteer: {
                    select: { name: true, profile_picture: true, volunteer_id: true }
                }
            },
            orderBy: { created_at: 'desc' }
        });

        return rows.map((r) => ({
            id: r.id,
            session_id: r.session_id,
            volunteer_id: r.volunteer_id,
            status: r.response,
            created_at: r.created_at,
            volunteers: r.volunteer
        }));
    }

    static async getVolunteerRsvp(sessionId: string, volunteerId: string) {
        const row = await prisma.session_rsvps.findFirst({
            where: { session_id: sessionId, volunteer_id: volunteerId }
        });
        return row ? row.response : null;
    }

    static async upsertRsvp(dataParams: any, requestingUser: { id: string; role: string }) {
        const { session_id, volunteer_id, status, response } = dataParams;
        const resolvedStatus = status ?? response;

        if (!session_id || !volunteer_id || !resolvedStatus) {
            throw new Error('session_id, volunteer_id and status are required');
        }

        const isAdmin = requestingUser.role === 'admin' || requestingUser.role === 'super_admin';
        if (!isAdmin) {
            const volunteer = await prisma.volunteers.findUnique({ where: { id: volunteer_id } });
            if (!volunteer || volunteer.user_id !== requestingUser.id) {
                throw new Error('You can only RSVP for your own volunteer profile');
            }
        }

        const existing = await prisma.session_rsvps.findFirst({
            where: { session_id, volunteer_id }
        });

        const saved = existing
            ? await prisma.session_rsvps.update({
                where: { id: existing.id },
                data: { response: resolvedStatus }
            })
            : await prisma.session_rsvps.create({
                data: {
                    id: uuidv4(),
                    session_id,
                    volunteer_id,
                    response: resolvedStatus
                }
            });

        return { ...saved, status: saved.response };
    }
}
