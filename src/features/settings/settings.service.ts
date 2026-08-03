import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

export class SettingsService {
    static async getAllSettings() {
        return await prisma.app_settings.findMany();
    }

    static async upsertSetting(key: string, value: string) {
        if (!key) throw new Error('Key is required');

        const existing = await prisma.app_settings.findUnique({
            where: { key }
        });

        if (existing) {
            return await prisma.app_settings.update({
                where: { key },
                data: { value, updated_at: new Date().toISOString() }
            });
        } else {
            return await prisma.app_settings.create({
                data: { id: uuidv4(), key, value }
            });
        }
    }

    static async deleteSetting(key: string) {
        await prisma.app_settings.delete({
            where: { key }
        });
        return true;
    }
}
