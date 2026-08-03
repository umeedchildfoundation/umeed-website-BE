import chalk from 'chalk';
import { Request, Response } from 'express';
import { ApplicationsService } from './applications.service.js';

export class ApplicationsController {
    static async getAllApplications(req: Request, res: Response) {
        try {
            const applications = await ApplicationsService.getAllApplications(req.query.status as string);
            res.json(applications);
        } catch (error) {
            console.error(chalk.red('[Applications] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get applications' });
        }
    }

    static async getApplicationById(req: Request, res: Response) {
        try {
            const application = await ApplicationsService.getApplicationById(req.params.id);
            if (!application) return res.status(404).json({ error: 'Application not found' });
            res.json(application);
        } catch (error) {
            console.error(chalk.red('[Applications] Get by ID error:'),  error);
            res.status(500).json({ error: 'Failed to get application' });
        }
    }

    static async submitApplication(req: Request, res: Response) {
        try {
            const application = await ApplicationsService.submitApplication(req.body);
            res.status(201).json(application);
        } catch (error: any) {
            console.error(chalk.red('[Applications] Create error:'),  error);
            if (error.message === 'Name and email are required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create application' });
        }
    }

    static async updateApplicationStatus(req: Request, res: Response) {
        try {
            const updated = await ApplicationsService.updateApplicationStatus(req.params.id, req.body.status);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Applications] Update error:'),  error);
            if (error.message === 'Application not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update application' });
        }
    }

    static async deleteApplication(req: Request, res: Response) {
        try {
            await ApplicationsService.deleteApplication(req.params.id);
            res.json({ message: 'Application deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Applications] Delete error:'),  error);
            if (error.message === 'Application not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete application' });
        }
    }
}
