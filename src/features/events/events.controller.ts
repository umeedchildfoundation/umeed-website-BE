import chalk from 'chalk';
import { Request, Response } from 'express';
import { EventsService } from './events.service.js';

export class EventsController {
    static async getAllEvents(req: Request, res: Response) {
        try {
            const events = await EventsService.getAllEvents();
            res.json(events);
        } catch (error) {
            console.error(chalk.red('[Events] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get events' });
        }
    }

    static async getEventById(req: Request, res: Response) {
        try {
            const event = await EventsService.getEventById(req.params.id);
            res.json(event);
        } catch (error: any) {
            console.error(chalk.red('[Events] Get by ID error:'),  error);
            if (error.message === 'Event not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to get event' });
        }
    }

    static async createEvent(req: Request, res: Response) {
        try {
            const event = await EventsService.createEvent(req.body);
            res.status(201).json(event);
        } catch (error: any) {
            console.error(chalk.red('[Events] Create error:'),  error);
            if (error.message === 'Title and date are required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create event' });
        }
    }

    static async updateEvent(req: Request, res: Response) {
        try {
            const updated = await EventsService.updateEvent(req.params.id, req.body);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Events] Update error:'),  error);
            if (error.message === 'Event not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update event' });
        }
    }

    static async deleteEvent(req: Request, res: Response) {
        try {
            await EventsService.deleteEvent(req.params.id);
            res.json({ message: 'Event deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Events] Delete error:'),  error);
            if (error.message === 'Event not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete event' });
        }
    }
}
