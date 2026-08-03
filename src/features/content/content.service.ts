import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { ContentType } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class ContentService {
    static async getAllContent() {
        const result = await prisma.site_content.findMany({
            select: { section: true, key: true, value: true },
            orderBy: [{ section: 'asc' }, { key: 'asc' }]
        });
        
        const content: Record<string, Record<string, string | null>> = {};

        result.forEach((row) => {
            const section = row.section;
            const key = row.key;
            const value = row.value;

            if (!content[section]) {
                content[section] = {};
            }
            content[section][key] = value;
        });

        return content;
    }

    static async getContentBySection(section: string) {
        const result = await prisma.site_content.findMany({
            where: { section }
        });

        const content: Record<string, string | null> = {};
        result.forEach((row) => {
            content[row.key] = row.value;
        });

        return content;
    }

    static async upsertContent(section: string, key: string, value: string, type: string = 'text') {
        if (!section || !key) throw new Error('Section and key are required');

        const existing = await prisma.site_content.findFirst({
            where: { section, key }
        });

        if (existing) {
            return await prisma.site_content.update({
                where: { id: existing.id },
                data: { value, type: type as ContentType, updated_at: new Date().toISOString() }
            });
        } else {
            return await prisma.site_content.create({
                data: { id: uuidv4(), section, key, value, type: type as ContentType }
            });
        }
    }

    static async upsertBulkContent(items: any[]) {
        if (!Array.isArray(items)) throw new Error('Items must be an array');

        await prisma.$transaction(async (tx) => {
            for (const item of items) {
                const { section, key, value, type = 'text' } = item;
                if (!section || !key) continue;

                const existing = await tx.site_content.findFirst({
                    where: { section, key }
                });

                if (existing) {
                    await tx.site_content.update({
                        where: { id: existing.id },
                        data: { value, type: type as ContentType, updated_at: new Date().toISOString() }
                    });
                } else {
                    await tx.site_content.create({
                        data: { id: uuidv4(), section, key, value, type: type as ContentType }
                    });
                }
            }
        });

        return true;
    }

    static async deleteContent(section: string, key: string) {
        await prisma.site_content.deleteMany({
            where: { section, key }
        });
        return true;
    }
}
