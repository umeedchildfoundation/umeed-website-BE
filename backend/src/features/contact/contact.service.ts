import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';

export class ContactService {
    static async getAllMessages() {
        return await prisma.contact_messages.findMany({
            orderBy: { created_at: 'desc' }
        });
    }

    static async submitMessage(dataParams: { name: string; email: string; message: string; }) {
        const { name, email, message } = dataParams;

        if (!name || !email || !message) {
            throw new Error('All fields are required');
        }

        return await prisma.contact_messages.create({
            data: { id: uuidv4(), name, email, message, is_read: 0 }
        });
    }

    static async updateMessageReadStatus(id: string, is_read: boolean) {
        const data: any = {};
        if (is_read !== undefined) {
            data.is_read = is_read ? 1 : 0;
        }

        return await prisma.contact_messages.update({
            where: { id },
            data
        });
    }

    static async deleteMessage(id: string) {
        await prisma.contact_messages.delete({
            where: { id }
        });
        return true;
    }
}
