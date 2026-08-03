/**
 * Swagger/OpenAPI Configuration
 * 
 * Defines the OpenAPI 3.0 specification for UMEED Backend API
 */

import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'UMEED Children Foundation API',
            version: '1.0.0',
            description: 'REST API for UMEED Children Foundation management system',
            contact: {
                name: 'UMEED Development Team',
                email: 'dev@umeed.org'
            }
        },
        servers: [
            {
                url: 'http://localhost:3001',
                description: 'Development server'
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    description: 'Enter your JWT token'
                }
            },
            schemas: {
                Error: {
                    type: 'object',
                    properties: {
                        error: {
                            type: 'string',
                            description: 'Error message'
                        }
                    }
                },
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        email: { type: 'string', format: 'email' },
                        fullName: { type: 'string' },
                        role: { type: 'string', enum: ['super_admin', 'admin', 'volunteer'] },
                        avatarUrl: { type: 'string', nullable: true },
                        volunteerId: { type: 'string', nullable: true },
                        volunteerStatus: { type: 'string', nullable: true }
                    }
                },
                Student: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        name: { type: 'string' },
                        full_name: { type: 'string' },
                        gender: { type: 'string', enum: ['male', 'female', 'other'] },
                        date_of_birth: { type: 'string', format: 'date' },
                        school_name: { type: 'string' },
                        class_grade: { type: 'string' },
                        parent_name: { type: 'string' },
                        parent_contact_number: { type: 'string' },
                        address: { type: 'string' },
                        area: { type: 'string' },
                        status: { type: 'string', enum: ['active', 'inactive'] },
                        image_url: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Volunteer: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        volunteer_id: { type: 'string' },
                        name: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        phone: { type: 'string' },
                        age: { type: 'integer' },
                        gender: { type: 'string' },
                        address: { type: 'string' },
                        occupation: { type: 'string' },
                        skills: { type: 'string' },
                        status: { type: 'string', enum: ['pending', 'active', 'inactive'] },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Session: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        start_time: { type: 'string' },
                        end_time: { type: 'string' },
                        location: { type: 'string' },
                        status: { type: 'string', enum: ['scheduled', 'completed', 'cancelled'] },
                        notes: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Notice: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        visibility: { type: 'string', enum: ['public', 'internal'] },
                        attachment_url: { type: 'string', nullable: true },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                },
                Event: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        description: { type: 'string' },
                        date: { type: 'string', format: 'date' },
                        location: { type: 'string' },
                        tags: { type: 'string' },
                        created_at: { type: 'string', format: 'date-time' }
                    }
                }
            }
        },
        tags: [
            { name: 'Authentication', description: 'User authentication and profile management' },
            { name: 'Students', description: 'Student management operations' },
            { name: 'Volunteers', description: 'Volunteer management operations' },
            { name: 'Sessions', description: 'Session scheduling and management' },
            { name: 'Attendance', description: 'Attendance tracking for students and volunteers' },
            { name: 'Notices', description: 'Notice and announcement management' },
            { name: 'Events', description: 'Event management' },
            { name: 'Media', description: 'File upload and media management' }
        ],
        paths: {
            '/api/auth/register': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Register a new user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email' },
                                        password: { type: 'string', minLength: 6 },
                                        fullName: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': {
                            description: 'User created successfully',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: { type: 'string' },
                                            token: { type: 'string' },
                                            user: { $ref: '#/components/schemas/User' }
                                        }
                                    }
                                }
                            }
                        },
                        '400': { description: 'Invalid input', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
                        '409': { description: 'User already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/auth/login': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Login user',
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['email', 'password'],
                                    properties: {
                                        email: { type: 'string', format: 'email', example: 'admin@umeed.org' },
                                        password: { type: 'string', example: 'admin2026' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': {
                            description: 'Login successful',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            token: { type: 'string' },
                                            user: { $ref: '#/components/schemas/User' }
                                        }
                                    }
                                }
                            }
                        },
                        '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/auth/me': {
                get: {
                    tags: ['Authentication'],
                    summary: 'Get current user',
                    security: [{ bearerAuth: [] }],
                    responses: {
                        '200': { description: 'Current user', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } },
                        '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                },
                patch: {
                    tags: ['Authentication'],
                    summary: 'Update current user profile',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        fullName: { type: 'string' },
                                        avatarUrl: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/User' } } } }
                    }
                }
            },
            '/api/auth/change-password': {
                post: {
                    tags: ['Authentication'],
                    summary: 'Change password',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['currentPassword', 'newPassword'],
                                    properties: {
                                        currentPassword: { type: 'string' },
                                        newPassword: { type: 'string', minLength: 6 }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Password changed successfully' },
                        '401': { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/students': {
                get: {
                    tags: ['Students'],
                    summary: 'Get all students',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } },
                        { name: 'classGrade', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: {
                        '200': { description: 'List of students', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Student' } } } } }
                    }
                },
                post: {
                    tags: ['Students'],
                    summary: 'Create a new student (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['fullName'],
                                    properties: {
                                        fullName: { type: 'string' },
                                        gender: { type: 'string' },
                                        dateOfBirth: { type: 'string', format: 'date' },
                                        schoolName: { type: 'string' },
                                        classGrade: { type: 'string' },
                                        parentName: { type: 'string' },
                                        parentContactNumber: { type: 'string' },
                                        address: { type: 'string' },
                                        status: { type: 'string', default: 'active' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Student created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
                        '403': { description: 'Admin access required', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/students/{id}': {
                get: {
                    tags: ['Students'],
                    summary: 'Get student by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Student details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } },
                        '404': { description: 'Student not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                },
                patch: {
                    tags: ['Students'],
                    summary: 'Update student (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    requestBody: {
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        fullName: { type: 'string' },
                                        classGrade: { type: 'string' },
                                        status: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Student updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Student' } } } }
                    }
                },
                delete: {
                    tags: ['Students'],
                    summary: 'Delete student (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Student deleted' },
                        '404': { description: 'Student not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            },
            '/api/volunteers': {
                get: {
                    tags: ['Volunteers'],
                    summary: 'Get all volunteers',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'List of volunteers', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Volunteer' } } } } }
                    }
                },
                post: {
                    tags: ['Volunteers'],
                    summary: 'Create volunteer (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['name', 'email'],
                                    properties: {
                                        name: { type: 'string' },
                                        email: { type: 'string', format: 'email' },
                                        phone: { type: 'string' },
                                        age: { type: 'integer' },
                                        gender: { type: 'string' },
                                        skills: { type: 'string' },
                                        status: { type: 'string', default: 'pending' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Volunteer created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Volunteer' } } } }
                    }
                }
            },
            '/api/volunteers/{id}': {
                get: {
                    tags: ['Volunteers'],
                    summary: 'Get volunteer by ID',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Volunteer details', content: { 'application/json': { schema: { $ref: '#/components/schemas/Volunteer' } } } }
                    }
                },
                patch: {
                    tags: ['Volunteers'],
                    summary: 'Update volunteer (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Volunteer updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/Volunteer' } } } }
                    }
                },
                delete: {
                    tags: ['Volunteers'],
                    summary: 'Delete volunteer (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Volunteer deleted' }
                    }
                }
            },
            '/api/sessions': {
                get: {
                    tags: ['Sessions'],
                    summary: 'Get all sessions',
                    security: [{ bearerAuth: [] }],
                    parameters: [
                        { name: 'date', in: 'query', schema: { type: 'string', format: 'date' } },
                        { name: 'status', in: 'query', schema: { type: 'string' } }
                    ],
                    responses: {
                        '200': { description: 'List of sessions', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Session' } } } } }
                    }
                },
                post: {
                    tags: ['Sessions'],
                    summary: 'Create session (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['date'],
                                    properties: {
                                        title: { type: 'string' },
                                        date: { type: 'string', format: 'date' },
                                        startTime: { type: 'string' },
                                        endTime: { type: 'string' },
                                        location: { type: 'string' },
                                        status: { type: 'string', default: 'scheduled' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Session created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Session' } } } }
                    }
                }
            },
            '/api/sessions/{id}': {
                get: {
                    tags: ['Sessions'],
                    summary: 'Get session by ID with assignments',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Session details with assignments' }
                    }
                },
                patch: {
                    tags: ['Sessions'],
                    summary: 'Update session (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Session updated' }
                    }
                },
                delete: {
                    tags: ['Sessions'],
                    summary: 'Delete session (Admin only)',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Session deleted' }
                    }
                }
            },
            '/api/attendance/students/{sessionId}': {
                get: {
                    tags: ['Attendance'],
                    summary: 'Get student attendance for session',
                    security: [{ bearerAuth: [] }],
                    parameters: [{ name: 'sessionId', in: 'path', required: true, schema: { type: 'string' } }],
                    responses: {
                        '200': { description: 'Student attendance records' }
                    }
                }
            },
            '/api/attendance/students': {
                post: {
                    tags: ['Attendance'],
                    summary: 'Mark student attendance',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['sessionId', 'studentId', 'status'],
                                    properties: {
                                        sessionId: { type: 'string' },
                                        studentId: { type: 'string' },
                                        status: { type: 'string', enum: ['present', 'absent', 'late'] },
                                        remark: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Attendance marked successfully' }
                    }
                }
            },
            '/api/attendance/students/bulk': {
                post: {
                    tags: ['Attendance'],
                    summary: 'Bulk mark student attendance (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['sessionId', 'attendanceRecords'],
                                    properties: {
                                        sessionId: { type: 'string' },
                                        attendanceRecords: {
                                            type: 'array',
                                            items: {
                                                type: 'object',
                                                properties: {
                                                    studentId: { type: 'string' },
                                                    status: { type: 'string' },
                                                    remark: { type: 'string' }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '200': { description: 'Bulk attendance marked' }
                    }
                }
            },
            '/api/notices': {
                get: {
                    tags: ['Notices'],
                    summary: 'Get all notices (public for unauthenticated)',
                    responses: {
                        '200': { description: 'List of notices', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Notice' } } } } }
                    }
                },
                post: {
                    tags: ['Notices'],
                    summary: 'Create notice (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title'],
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        date: { type: 'string', format: 'date' },
                                        visibility: { type: 'string', enum: ['public', 'internal'], default: 'public' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Notice created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Notice' } } } }
                    }
                }
            },
            '/api/events': {
                get: {
                    tags: ['Events'],
                    summary: 'Get all events (public)',
                    responses: {
                        '200': { description: 'List of events', content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Event' } } } } }
                    }
                },
                post: {
                    tags: ['Events'],
                    summary: 'Create event (Admin only)',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'application/json': {
                                schema: {
                                    type: 'object',
                                    required: ['title', 'date'],
                                    properties: {
                                        title: { type: 'string' },
                                        description: { type: 'string' },
                                        date: { type: 'string', format: 'date' },
                                        location: { type: 'string' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'Event created', content: { 'application/json': { schema: { $ref: '#/components/schemas/Event' } } } }
                    }
                }
            },
            '/api/media/upload': {
                post: {
                    tags: ['Media'],
                    summary: 'Upload a file',
                    security: [{ bearerAuth: [] }],
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    required: ['file'],
                                    properties: {
                                        file: { type: 'string', format: 'binary', description: 'File to upload (max 10MB)' },
                                        eventId: { type: 'string', description: 'Optional event ID to associate' },
                                        caption: { type: 'string', description: 'Optional caption' }
                                    }
                                }
                            }
                        }
                    },
                    responses: {
                        '201': { description: 'File uploaded successfully' },
                        '400': { description: 'No file uploaded or invalid file type', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } }
                    }
                }
            }
        }
    },
    apis: [] // We're using the definition above instead of file scanning
};

export const swaggerSpec = swaggerJsdoc(options);
