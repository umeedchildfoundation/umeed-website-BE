import chalk from 'chalk';
import { Request, Response } from 'express';
import { AttendanceService } from './attendance.service.js';

export class AttendanceController {
    // ================= ALIAS HANDLERS =================
    static async getAlias(req: Request, res: Response) {
        try {
            if (req.baseUrl.endsWith('student_attendance')) {
                const attendance = await AttendanceService.getStudentAttendanceAlias(req.query.session_id as string);
                res.json(attendance);
            } else if (req.baseUrl.endsWith('volunteer_attendance')) {
                const attendance = await AttendanceService.getVolunteerAttendanceAlias(req.query.session_id as string);
                res.json(attendance);
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (error) {
            console.error(chalk.red('[Attendance] Get alias error:'),  error);
            res.status(500).json({ error: 'Failed to fetch attendance' });
        }
    }

    static async postAlias(req: Request, res: Response) {
        try {
            if (req.baseUrl.endsWith('student_attendance')) {
                await AttendanceService.markStudentAttendance(req.body, req.user!.id);
                res.json({ message: 'Attendance marked successfully' });
            } else if (req.baseUrl.endsWith('volunteer_attendance')) {
                await AttendanceService.markVolunteerAttendance(req.body, req.user!.id);
                res.json({ message: 'Attendance marked successfully' });
            } else {
                res.status(404).json({ error: 'Not found' });
            }
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Create alias error:'),  error);
            if (error.message.includes('are required')) return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    }

    // ================= STUDENT ATTENDANCE =================
    static async getStudentAttendance(req: Request, res: Response) {
        try {
            const attendance = await AttendanceService.getStudentAttendance(req.params.sessionId);
            res.json(attendance);
        } catch (error) {
            console.error(chalk.red('[Attendance] Get student attendance error:'),  error);
            res.status(500).json({ error: 'Failed to get attendance' });
        }
    }

    static async markStudentAttendance(req: Request, res: Response) {
        try {
            await AttendanceService.markStudentAttendance(req.body, req.user!.id);
            res.json({ message: 'Attendance marked successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Mark student attendance error:'),  error);
            if (error.message.includes('are required')) return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    }

    static async markBulkStudentAttendance(req: Request, res: Response) {
        try {
            await AttendanceService.markBulkStudentAttendance(req.body.sessionId, req.body.attendanceRecords, req.user!.id);
            res.json({ message: 'Bulk attendance marked successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Bulk student attendance error:'),  error);
            if (error.message.includes('are required')) return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to mark bulk attendance' });
        }
    }

    // ================= VOLUNTEER ATTENDANCE =================
    static async getVolunteerAttendance(req: Request, res: Response) {
        try {
            const attendance = await AttendanceService.getVolunteerAttendance(req.params.sessionId);
            res.json(attendance);
        } catch (error) {
            console.error(chalk.red('[Attendance] Get volunteer attendance error:'),  error);
            res.status(500).json({ error: 'Failed to get attendance' });
        }
    }

    static async markVolunteerAttendance(req: Request, res: Response) {
        try {
            await AttendanceService.markVolunteerAttendance(req.body, req.user!.id);
            res.json({ message: 'Attendance marked successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Mark volunteer attendance error:'),  error);
            if (error.message.includes('are required')) return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to mark attendance' });
        }
    }

    // ================= SESSION ASSIGNMENTS =================
    static async getSessionAssignments(req: Request, res: Response) {
        try {
            const assignments = await AttendanceService.getSessionAssignments(req.params.sessionId);
            res.json(assignments);
        } catch (error) {
            console.error(chalk.red('[Attendance] Get assignments error:'),  error);
            res.status(500).json({ error: 'Failed to get assignments' });
        }
    }

    static async createSessionAssignment(req: Request, res: Response) {
        try {
            const assignment = await AttendanceService.createSessionAssignment(req.body);
            res.status(201).json(assignment);
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Create assignment error:'),  error);
            if (error.message.includes('are required')) return res.status(400).json({ error: error.message });
            if (error.message === 'Assignment already exists') return res.status(409).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create assignment' });
        }
    }

    static async deleteSessionAssignment(req: Request, res: Response) {
        try {
            await AttendanceService.deleteSessionAssignment(req.params.id);
            res.json({ message: 'Assignment deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Attendance] Delete assignment error:'),  error);
            if (error.message === 'Assignment not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete assignment' });
        }
    }
}
