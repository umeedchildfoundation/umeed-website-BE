import chalk from 'chalk';
import { Request, Response } from 'express';
import { NoticesService } from './notices.service.js';

export class NoticesController {
    static async getAllNotices(req: Request, res: Response) {
        try {
            const notices = await NoticesService.getAllNotices(req.user);
            res.json(notices);
        } catch (error) {
            console.error(chalk.red('[Notices] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get notices' });
        }
    }

    static async getNoticeById(req: Request, res: Response) {
        try {
            const notice = await NoticesService.getNoticeById(req.params.id, req.user);
            res.json(notice);
        } catch (error: any) {
            console.error(chalk.red('[Notices] Get by ID error:'),  error);
            if (error.message === 'Notice not found') return res.status(404).json({ error: error.message });
            if (error.message === 'Access denied') return res.status(403).json({ error: error.message });
            res.status(500).json({ error: 'Failed to get notice' });
        }
    }

    static async createNotice(req: Request, res: Response) {
        try {
            const notice = await NoticesService.createNotice(req.body, req.user!.id);
            res.status(201).json(notice);
        } catch (error: any) {
            console.error(chalk.red('[Notices] Create error:'),  error);
            if (error.message === 'Title is required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create notice' });
        }
    }

    static async updateNotice(req: Request, res: Response) {
        try {
            const updated = await NoticesService.updateNotice(req.params.id, req.body);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Notices] Update error:'),  error);
            if (error.message === 'Notice not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update notice' });
        }
    }

    static async deleteNotice(req: Request, res: Response) {
        try {
            await NoticesService.deleteNotice(req.params.id);
            res.json({ message: 'Notice deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Notices] Delete error:'),  error);
            if (error.message === 'Notice not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete notice' });
        }
    }
}
