import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { generateVolunteerId } from '../../utils/idGenerator.js';
import { v4 as uuidv4 } from 'uuid';

function parseDelimitedArray(val: any): string[] {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val.trim() !== '') return val.split(',').map((s: string) => s.trim()).filter(Boolean);
    return [];
}

function formatVolunteer(v: any) {
    if (!v) return v;

    let documents: any[] = [];
    if (Array.isArray(v.documents)) {
        documents = v.documents;
    } else if (typeof v.documents === 'string' && v.documents.trim() !== '') {
        try { documents = JSON.parse(v.documents); } catch { documents = []; }
    }

    return {
        ...v,
        skills: parseDelimitedArray(v.skills),
        preferred_languages: parseDelimitedArray(v.preferred_languages),
        documents
    };
}

export class VolunteersService {
    static async getAllVolunteers(filters: { status?: string; user_id?: string; email?: string }) {
        const where: any = {};
        if (filters.status) where.status = String(filters.status);
        if (filters.user_id) where.user_id = String(filters.user_id);
        if (filters.email) where.email = String(filters.email);

        const rows = await prisma.volunteers.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
        return rows.map(formatVolunteer);
    }

    static async getVolunteerById(id: string) {
        const row = await prisma.volunteers.findUnique({ where: { id } });
        return formatVolunteer(row);
    }

    static async createVolunteer(dataParams: any) {
        const {
            user_id, userId, volunteer_id, volunteerId,
            name, full_name, firstName, lastName, email, phone, phoneNumber, age, gender, address,
            occupation, skills, preferred_languages, preferredLanguages, availability, status = 'pending',
            documents, profile_picture, profilePicture, joined_at
        } = dataParams;

        const resolvedName = name || full_name || [firstName, lastName].filter(Boolean).join(' ');
        const resolvedPhone = phone ?? phoneNumber;
        const resolvedLanguages = preferred_languages ?? preferredLanguages;
        const isEmptyValue = (val: any) => Array.isArray(val) ? val.length === 0 : !val;

        if (!resolvedName || !email) throw new Error('Name and email are required');
        if (!resolvedPhone) throw new Error('Phone is required');
        if (age === undefined || age === null || age === '') throw new Error('Age is required');
        if (!gender) throw new Error('Gender is required');
        if (!address) throw new Error('Address is required');
        if (!occupation) throw new Error('Occupation is required');
        if (isEmptyValue(skills)) throw new Error('At least one skill/subject is required');
        if (isEmptyValue(resolvedLanguages)) throw new Error('At least one preferred language is required');
        if (!availability) throw new Error('Availability is required');

        const resolvedUserId = user_id ?? userId ?? null;
        const volId = volunteer_id || volunteerId || await generateVolunteerId();
        const resolvedProfilePicture = profile_picture ?? profilePicture;

        const created = await prisma.volunteers.create({
            data: {
                id: uuidv4(),
                user_id: resolvedUserId,
                volunteer_id: volId,
                name: resolvedName,
                email,
                phone: resolvedPhone || null,
                age: age ?? null,
                gender: gender || null,
                address: address || null,
                occupation: occupation || null,
                skills: Array.isArray(skills) ? skills.join(',') : (skills || null),
                preferred_languages: Array.isArray(resolvedLanguages) ? resolvedLanguages.join(',') : (resolvedLanguages || null),
                availability: availability || null,
                status,
                documents: documents ? JSON.stringify(documents) : null,
                profile_picture: resolvedProfilePicture || null,
                joined_at: joined_at || new Date().toISOString()
            }
        });
        return formatVolunteer(created);
    }

    static async updateVolunteer(id: string, dataParams: any) {
        const existing = await prisma.volunteers.findUnique({ where: { id } });
        if (!existing) throw new Error('Volunteer not found');

        const {
            name, email, phone, phoneNumber, age, gender, address, occupation, skills,
            preferred_languages, preferredLanguages, availability, status,
            profile_picture, profilePicture, volunteer_id, volunteerId, documents
        } = dataParams;

        const resolvedPhone = phone ?? phoneNumber;
        const resolvedLanguages = preferred_languages ?? preferredLanguages;
        const resolvedProfilePicture = profile_picture ?? profilePicture;
        const resolvedVolunteerId = volunteer_id ?? volunteerId;

        const data: any = {};
        if (name !== undefined) data.name = name;
        if (email !== undefined) data.email = email;
        if (resolvedPhone !== undefined) data.phone = resolvedPhone;
        if (age !== undefined) data.age = age;
        if (gender !== undefined) data.gender = gender;
        if (address !== undefined) data.address = address;
        if (occupation !== undefined) data.occupation = occupation;
        if (skills !== undefined) data.skills = Array.isArray(skills) ? skills.join(',') : skills;
        if (resolvedLanguages !== undefined) data.preferred_languages = Array.isArray(resolvedLanguages) ? resolvedLanguages.join(',') : resolvedLanguages;
        if (availability !== undefined) data.availability = availability;
        if (status !== undefined) data.status = status;
        if (resolvedProfilePicture !== undefined) data.profile_picture = resolvedProfilePicture;
        if (resolvedVolunteerId !== undefined) data.volunteer_id = resolvedVolunteerId;
        if (documents !== undefined) data.documents = documents ? JSON.stringify(documents) : null;

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        const updated = await prisma.volunteers.update({
            where: { id },
            data
        });
        return formatVolunteer(updated);
    }

    static async deleteVolunteer(id: string) {
        const existing = await prisma.volunteers.findUnique({ where: { id } });
        if (!existing) throw new Error('Volunteer not found');

        await prisma.volunteers.delete({ where: { id } });
        return true;
    }
}
