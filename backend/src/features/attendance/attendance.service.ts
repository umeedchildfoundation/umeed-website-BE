import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';
import { AttendanceStatus } from '@prisma/client';

export class AttendanceService {
    // ================= ALIAS HANDLERS =================
    static async getStudentAttendanceAlias(filters: { sessionId?: string; studentId?: string } = {}) {
        const where: any = {};
        if (filters.sessionId) where.session_id = String(filters.sessionId);
        if (filters.studentId) where.student_id = String(filters.studentId);

        const hasFilter = Object.keys(where).length > 0;

        return await prisma.student_attendance.findMany({
            where,
            include: { student: { select: { full_name: true, class_grade: true } } },
            orderBy: hasFilter ? { student: { full_name: 'asc' } } : { marked_at: 'desc' },
            ...(hasFilter ? {} : { take: 100 })
        });
    }

    static async getVolunteerAttendanceAlias(filters: { sessionId?: string; volunteerId?: string } = {}) {
        const where: any = {};
        if (filters.sessionId) where.session_id = String(filters.sessionId);
        if (filters.volunteerId) where.volunteer_id = String(filters.volunteerId);

        const hasFilter = Object.keys(where).length > 0;

        return await prisma.volunteer_attendance.findMany({
            where,
            include: { volunteer: { select: { name: true } } },
            orderBy: hasFilter ? { volunteer: { name: 'asc' } } : { marked_at: 'desc' },
            ...(hasFilter ? {} : { take: 100 })
        });
    }

    // ================= STUDENT ATTENDANCE =================
    static async getStudentAttendance(sessionId: string) {
        return await prisma.student_attendance.findMany({
            where: { session_id: sessionId },
            include: { student: { select: { full_name: true, class_grade: true } } },
            orderBy: { student: { full_name: 'asc' } }
        });
    }

    static async markStudentAttendance(data: { sessionId: string; studentId: string; status: string; remark?: string; }, userId: string) {
        if (!data.sessionId || !data.studentId || !data.status) {
            throw new Error('Session ID, student ID, and status are required');
        }

        const existing = await prisma.student_attendance.findFirst({
            where: { session_id: data.sessionId, student_id: data.studentId }
        });

        if (existing) {
            await prisma.student_attendance.update({
                where: { id: existing.id },
                data: { status: data.status as AttendanceStatus, remark: data.remark || null, marked_at: new Date().toISOString(), marked_by: userId }
            });
        } else {
            await prisma.student_attendance.create({
                data: { id: uuidv4(), session_id: data.sessionId, student_id: data.studentId, status: data.status as AttendanceStatus, remark: data.remark || null, marked_by: userId }
            });
        }
        return true;
    }

    static async markBulkStudentAttendance(sessionId: string, attendanceRecords: any[], userId: string) {
        if (!sessionId || !Array.isArray(attendanceRecords)) {
            throw new Error('Session ID and attendance records are required');
        }

        await prisma.$transaction(async (tx) => {
            for (const record of attendanceRecords) {
                const { studentId, status, remark } = record;

                const existing = await tx.student_attendance.findFirst({
                    where: { session_id: sessionId, student_id: studentId }
                });

                if (existing) {
                    await tx.student_attendance.update({
                        where: { id: existing.id },
                        data: { status: status as AttendanceStatus, remark: remark || null, marked_at: new Date().toISOString(), marked_by: userId }
                    });
                } else {
                    await tx.student_attendance.create({
                        data: { id: uuidv4(), session_id: sessionId, student_id: studentId, status: status as AttendanceStatus, remark: remark || null, marked_by: userId }
                    });
                }
            }
        });

        return true;
    }

    // ================= VOLUNTEER ATTENDANCE =================
    static async getVolunteerAttendance(sessionId: string) {
        return await prisma.volunteer_attendance.findMany({
            where: { session_id: sessionId },
            include: { volunteer: { select: { name: true } } },
            orderBy: { volunteer: { name: 'asc' } }
        });
    }

    static async markVolunteerAttendance(data: { sessionId: string; volunteerId: string; status: string; remark?: string; }, userId: string) {
        if (!data.sessionId || !data.volunteerId || !data.status) {
            throw new Error('Session ID, volunteer ID, and status are required');
        }

        const existing = await prisma.volunteer_attendance.findFirst({
            where: { session_id: data.sessionId, volunteer_id: data.volunteerId }
        });

        if (existing) {
            await prisma.volunteer_attendance.update({
                where: { id: existing.id },
                data: { status: data.status as AttendanceStatus, remark: data.remark || null, marked_at: new Date().toISOString(), marked_by: userId }
            });
        } else {
            await prisma.volunteer_attendance.create({
                data: { id: uuidv4(), session_id: data.sessionId, volunteer_id: data.volunteerId, status: data.status as AttendanceStatus, remark: data.remark || null, marked_by: userId }
            });
        }
        return true;
    }

    // ================= SESSION ASSIGNMENTS =================
    static async getSessionAssignments(sessionId: string) {
        return await prisma.session_assignments.findMany({
            where: { session_id: sessionId },
            include: {
                volunteer: { select: { name: true } },
                student: { select: { full_name: true } }
            }
        });
    }

    static async createSessionAssignment(data: { sessionId: string; volunteerId: string; studentId: string; }) {
        if (!data.sessionId || !data.volunteerId || !data.studentId) {
            throw new Error('Session ID, volunteer ID, and student ID are required');
        }

        const existing = await prisma.session_assignments.findFirst({
            where: { session_id: data.sessionId, volunteer_id: data.volunteerId, student_id: data.studentId }
        });

        if (existing) {
            throw new Error('Assignment already exists');
        }

        return await prisma.session_assignments.create({
            data: { id: uuidv4(), session_id: data.sessionId, volunteer_id: data.volunteerId, student_id: data.studentId }
        });
    }

    static async deleteSessionAssignment(id: string) {
        const existing = await prisma.session_assignments.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Assignment not found');
        }

        await prisma.session_assignments.delete({ where: { id } });
        return true;
    }
}
