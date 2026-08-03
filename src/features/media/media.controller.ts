import chalk from 'chalk';
import { Request, Response } from 'express';
import { MediaService } from './media.service.js';

export class MediaController {
    static async getAllMedia(req: Request, res: Response) {
        try {
            const media = await MediaService.getAllMedia(req.query.eventId as string);
            res.json(media);
        } catch (error) {
            console.error(chalk.red('[Media] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get media' });
        }
    }

    static async uploadMedia(req: Request, res: Response) {
        try {
            const media = await MediaService.uploadMedia(req.file, req.body, req.user!.id);
            res.status(201).json(media);
        } catch (error: any) {
            console.error(chalk.red('[Media] Upload error:'),  error);
            if (error.message === 'No file uploaded') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }

    static async deleteMedia(req: Request, res: Response) {
        try {
            await MediaService.deleteMedia(req.params.id);
            res.json({ message: 'Media deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Media] Delete error:'),  error);
            if (error.message === 'Media not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete media' });
        }
    }
}
