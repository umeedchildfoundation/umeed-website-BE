import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';
import { Visibility } from '@prisma/client';

export class NoticesService {
    static async getAllNotices(userAuth: any) {
        const where: any = {};
        
        if (!userAuth) {
            where.visibility = Visibility.public;
        }

        return await prisma.notices.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    static async getNoticeById(id: string, userAuth: any) {
        const notice = await prisma.notices.findUnique({
            where: { id }
        });

        if (!notice) {
            throw new Error('Notice not found');
        }

        if (notice.visibility === Visibility.internal && !userAuth) {
            throw new Error('Access denied');
        }

        return notice;
    }

    static async createNotice(dataParams: any, userId: string) {
        const {
            title,
            description,
            date,
            attachmentUrl,
            visibility = Visibility.public
        } = dataParams;

        if (!title) {
            throw new Error('Title is required');
        }

        return await prisma.notices.create({
            data: {
                id: uuidv4(),
                title,
                description: description || null,
                date: date || null,
                published_date: new Date().toISOString(),
                attachment_url: attachmentUrl || null,
                visibility: visibility as Visibility,
                created_by: userId
            }
        });
    }

    static async updateNotice(id: string, dataParams: any) {
        const existing = await prisma.notices.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Notice not found');
        }

        const fields: Record<string, string> = {
            title: 'title',
            description: 'description',
            date: 'date',
            attachmentUrl: 'attachment_url',
            visibility: 'visibility'
        };

        const data: any = {};

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (dataParams[jsField] !== undefined) {
                data[dbField] = dataParams[jsField];
            }
        }

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        return await prisma.notices.update({
            where: { id },
            data
        });
    }

    static async deleteNotice(id: string) {
        const existing = await prisma.notices.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Notice not found');
        }

        await prisma.notices.delete({
            where: { id }
        });

        return true;
    }
}
