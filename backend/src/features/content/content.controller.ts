import chalk from 'chalk';
import { Request, Response } from 'express';
import { ContentService } from './content.service.js';

export class ContentController {
    static async getAllContent(req: Request, res: Response) {
        try {
            const content = await ContentService.getAllContent();
            res.json(content);
        } catch (error) {
            console.error(chalk.red('[Content] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get content' });
        }
    }

    static async getContentBySection(req: Request, res: Response) {
        try {
            const content = await ContentService.getContentBySection(req.params.section);
            res.json(content);
        } catch (error) {
            console.error(chalk.red('[Content] Get section error:'),  error);
            res.status(500).json({ error: 'Failed to get section content' });
        }
    }

    static async upsertContent(req: Request, res: Response) {
        try {
            const { section, key, value, type } = req.body;
            await ContentService.upsertContent(section, key, value, type);
            res.json({ message: 'Content saved successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Content] Save error:'),  error);
            if (error.message === 'Section and key are required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to save content' });
        }
    }

    static async upsertBulkContent(req: Request, res: Response) {
        try {
            await ContentService.upsertBulkContent(req.body.items);
            res.json({ message: 'Content saved successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Content] Bulk save error:'),  error);
            if (error.message === 'Items must be an array') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to save bulk content' });
        }
    }

    static async deleteContent(req: Request, res: Response) {
        try {
            await ContentService.deleteContent(req.params.section, req.params.key);
            res.json({ message: 'Content deleted successfully' });
        } catch (error) {
            console.error(chalk.red('[Content] Delete error:'),  error);
            res.status(500).json({ error: 'Failed to delete content' });
        }
    }
}
