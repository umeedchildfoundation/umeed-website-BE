import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { generateVolunteerId } from '../../utils/idGenerator.js';
import { v4 as uuidv4 } from 'uuid';

export class VolunteersService {
    static async getAllVolunteers(filters: { status?: string }) {
        const where: any = {};
        if (filters.status) where.status = String(filters.status);

        return await prisma.volunteers.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    static async getVolunteerById(id: string) {
        return await prisma.volunteers.findUnique({ where: { id } });
    }

    static async createVolunteer(dataParams: any) {
        const {
            userId, volunteerId, name, email, phone, age, gender, address,
            occupation, skills, preferredLanguages, availability, status = 'pending'
        } = dataParams;

        if (!name || !email) throw new Error('Name and email are required');

        const volId = volunteerId || await generateVolunteerId();

        return await prisma.volunteers.create({
            data: {
                id: uuidv4(),
                user_id: userId || null,
                volunteer_id: volId,
                name,
                email,
                phone: phone || null,
                age: age || null,
                gender: gender || null,
                address: address || null,
                occupation: occupation || null,
                skills: skills || null,
                preferred_languages: preferredLanguages || null,
                availability: availability || null,
                status,
                joined_at: new Date().toISOString()
            }
        });
    }

    static async updateVolunteer(id: string, dataParams: any) {
        const existing = await prisma.volunteers.findUnique({ where: { id } });
        if (!existing) throw new Error('Volunteer not found');

        const {
            name, email, phone, age, gender, address, occupation, skills,
            preferredLanguages, availability, status, profilePicture
        } = dataParams;

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (phone !== undefined) data.phone = phone;
        if (age !== undefined) data.age = age;
        if (gender !== undefined) data.gender = gender;
        if (address !== undefined) data.address = address;
        if (occupation !== undefined) data.occupation = occupation;
        if (skills !== undefined) data.skills = skills;
        if (preferredLanguages !== undefined) data.preferred_languages = preferredLanguages;
        if (availability !== undefined) data.availability = availability;
        if (status !== undefined) data.status = status;
        if (profilePicture !== undefined) data.profile_picture = profilePicture;

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        return await prisma.volunteers.update({
            where: { id },
            data
        });
    }

    static async deleteVolunteer(id: string) {
        const existing = await prisma.volunteers.findUnique({ where: { id } });
        if (!existing) throw new Error('Volunteer not found');

        await prisma.volunteers.delete({ where: { id } });
        return true;
    }
}
