/**
 * Password Utilities
 * 
 * Secure password hashing and verification using bcrypt
 */

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

/**
 * Hash a password synchronously (for seeding)
 */
export function hashPasswordSync(password: string): string {
    return bcrypt.hashSync(password, SALT_ROUNDS);
}
