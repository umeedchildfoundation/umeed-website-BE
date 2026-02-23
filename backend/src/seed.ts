/**
 * Database Seed Script
 * 
 * Creates demo users and sample data
 * Run with: npm run seed
 */

import 'dotenv/config';
import { v4 as uuidv4 } from 'uuid';
import { initializeDatabase, run, query, closeDb } from './db/index.js';
import { hashPasswordSync } from './utils/password.js';

async function seed() {
    console.log('[Seed] Starting database seeding...');

    // Initialize database first (async now)
    await initializeDatabase();

    try {
        // ==================== USERS ====================
        console.log('[Seed] Checking/Creating demo users...');

        // FORCE UPDATE existing demo volunteer IDs to new format
        run("UPDATE volunteers SET volunteer_id = 'UMV0001' WHERE email = 'admin@umeed.org'");
        run("UPDATE volunteers SET volunteer_id = 'UMV1001' WHERE email = 'volunteer@umeed.org'");
        console.log('[Seed] ✓ Updated existing demo volunteer IDs to UMV format');

        // Helper to check if user exists
        const userExists = (email: string) => {
            const res = query('SELECT id FROM users WHERE email = ?', [email]);
            return res.length > 0;
        };

        // Super Admin
        if (!userExists('preet@umeed.org')) {
            const superAdminId = uuidv4();
            const superAdminHash = hashPasswordSync('admin2026');
            run(
                `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [superAdminId, 'preet@umeed.org', superAdminHash, 'Preet Patel', 'super_admin']
            );
            run(
                `INSERT INTO profiles (id, user_id, email, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [uuidv4(), superAdminId, 'preet@umeed.org', 'Preet Patel', 'super_admin']
            );
            console.log('[Seed] ✓ Created Super Admin: preet@umeed.org');
        } else {
            console.log('[Seed] - Super Admin already exists');
        }

        // Admin
        if (!userExists('admin@umeed.org')) {
            const adminId = uuidv4();
            const adminHash = hashPasswordSync('admin2026');
            run(
                `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [adminId, 'admin@umeed.org', adminHash, 'Admin User', 'admin']
            );
            run(
                `INSERT INTO profiles (id, user_id, email, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [uuidv4(), adminId, 'admin@umeed.org', 'Admin User', 'admin']
            );
            // Also create volunteer entry for admin
            const adminVolunteerId = uuidv4();
            run(
                `INSERT INTO volunteers (id, user_id, volunteer_id, name, email, phone, status, joined_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
                [adminVolunteerId, adminId, 'UMV0001', 'Admin User', 'admin@umeed.org', '+91 98765 43210', 'approved']
            );
            console.log('[Seed] ✓ Created Admin: admin@umeed.org');
        } else {
            console.log('[Seed] - Admin already exists');
        }

        // Volunteer
        if (!userExists('volunteer@umeed.org')) {
            const volunteerId = uuidv4();
            const volunteerHash = hashPasswordSync('volunteer2026');
            run(
                `INSERT INTO users (id, email, password_hash, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [volunteerId, 'volunteer@umeed.org', volunteerHash, 'Demo Volunteer', 'volunteer']
            );
            run(
                `INSERT INTO profiles (id, user_id, email, full_name, role, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [uuidv4(), volunteerId, 'volunteer@umeed.org', 'Demo Volunteer', 'volunteer']
            );
            const demoVolunteerId = uuidv4();
            run(
                `INSERT INTO volunteers (id, user_id, volunteer_id, name, email, phone, status, joined_at, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
                [demoVolunteerId, volunteerId, 'UMV1001', 'Demo Volunteer', 'volunteer@umeed.org', '+91 98765 43211', 'approved']
            );
            console.log('[Seed] ✓ Created Volunteer: volunteer@umeed.org');
        } else {
            console.log('[Seed] - Volunteer already exists');
        }

        // ==================== STUDENTS ====================
        console.log('[Seed] Checking Sample Students (UMS)...');

        // Cleanup old non-UMS students
        run("DELETE FROM students WHERE id NOT LIKE 'UMS%'");

        const existingStudents = query('SELECT COUNT(*) as count FROM students');
        if ((existingStudents[0] as any).count === 0) {
            const students = [
                { id: 'UMS1001', name: 'Arjun Singh', gender: 'Male', classGrade: '5', school: 'Model School' },
                { id: 'UMS1002', name: 'Sneha Verma', gender: 'Female', classGrade: '6', school: 'City Public School' },
                { id: 'UMS1003', name: 'Ravi Kumar', gender: 'Male', classGrade: '4', school: 'Model School' },
                { id: 'UMS1004', name: 'Priya Sharma', gender: 'Female', classGrade: '5', school: 'City Public School' },
                { id: 'UMS1005', name: 'Amit Patel', gender: 'Male', classGrade: '6', school: 'Government School' },
            ];

            for (const s of students) {
                run(
                    `INSERT INTO students (id, name, full_name, gender, class_grade, school_name, status, enrollment_date, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), datetime('now'))`,
                    [s.id, s.name, s.name, s.gender, s.classGrade, s.school, 'active']
                );
            }
            console.log(`[Seed] ✓ Created ${students.length} sample students with UMS-IDs`);
        } else {
            console.log('[Seed] - Students already exist');
        }

        // ==================== SESSIONS ====================
        const existingSessions = query('SELECT COUNT(*) as count FROM sessions');
        if ((existingSessions[0] as any).count === 0) {
            console.log('[Seed] Creating sample sessions...');
            const today = new Date().toISOString().split('T')[0];
            const sessionId = uuidv4();
            // Need a creator ID. Try to get super admin
            const admin = query("SELECT id FROM users WHERE role='super_admin' LIMIT 1");
            const creatorId = admin[0]?.id || uuidv4(); // Fallback if no admin (unlikely due to above)

            run(
                `INSERT INTO sessions (id, title, date, session_date, start_time, end_time, location, status, created_by, created_at, updated_at)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                [sessionId, 'Morning Math Class', today, today, '09:00', '10:30', 'Community Center', 'scheduled', creatorId]
            );
            console.log('[Seed] ✓ Created sample session');
        } else {
            console.log('[Seed] - Sessions already exist');
        }

        // ==================== CONTACT MESSAGES (for count test) ====================
        // Optional

        // ==================== DONE ====================
        console.log('\n[Seed] ✅ Database seeding complete!');

    } catch (error) {
        console.error('[Seed] Error:', error);
    } finally {
        closeDb();
    }
}

seed();
