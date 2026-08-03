import prisma from '../../db/index.js';

export class UsersService {
    static async getAllUsers() {
        return await prisma.users.findMany({
            select: { id: true, email: true, full_name: true, role: true, avatar_url: true, created_at: true, updated_at: true },
            orderBy: { created_at: 'desc' }
        });
    }

    static async getUserById(id: string) {
        return await prisma.users.findUnique({
            where: { id },
            select: { id: true, email: true, full_name: true, role: true, avatar_url: true, created_at: true, updated_at: true }
        });
    }

    static async updateUser(
        targetId: string,
        updates: { fullName?: string; role?: string; avatarUrl?: string },
        requestingUserRole: string
    ) {
        // Check if target user exists
        const target = await prisma.users.findUnique({
            where: { id: targetId },
            select: { role: true }
        });

        if (!target) {
            throw new Error('User not found');
        }

        // Only super_admin can modify other admins
        if ((target.role === 'admin' || target.role === 'super_admin') && requestingUserRole !== 'super_admin') {
            throw new Error('Cannot modify admin users');
        }

        const data: any = {};
        if (updates.fullName !== undefined) data.full_name = updates.fullName;
        if (updates.role !== undefined && requestingUserRole === 'super_admin') data.role = updates.role;
        if (updates.avatarUrl !== undefined) data.avatar_url = updates.avatarUrl;
        
        data.updated_at = new Date().toISOString();

        return await prisma.users.update({
            where: { id: targetId },
            data,
            select: { id: true, email: true, full_name: true, role: true, avatar_url: true, created_at: true, updated_at: true }
        });
    }

    static async deleteUser(targetId: string, requestingUserId: string) {
        // Prevent self-deletion
        if (targetId === requestingUserId) {
            throw new Error('Cannot delete yourself');
        }

        const target = await prisma.users.findUnique({ where: { id: targetId }});
        if (!target) {
            throw new Error('User not found');
        }

        await prisma.users.delete({ where: { id: targetId } });
        return true;
    }
}
