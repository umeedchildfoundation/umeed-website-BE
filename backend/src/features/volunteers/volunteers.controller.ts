import chalk from 'chalk';
import { Request, Response } from 'express';
import { VolunteersService } from './volunteers.service.js';

export class VolunteersController {
    static async getAllVolunteers(req: Request, res: Response) {
        try {
            const volunteers = await VolunteersService.getAllVolunteers({
                status: req.query.status as string
            });
            res.json(volunteers);
        } catch (error) {
            console.error(chalk.red('[Volunteers] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get volunteers' });
        }
    }

    static async getVolunteerById(req: Request, res: Response) {
        try {
            const volunteer = await VolunteersService.getVolunteerById(req.params.id);
            if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });
            res.json(volunteer);
        } catch (error) {
            console.error(chalk.red('[Volunteers] Get by ID error:'),  error);
            res.status(500).json({ error: 'Failed to get volunteer' });
        }
    }

    static async createVolunteer(req: Request, res: Response) {
        try {
            const volunteer = await VolunteersService.createVolunteer(req.body);
            res.status(201).json(volunteer);
        } catch (error: any) {
            console.error(chalk.red('[Volunteers] Create error:'),  error);
            if (error.message === 'Name and email are required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create volunteer' });
        }
    }

    static async updateVolunteer(req: Request, res: Response) {
        try {
            const updated = await VolunteersService.updateVolunteer(req.params.id, req.body);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Volunteers] Update error:'),  error);
            if (error.message === 'Volunteer not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update volunteer' });
        }
    }

    static async deleteVolunteer(req: Request, res: Response) {
        try {
            await VolunteersService.deleteVolunteer(req.params.id);
            res.json({ message: 'Volunteer deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Volunteers] Delete error:'),  error);
            if (error.message === 'Volunteer not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete volunteer' });
        }
    }
}
