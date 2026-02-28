import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { v4 as uuidv4 } from 'uuid';
import { uploadFileToS3, deleteFileFromS3 } from '../../utils/s3.js';

export class MediaService {
    static async getAllMedia(eventId?: string) {
        const where: any = {};
        if (eventId) {
            where.event_id = String(eventId);
        }

        return await prisma.media.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    static async uploadMedia(fileData: any, bodyData: any, userId: string) {
        if (!fileData) {
            throw new Error('No file uploaded');
        }

        const { eventId, caption } = bodyData;
        const type = fileData.mimetype.startsWith('video/') ? 'video' : 'image';

        // Upload directly to S3 from buffer
        const url = await uploadFileToS3(
            fileData.buffer,
            fileData.originalname,
            fileData.mimetype,
            'uploads'
        );

        const media = await prisma.media.create({
            data: {
                id: uuidv4(),
                event_id: eventId || null,
                url,
                type,
                caption: caption || null,
                filename: fileData.originalname,
                mimetype: fileData.mimetype,
                size: fileData.size,
                uploaded_by: userId
            }
        });

        // If this is for an event, also add to event_media
        if (eventId) {
            await prisma.event_media.create({
                data: {
                    id: uuidv4(),
                    event_id: eventId,
                    url,
                    media_type: type,
                    caption: caption || null
                }
            });
        }

        return media;
    }

    static async deleteMedia(id: string) {
        const existing = await prisma.media.findUnique({
            where: { id }
        });

        if (!existing) {
            throw new Error('Media not found');
        }

        // Delete from S3
        if (existing.url) {
            try {
                // Ignore any error since file might have been deleted already from S3 directly
                await deleteFileFromS3(existing.url);
            } catch (err) {
                console.warn('Could not delete file from S3:', err);
            }
        }

        await prisma.media.delete({
            where: { id }
        });

        return true;
    }
}
