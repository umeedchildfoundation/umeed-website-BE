import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { VolunteerStatus } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';

export class ApplicationsService {
    static async getAllApplications(status?: string) {
        const where: any = {};
        if (status) {
            where.status = status;
        }

        return await prisma.volunteer_applications.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    static async getApplicationById(id: string) {
        return await prisma.volunteer_applications.findUnique({
            where: { id }
        });
    }

    static async submitApplication(dataParams: any) {
        const {
            full_name, email, phone, age, gender, address, occupation,
            availability, motivation, skills_subjects, preferred_languages,
            status = 'pending'
        } = dataParams;

        if (!full_name || !email) throw new Error('Name and email are required');

        const skills = Array.isArray(skills_subjects) ? JSON.stringify(skills_subjects) : skills_subjects;
        const languages = Array.isArray(preferred_languages) ? JSON.stringify(preferred_languages) : preferred_languages;

        return await prisma.volunteer_applications.create({
            data: {
                id: uuidv4(),
                full_name,
                email,
                phone: phone || null,
                age: age || null,
                gender: gender || null,
                address: address || null,
                occupation: occupation || null,
                availability: availability || null,
                motivation: motivation || null,
                skills_subjects: skills || null,
                preferred_languages: languages || null,
                status: status as VolunteerStatus
            }
        });
    }

    static async updateApplicationStatus(id: string, status: string) {
        const existing = await prisma.volunteer_applications.findUnique({
            where: { id }
        });

        if (!existing) throw new Error('Application not found');

        if (status) {
            return await prisma.volunteer_applications.update({
                where: { id },
                data: { status: status as VolunteerStatus, updated_at: new Date().toISOString() }
            });
        }
        return existing;
    }

    static async deleteApplication(id: string) {
        const existing = await prisma.volunteer_applications.findUnique({
            where: { id }
        });

        if (!existing) throw new Error('Application not found');

        await prisma.volunteer_applications.delete({
            where: { id }
        });

        return true;
    }
}
