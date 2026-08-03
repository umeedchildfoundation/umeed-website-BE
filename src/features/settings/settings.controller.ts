import chalk from 'chalk';
import { Request, Response } from 'express';
import { SettingsService } from './settings.service.js';

export class SettingsController {
    static async getAllSettings(req: Request, res: Response) {
        try {
            const settings = await SettingsService.getAllSettings();
            res.json(settings);
        } catch (error) {
            console.error(chalk.red('[Settings] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get settings' });
        }
    }

    static async upsertSetting(req: Request, res: Response) {
        try {
            const updated = await SettingsService.upsertSetting(req.body.key, req.body.value);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Settings] Upsert error:'),  error);
            if (error.message === 'Key is required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to save setting' });
        }
    }

    static async deleteSetting(req: Request, res: Response) {
        try {
            await SettingsService.deleteSetting(req.params.key);
            res.json({ message: 'Setting deleted successfully' });
        } catch (error) {
            console.error(chalk.red('[Settings] Delete error:'),  error);
            res.status(500).json({ error: 'Failed to delete setting' });
        }
    }
}
