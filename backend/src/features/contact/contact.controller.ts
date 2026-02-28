import chalk from 'chalk';
import { Request, Response } from 'express';
import { ContactService } from './contact.service.js';

export class ContactController {
    static async getAllMessages(req: Request, res: Response) {
        try {
            const messages = await ContactService.getAllMessages();
            res.json(messages);
        } catch (error) {
            console.error(chalk.red('[Contact] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get messages' });
        }
    }

    static async submitMessage(req: Request, res: Response) {
        try {
            const newMessage = await ContactService.submitMessage(req.body);
            res.status(201).json(newMessage);
        } catch (error: any) {
            console.error(chalk.red('[Contact] Create error:'),  error);
            if (error.message === 'All fields are required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to send message' });
        }
    }

    static async updateMessageReadStatus(req: Request, res: Response) {
        try {
            const updated = await ContactService.updateMessageReadStatus(req.params.id, req.body.is_read);
            res.json(updated);
        } catch (error) {
            console.error(chalk.red('[Contact] Update error:'),  error);
            res.status(500).json({ error: 'Failed to update message' });
        }
    }

    static async deleteMessage(req: Request, res: Response) {
        try {
            await ContactService.deleteMessage(req.params.id);
            res.json({ message: 'Message deleted successfully' });
        } catch (error) {
            console.error(chalk.red('[Contact] Delete error:'),  error);
            res.status(500).json({ error: 'Failed to delete message' });
        }
    }
}
