import chalk from 'chalk';
import { Request, Response } from 'express';
import { AuthService } from './auth.service.js';

export class AuthController {
    static async register(req: Request, res: Response) {
        try {
            const result = await AuthService.register({
                email: req.body.email,
                password: req.body.password,
                fullName: req.body.fullName
            });
            res.status(201).json({
                message: 'User created successfully',
                token: result.token,
                user: result.user
            });
        } catch (error: any) {
            console.error(chalk.red('[Auth] Register error:'),  error);
            if (error.message === 'Email and password are required') return res.status(400).json({ error: error.message });
            if (error.message === 'User already exists') return res.status(409).json({ error: error.message });
            res.status(500).json({ error: 'Registration failed' });
        }
    }



    static async login(req: Request, res: Response) {
        try {
            const result = await AuthService.login({
                email: req.body.email,
                password: req.body.password
            });
            res.json(result);
        } catch (error: any) {
            console.error(chalk.red('[Auth] Login error:'),  error);
            if (error.message === 'Email and password are required') return res.status(400).json({ error: error.message });
            if (error.message === 'Invalid email or password') return res.status(401).json({ error: error.message });
            res.status(500).json({ error: 'Login failed' });
        }
    }

    static async getMe(req: Request, res: Response) {
        try {
            const result = await AuthService.getMe(req.user!.id);
            res.json(result);
        } catch (error: any) {
            console.error(chalk.red('[Auth] Get me error:'),  error);
            if (error.message === 'User not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to get user' });
        }
    }

    static async updateMe(req: Request, res: Response) {
        try {
            const result = await AuthService.updateMe(req.user!.id, {
                fullName: req.body.fullName,
                avatarUrl: req.body.avatarUrl,
                userMetadata: req.body.userMetadata,
                preferences: req.body.preferences
            });
            res.json(result);
        } catch (error) {
            console.error(chalk.red('[Auth] Update me error:'),  error);
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    static async changePassword(req: Request, res: Response) {
        try {
            await AuthService.changePassword(req.user!.id, {
                currentPassword: req.body.currentPassword,
                newPassword: req.body.newPassword
            });
            res.json({ message: 'Password changed successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Auth] Change password error:'),  error);
            if (error.message === 'Current and new password are required') return res.status(400).json({ error: error.message });
            if (error.message === 'User not found') return res.status(404).json({ error: error.message });
            if (error.message === 'Current password is incorrect') return res.status(401).json({ error: error.message });
            res.status(500).json({ error: 'Failed to change password' });
        }
    }
}
