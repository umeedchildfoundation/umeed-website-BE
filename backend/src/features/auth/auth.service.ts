import { hashPassword, verifyPassword } from '../../utils/password.js';
import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { generateToken } from '../../utils/jwt.js';
import { v4 as uuidv4 } from 'uuid';
import { generateVolunteerId } from '../../utils/idGenerator.js';

export class AuthService {
    static async register(data: { email: string; password?: string; fullName?: string; }) {
        if (!data.email || !data.password) {
            throw new Error('Email and password are required');
        }

        const existing = await prisma.users.findFirst({
            where: { email: { equals: data.email, mode: 'insensitive' } }
        });

        if (existing) {
            throw new Error('User already exists');
        }

        const passwordHash = await hashPassword(data.password);
        const name = data.fullName || data.email.split('@')[0];

        const newUser = await prisma!.users.create({
            data: {
                id: uuidv4(),
                email: data.email.toLowerCase(),
                password_hash: passwordHash,
                full_name: name,
                role: 'volunteer',
                profile: {
                    create: {
                        id: uuidv4(),
                        email: data.email.toLowerCase(),
                        full_name: name,
                        role: 'volunteer'
                    }
                }
            }
        });

        // Also create a volunteer record so user appears in volunteers table
        const volunteerIdStr = await generateVolunteerId();

        await prisma!.volunteers.create({
            data: {
                id: uuidv4(),
                user_id: newUser.id,
                volunteer_id: volunteerIdStr,
                name: name,
                email: newUser.email,
                status: 'pending',
                joined_at: new Date().toISOString()
            }
        });

        const token = generateToken({ userId: newUser.id, email: newUser.email, role: newUser.role });

        return {
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                fullName: newUser.full_name,
                role: newUser.role
            }
        };
    }

    static async login(data: { email: string; password?: string; }) {
        if (!data.email || !data.password) {
            throw new Error('Email and password are required');
        }

        const user = await prisma.users.findFirst({
            where: { email: { equals: data.email, mode: 'insensitive' } }
        });

        if (!user) {
            throw new Error('Invalid email or password');
        }

        const isValid = await verifyPassword(data.password, user.password_hash);
        if (!isValid) {
            throw new Error('Invalid email or password');
        }

        const token = generateToken({
            userId: user.id,
            email: user.email,
            role: user.role
        });

        const volunteer = await prisma.volunteers.findFirst({
            where: { user_id: user.id }
        });

        return {
            token,
            user: {
                id: user.id,
                email: user.email,
                fullName: user.full_name,
                role: user.role,
                avatarUrl: user.avatar_url,
                volunteerId: volunteer?.id || null,
                volunteerStatus: volunteer?.status || null
            }
        };
    }

    static async getMe(userId: string) {
        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { id: true, email: true, full_name: true, role: true, avatar_url: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const volunteer = await prisma.volunteers.findFirst({
            where: { user_id: user.id },
            select: { id: true, status: true }
        });

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            volunteerId: volunteer?.id || null,
            volunteerStatus: volunteer?.status || null
        };
    }

    static async updateMe(userId: string, dataParams: { fullName?: string; avatarUrl?: string; userMetadata?: any; preferences?: any; }) {
        const data: any = {};
        if (dataParams.fullName !== undefined) data.full_name = dataParams.fullName;
        if (dataParams.avatarUrl !== undefined) data.avatar_url = dataParams.avatarUrl;
        if (dataParams.userMetadata !== undefined) data.raw_user_meta_data = JSON.stringify(dataParams.userMetadata);
        if (dataParams.preferences !== undefined) data.preferences = JSON.stringify(dataParams.preferences);
        
        data.updated_at = new Date().toISOString();

        const user = await prisma.users.update({
            where: { id: userId },
            data,
            select: {
                id: true,
                email: true,
                full_name: true,
                role: true,
                avatar_url: true,
                raw_user_meta_data: true,
                preferences: true
            }
        });

        return {
            id: user.id,
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            avatarUrl: user.avatar_url,
            user_metadata: user.raw_user_meta_data ? JSON.parse(user.raw_user_meta_data) : {},
            preferences: user.preferences ? JSON.parse(user.preferences) : {}
        };
    }

    static async changePassword(userId: string, dataParams: { currentPassword?: string; newPassword?: string; }) {
        if (!dataParams.currentPassword || !dataParams.newPassword) {
            throw new Error('Current and new password are required');
        }

        const user = await prisma.users.findUnique({
            where: { id: userId },
            select: { password_hash: true }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await verifyPassword(dataParams.currentPassword, user.password_hash);
        if (!isValid) {
            throw new Error('Current password is incorrect');
        }

        const newHash = await hashPassword(dataParams.newPassword);

        await prisma.users.update({
            where: { id: userId },
            data: { password_hash: newHash, updated_at: new Date().toISOString() }
        });

        return true;
    }
}
