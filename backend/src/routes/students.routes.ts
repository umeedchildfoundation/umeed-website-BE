/**
 * Students Routes
 * 
 * CRUD operations for student management
 */

import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { query, queryOne, run } from '../db/index.js';
import { generateStudentId } from '../utils/idGenerator.js';
import { requireAuth } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/role.middleware.js';

const router = Router();

/**
 * GET /api/students
 * Get all students
 */
router.get('/', requireAuth, (req: Request, res: Response) => {
    try {
        const { status, classGrade } = req.query;

        let sql = 'SELECT * FROM students WHERE 1=1';
        const params: any[] = [];

        if (status) {
            sql += ' AND status = ?';
            params.push(status);
        }
        if (classGrade) {
            sql += ' AND class_grade = ?';
            params.push(classGrade);
        }

        sql += ' ORDER BY created_at DESC';

        const students = query(sql, params);
        res.json(students);
    } catch (error) {
        console.error('[Students] Get all error:', error);
        res.status(500).json({ error: 'Failed to get students' });
    }
});

/**
 * GET /api/students/:id
 * Get student by ID
 */
router.get('/:id', requireAuth, (req: Request, res: Response) => {
    try {
        const student = queryOne('SELECT * FROM students WHERE id = ?', [req.params.id]);

        if (!student) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        res.json(student);
    } catch (error) {
        console.error('[Students] Get by ID error:', error);
        res.status(500).json({ error: 'Failed to get student' });
    }
});

/**
 * POST /api/students
 * Create a new student (admin only)
 */
router.post('/', requireAuth, requireAdmin, (req: Request, res: Response) => {
    console.log('[Students] Create request:', req.body);
    try {
        const {
            name,
            fullName,
            gender,
            dateOfBirth,
            schoolName,
            classGrade,
            parentName,
            parentGuardianName,
            parentContact,
            parentContactNumber,
            address,
            area,
            areaLocality,
            status = 'active',
            notes,
            imageUrl,
            rollNumber,
            locationCode
        } = req.body;

        // Support both camelCase and snake_case
        const finalName = fullName || req.body.full_name || name;
        const finalDateOfBirth = dateOfBirth || req.body.date_of_birth;
        const finalSchoolName = schoolName || req.body.school_name;
        const finalClassGrade = classGrade || req.body.class_grade;
        const finalParentName = parentName || req.body.parent_name;
        const finalParentGuardianName = parentGuardianName || req.body.parent_guardian_name;
        const finalParentContact = parentContact || req.body.parent_contact;
        const finalParentContactNumber = parentContactNumber || req.body.parent_contact_number;
        const finalAreaLocality = areaLocality || req.body.area_locality;
        const finalImageUrl = imageUrl || req.body.image_url;
        const finalRollNumber = rollNumber || req.body.roll_number;
        const finalLocationCode = locationCode || req.body.location_code;

        if (!finalName) {
            res.status(400).json({ error: 'Name is required' });
            return;
        }

        const id = generateStudentId();

        run(
            `INSERT INTO students (id, name, full_name, gender, date_of_birth, school_name, class_grade, parent_name, parent_guardian_name, parent_contact, parent_contact_number, address, area, area_locality, status, notes, enrollment_date, image_url, roll_number, location_code, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?, ?, ?, datetime('now'), datetime('now'))`,
            [
                id,
                finalName,
                finalName,
                gender || null,
                finalDateOfBirth || null,
                finalSchoolName || null,
                finalClassGrade || null,
                finalParentName || null,
                finalParentGuardianName || null,
                finalParentContact || null,
                finalParentContactNumber || null,
                address || null,
                area || null,
                finalAreaLocality || null,
                status,
                notes || null,
                finalImageUrl || null,
                finalRollNumber || null,
                finalLocationCode || null
            ]
        );

        const student = queryOne('SELECT * FROM students WHERE id = ?', [id]);
        res.status(201).json(student);
    } catch (error) {
        console.error('[Students] Create error:', error);
        res.status(500).json({ error: 'Failed to create student' });
    }
});

/**
 * PATCH /api/students/:id
 * Update student
 */
router.patch('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM students WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        const fields: Record<string, string> = {
            name: 'name',
            fullName: 'full_name',
            gender: 'gender',
            dateOfBirth: 'date_of_birth',
            schoolName: 'school_name',
            classGrade: 'class_grade',
            parentName: 'parent_name',
            parentGuardianName: 'parent_guardian_name',
            parentContact: 'parent_contact',
            parentContactNumber: 'parent_contact_number',
            address: 'address',
            area: 'area',
            areaLocality: 'area_locality',
            status: 'status',
            notes: 'notes',
            imageUrl: 'image_url',
            rollNumber: 'roll_number',
            locationCode: 'location_code'
        };

        const updates: string[] = [];
        const values: any[] = [];

        for (const [jsField, dbField] of Object.entries(fields)) {
            if (req.body[jsField] !== undefined) {
                updates.push(`${dbField} = ?`);
                values.push(req.body[jsField]);
            }
        }

        if (updates.length > 0) {
            updates.push('updated_at = datetime("now")');
            values.push(targetId);
            run(`UPDATE students SET ${updates.join(', ')} WHERE id = ?`, values);
        }

        const updated = queryOne('SELECT * FROM students WHERE id = ?', [targetId]);
        res.json(updated);
    } catch (error) {
        console.error('[Students] Update error:', error);
        res.status(500).json({ error: 'Failed to update student' });
    }
});

/**
 * DELETE /api/students/:id
 * Delete student (admin only)
 */
router.delete('/:id', requireAuth, requireAdmin, (req: Request, res: Response) => {
    try {
        const targetId = req.params.id;
        const existing = queryOne('SELECT id FROM students WHERE id = ?', [targetId]);

        if (!existing) {
            res.status(404).json({ error: 'Student not found' });
            return;
        }

        run('DELETE FROM students WHERE id = ?', [targetId]);
        res.json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error('[Students] Delete error:', error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
});

export default router;
