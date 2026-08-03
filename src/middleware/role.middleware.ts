/**
 * Role-Based Access Control Middleware
 * 
 * Restricts access based on user roles
 */

import { Request, Response, NextFunction } from 'express';

type Role = 'volunteer' | 'admin' | 'super_admin';

/**
 * Middleware that requires specific roles
 */
export function requireRole(...allowedRoles: Role[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }

        const userRole = req.user.role as Role;

        // super_admin has access to everything
        if (userRole === 'super_admin') {
            next();
            return;
        }

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({ error: 'Insufficient permissions' });
            return;
        }

        next();
    };
}

/**
 * Middleware that requires admin or super_admin role
 */
export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
        res.status(403).json({ error: 'Admin access required' });
        return;
    }

    next();
}

/**
 * Middleware that requires super_admin role
 */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction): void {
    if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
    }

    if (req.user.role !== 'super_admin') {
        res.status(403).json({ error: 'Super admin access required' });
        return;
    }

    next();
}
