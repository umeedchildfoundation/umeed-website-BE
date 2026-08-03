import chalk from 'chalk';
import { Request, Response } from 'express';
import { UsersService } from './users.service.js';

export class UsersController {
    static async getAllUsers(req: Request, res: Response) {
        try {
            const users = await UsersService.getAllUsers();
            res.json(users);
        } catch (error) {
            console.error(chalk.red('[Users] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get users' });
        }
    }

    static async getUserById(req: Request, res: Response) {
        try {
            const user = await UsersService.getUserById(req.params.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        } catch (error) {
            console.error(chalk.red('[Users] Get by ID error:'),  error);
            res.status(500).json({ error: 'Failed to get user' });
        }
    }

    static async updateUser(req: Request, res: Response) {
        try {
            const { fullName, role, avatarUrl } = req.body;
            const updated = await UsersService.updateUser(
                req.params.id,
                { fullName, role, avatarUrl },
                req.user!.role
            );
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Users] Update error:'),  error);
            if (error.message === 'User not found') return res.status(404).json({ error: error.message });
            if (error.message === 'Cannot modify admin users') return res.status(403).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update user' });
        }
    }

    static async deleteUser(req: Request, res: Response) {
        try {
            await UsersService.deleteUser(req.params.id, req.user!.id);
            res.json({ message: 'User deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Users] Delete error:'),  error);
            if (error.message === 'Cannot delete yourself') return res.status(400).json({ error: error.message });
            if (error.message === 'User not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete user' });
        }
    }
}
