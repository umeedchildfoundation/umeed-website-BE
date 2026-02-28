import prismaInstance from '../../db/index.js';
const prisma = prismaInstance!;
import { generateStudentId } from '../../utils/idGenerator.js';

export class StudentsService {
    static async getAllStudents(filters: { status?: string; classGrade?: string }) {
        const where: any = {};
        if (filters.status) where.status = String(filters.status);
        if (filters.classGrade) where.class_grade = String(filters.classGrade);

        return await prisma.students.findMany({
            where,
            orderBy: { created_at: 'desc' }
        });
    }

    static async getStudentById(id: string) {
        return await prisma.students.findUnique({ where: { id } });
    }

    static async createStudent(dataParams: any) {
        const {
            name, fullName, gender, dateOfBirth, schoolName, classGrade,
            parentName, parentGuardianName, parentContact, parentContactNumber,
            address, area, areaLocality, status = 'active', notes, imageUrl,
            rollNumber, locationCode, full_name, date_of_birth, school_name,
            class_grade, parent_name, parent_guardian_name, parent_contact,
            parent_contact_number, area_locality, image_url, roll_number, location_code
        } = dataParams;

        const finalName = fullName || full_name || name;
        if (!finalName) throw new Error('Name is required');

        const studentId = await generateStudentId();

        return await prisma.students.create({
            data: {
                id: studentId,
                name: finalName,
                full_name: finalName,
                gender: gender || null,
                date_of_birth: dateOfBirth || date_of_birth || null,
                school_name: schoolName || school_name || null,
                class_grade: classGrade || class_grade || null,
                parent_name: parentName || parent_name || null,
                parent_guardian_name: parentGuardianName || parent_guardian_name || null,
                parent_contact: parentContact || parent_contact || null,
                parent_contact_number: parentContactNumber || parent_contact_number || null,
                address: address || null,
                area: area || null,
                area_locality: areaLocality || area_locality || null,
                status,
                notes: notes || null,
                image_url: imageUrl || image_url || null,
                roll_number: rollNumber || roll_number || null,
                location_code: locationCode || location_code || null,
                enrollment_date: new Date().toISOString()
            }
        });
    }

    static async updateStudent(id: string, dataParams: any) {
        const existing = await prisma.students.findUnique({ where: { id } });
        if (!existing) throw new Error('Student not found');

        const fields: Record<string, string> = {
            name: 'name', fullName: 'full_name', gender: 'gender', dateOfBirth: 'date_of_birth',
            schoolName: 'school_name', classGrade: 'class_grade', parentName: 'parent_name',
            parentGuardianName: 'parent_guardian_name', parentContact: 'parent_contact',
            parentContactNumber: 'parent_contact_number', address: 'address', area: 'area',
            areaLocality: 'area_locality', status: 'status', notes: 'notes', imageUrl: 'image_url',
            rollNumber: 'roll_number', locationCode: 'location_code'
        };

        const data: any = {};
        for (const [jsField, dbField] of Object.entries(fields)) {
            if (dataParams[jsField] !== undefined) {
                data[dbField] = dataParams[jsField];
            }
        }

        if (Object.keys(data).length > 0) {
            data.updated_at = new Date().toISOString();
        }

        return await prisma.students.update({
            where: { id },
            data
        });
    }

    static async deleteStudent(id: string) {
        const existing = await prisma.students.findUnique({ where: { id } });
        if (!existing) throw new Error('Student not found');

        await prisma.students.delete({ where: { id } });
        return true;
    }
}
