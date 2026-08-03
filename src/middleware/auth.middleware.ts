import { Request, Response, NextFunction } from 'express';
import { verifyToken, extractToken, JwtPayload } from '../utils/jwt.js';
import prisma from '../db/index.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                email: string;
                role: string;
                fullName: string;
            };
        }
    }
}

/**
 * Middleware that requires a valid JWT token
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = extractToken(req.headers.authorization);

    if (!token) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    const payload = verifyToken(token);

    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token' });
        return;
    }

    // Fetch user from database to ensure they still exist
    const user = await prisma.users.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, role: true, full_name: true }
    });

    if (!user) {
        res.status(401).json({ error: 'User not found' });
        return;
    }

    // Attach user to request
    req.user = {
        id: user.id,
        email: user.email,
        role: user.role,
        fullName: user.full_name
    };

    next();
}

/**
 * Optional auth - attaches user if token present, but doesn't require it
 */
export async function optionalAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
    const token = extractToken(req.headers.authorization);

    if (token) {
        const payload = verifyToken(token);
        if (payload) {
            const user = await prisma.users.findUnique({
                where: { id: payload.userId },
                select: { id: true, email: true, role: true, full_name: true }
            });
            
            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    role: user.role,
                    fullName: user.full_name
                };
            }
        }
    }

    next();
}
