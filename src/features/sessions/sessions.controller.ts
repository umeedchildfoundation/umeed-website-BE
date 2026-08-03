import chalk from 'chalk';
import { Request, Response } from 'express';
import { SessionsService } from './sessions.service.js';

export class SessionsController {
    static async getAllSessions(req: Request, res: Response) {
        try {
            const sessions = await SessionsService.getAllSessions({
                date: req.query.date as string,
                status: req.query.status as string
            });
            res.json(sessions);
        } catch (error) {
            console.error(chalk.red('[Sessions] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get sessions' });
        }
    }

    static async getSessionById(req: Request, res: Response) {
        try {
            const session = await SessionsService.getSessionById(req.params.id);
            res.json(session);
        } catch (error: any) {
            console.error(chalk.red('[Sessions] Get by ID error:'),  error);
            if (error.message === 'Session not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to get session' });
        }
    }

    static async createSession(req: Request, res: Response) {
        try {
            const session = await SessionsService.createSession(req.body, req.user!.id);
            res.status(201).json(session);
        } catch (error: any) {
            console.error(chalk.red('[Sessions] Create error:'),  error);
            if (error.message === 'Date is required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create session' });
        }
    }

    static async updateSession(req: Request, res: Response) {
        try {
            const updated = await SessionsService.updateSession(req.params.id, req.body);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Sessions] Update error:'),  error);
            if (error.message === 'Session not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update session' });
        }
    }

    static async deleteSession(req: Request, res: Response) {
        try {
            await SessionsService.deleteSession(req.params.id);
            res.json({ message: 'Session deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Sessions] Delete error:'),  error);
            if (error.message === 'Session not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete session' });
        }
    }
}
