import chalk from 'chalk';
import { Request, Response } from 'express';
import { SessionRsvpsService } from './session_rsvps.service.js';

export class SessionRsvpsController {
    static async getRsvps(req: Request, res: Response) {
        try {
            const sessionId = req.query.session_id as string;
            if (!sessionId) return res.status(400).json({ error: 'session_id is required' });

            const rsvps = await SessionRsvpsService.getRsvpsForSession(sessionId);
            res.json(rsvps);
        } catch (error) {
            console.error(chalk.red('[SessionRSVPs] Get error:'), error);
            res.status(500).json({ error: 'Failed to get RSVPs' });
        }
    }

    static async upsertRsvp(req: Request, res: Response) {
        try {
            const rsvp = await SessionRsvpsService.upsertRsvp(req.body, req.user!);
            res.status(201).json(rsvp);
        } catch (error: any) {
            console.error(chalk.red('[SessionRSVPs] Save error:'), error);
            if (error.message === 'You can only RSVP for your own volunteer profile') {
                return res.status(403).json({ error: error.message });
            }
            if (error.message === 'session_id, volunteer_id and status are required') {
                return res.status(400).json({ error: error.message });
            }
            res.status(500).json({ error: 'Failed to save RSVP' });
        }
    }
}
