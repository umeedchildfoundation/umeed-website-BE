import chalk from 'chalk';
import { Request, Response } from 'express';
import { VolunteersService } from './volunteers.service.js';

// Fields a non-admin owner is not allowed to change on their own volunteer record
const ADMIN_ONLY_FIELDS = ['email', 'gender', 'status', 'volunteer_id', 'volunteerId'];

const REQUIRED_FIELD_ERRORS = new Set([
    'Name and email are required',
    'Phone is required',
    'Age is required',
    'Gender is required',
    'Address is required',
    'Occupation is required',
    'At least one skill/subject is required',
    'At least one preferred language is required',
    'Availability is required'
]);

export class VolunteersController {
    static async getAllVolunteers(req: Request, res: Response) {
        try {
            const volunteers = await VolunteersService.getAllVolunteers({
                status: req.query.status as string,
                user_id: req.query.user_id as string,
                email: req.query.email as string
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
            if (REQUIRED_FIELD_ERRORS.has(error.message)) return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create volunteer' });
        }
    }

    static async updateVolunteer(req: Request, res: Response) {
        try {
            const volunteer = await VolunteersService.getVolunteerById(req.params.id);
            if (!volunteer) return res.status(404).json({ error: 'Volunteer not found' });

            const isAdmin = req.user!.role === 'admin' || req.user!.role === 'super_admin';
            const isOwner = volunteer.user_id === req.user!.id;

            if (!isAdmin && !isOwner) {
                return res.status(403).json({ error: 'Admin access required' });
            }

            // Non-admin owners may update their own profile, except admin-controlled fields
            let payload = req.body;
            if (!isAdmin) {
                payload = { ...req.body };
                for (const field of ADMIN_ONLY_FIELDS) delete payload[field];
            }

            const updated = await VolunteersService.updateVolunteer(req.params.id, payload);
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
