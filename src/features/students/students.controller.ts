import chalk from 'chalk';
import { Request, Response } from 'express';
import { StudentsService } from './students.service.js';

export class StudentsController {
    static async getAllStudents(req: Request, res: Response) {
        try {
            const students = await StudentsService.getAllStudents({
                status: req.query.status as string,
                classGrade: req.query.classGrade as string
            });
            res.json(students);
        } catch (error) {
            console.error(chalk.red('[Students] Get all error:'),  error);
            res.status(500).json({ error: 'Failed to get students' });
        }
    }

    static async getStudentById(req: Request, res: Response) {
        try {
            const student = await StudentsService.getStudentById(req.params.id);
            if (!student) return res.status(404).json({ error: 'Student not found' });
            res.json(student);
        } catch (error) {
            console.error(chalk.red('[Students] Get by ID error:'),  error);
            res.status(500).json({ error: 'Failed to get student' });
        }
    }

    static async createStudent(req: Request, res: Response) {
        try {
            const student = await StudentsService.createStudent(req.body);
            res.status(201).json(student);
        } catch (error: any) {
            console.error(chalk.red('[Students] Create error:'),  error);
            if (error.message === 'Name is required') return res.status(400).json({ error: error.message });
            res.status(500).json({ error: 'Failed to create student' });
        }
    }

    static async updateStudent(req: Request, res: Response) {
        try {
            const updated = await StudentsService.updateStudent(req.params.id, req.body);
            res.json(updated);
        } catch (error: any) {
            console.error(chalk.red('[Students] Update error:'),  error);
            if (error.message === 'Student not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to update student' });
        }
    }

    static async deleteStudent(req: Request, res: Response) {
        try {
            await StudentsService.deleteStudent(req.params.id);
            res.json({ message: 'Student deleted successfully' });
        } catch (error: any) {
            console.error(chalk.red('[Students] Delete error:'),  error);
            if (error.message === 'Student not found') return res.status(404).json({ error: error.message });
            res.status(500).json({ error: 'Failed to delete student' });
        }
    }
}
