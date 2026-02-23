
import 'dotenv/config';
// import fetch from 'node-fetch'; // Using native fetch in Node 18+

const BASE_URL = `http://localhost:${process.env.PORT || 3001}/api`;
let SUPER_ADMIN_TOKEN = '';
let VOLUNTEER_TOKEN = '';
let CREATED_VOLUNTEER_ID = '';
let CREATED_SESSION_ID = '';
let CREATED_EVENT_ID = '';
let CREATED_NOTICE_ID = '';
let CREATED_APPLICATION_ID = '';

const COLORS = {
    reset: "\x1b[0m",
    green: "\x1b[32m",
    red: "\x1b[31m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m"
};

function log(type: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN', message: string, data?: any) {
    const color = type === 'SUCCESS' ? COLORS.green : type === 'ERROR' ? COLORS.red : type === 'WARN' ? COLORS.yellow : COLORS.blue;
    console.log(`${color}[${type}] ${message}${COLORS.reset}`);
    if (data) console.log(JSON.stringify(data, null, 2));
}

async function request(method: string, endpoint: string, token?: string, body?: any) {
    try {
        const headers: any = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        console.log(`\n${method} ${endpoint}`);
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            method,
            headers,
            body: body ? JSON.stringify(body) : undefined
        });

        const data = await response.json();
        return { status: response.status, data };
    } catch (error) {
        log('ERROR', `Request failed: ${method} ${endpoint}`, error);
        return { status: 500, data: { error: 'Network error' } };
    }
}

async function testAuth() {
    log('INFO', '=== Testing Auth Endpoints ===');

    // 1. Login Super Admin
    let res = await request('POST', '/auth/login', undefined, {
        email: 'preet@umeed.org',
        password: 'admin2026'
    });
    if (res.status === 200 && res.data.token) {
        SUPER_ADMIN_TOKEN = res.data.token;
        log('SUCCESS', 'Login Super Admin');
    } else {
        log('ERROR', 'Login Super Admin failed', res.data);
        process.exit(1);
    }

    // 2. Login Volunteer
    res = await request('POST', '/auth/login', undefined, {
        email: 'volunteer@umeed.org',
        password: 'volunteer2026'
    });
    if (res.status === 200 && res.data.token) {
        VOLUNTEER_TOKEN = res.data.token;
        log('SUCCESS', 'Login Volunteer');
    } else {
        log('ERROR', 'Login Volunteer failed', res.data);
    }

    // 3. Register New User
    let registerEmail = `test.user.${Date.now()}@example.com`;
    let registerPass = 'password123';
    res = await request('POST', '/auth/register', undefined, {
        email: registerEmail,
        password: registerPass,
        fullName: 'Test Register User'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Register User');
    } else {
        log('ERROR', 'Register User failed', res.data);
    }

    // 4. Login with New User
    res = await request('POST', '/auth/login', undefined, {
        email: registerEmail,
        password: registerPass
    });
    if (res.status === 200) {
        log('SUCCESS', 'Login New User');
        const newUserToken = res.data.token;

        // 5. Change Password
        let newPass = 'newpassword456';
        res = await request('POST', '/auth/change-password', newUserToken, {
            currentPassword: registerPass,
            newPassword: newPass
        });
        if (res.status === 200) {
            log('SUCCESS', 'Change Password');

            // 6. Login with New Password
            res = await request('POST', '/auth/login', undefined, {
                email: registerEmail,
                password: newPass
            });
            if (res.status === 200) {
                log('SUCCESS', 'Login with New Password');
            } else {
                log('ERROR', 'Login with New Password failed', res.data);
            }
        } else {
            log('ERROR', 'Change Password failed', res.data);
        }
    } else {
        log('ERROR', 'Login New User failed', res.data);
    }

    // 7. Get Me (Admin)
    res = await request('GET', '/auth/me', SUPER_ADMIN_TOKEN);
    if (res.status === 200) {
        log('SUCCESS', 'Get Me (Admin)');
    } else {
        log('ERROR', 'Get Me failed', res.data);
    }
}

async function testUsers() {
    log('INFO', '=== Testing Users Endpoints ===');
    let res = await request('GET', '/users', SUPER_ADMIN_TOKEN);
    if (res.status === 200) {
        log('SUCCESS', `List Users (Found ${res.data.length})`);
    } else {
        log('ERROR', 'List Users failed', res.data);
    }
}

async function testVolunteers() {
    log('INFO', '=== Testing Volunteers Endpoints ===');

    // Create
    let res = await request('POST', '/volunteers', SUPER_ADMIN_TOKEN, {
        name: 'New Volunteer',
        email: `new.vol.${Date.now()}@test.com`,
        phone: '1234567890',
        status: 'approved'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Create Volunteer');
        CREATED_VOLUNTEER_ID = res.data.id;
    } else {
        log('ERROR', 'Create Volunteer failed', res.data);
    }

    // List
    res = await request('GET', '/volunteers', SUPER_ADMIN_TOKEN);
    if (res.status === 200) {
        log('SUCCESS', `List Volunteers (Found ${res.data.length})`);
    } else {
        log('ERROR', 'List Volunteers failed', res.data);
    }

    // Get One
    if (CREATED_VOLUNTEER_ID) {
        res = await request('GET', `/volunteers/${CREATED_VOLUNTEER_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Get Volunteer');
        else log('ERROR', 'Get Volunteer failed', res.data);

        // Update
        res = await request('PATCH', `/volunteers/${CREATED_VOLUNTEER_ID}`, SUPER_ADMIN_TOKEN, {
            phone: '9876543210'
        });
        if (res.status === 200) log('SUCCESS', 'Update Volunteer');
        else log('ERROR', 'Update Volunteer failed', res.data);

        // Delete
        res = await request('DELETE', `/volunteers/${CREATED_VOLUNTEER_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Delete Volunteer');
        else log('ERROR', 'Delete Volunteer failed', res.data);
    }
}

async function testStudents() {
    log('INFO', '=== Testing Students Endpoints ===');
    // We already tested students thoroughly, keeping it brief
    let res = await request('GET', '/students', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Students (Found ${res.data.length || 0})`);
    else log('ERROR', 'List Students failed', res.data);
}

async function testSessions() {
    log('INFO', '=== Testing Sessions Endpoints ===');

    // Create
    let res = await request('POST', '/sessions', SUPER_ADMIN_TOKEN, {
        title: 'Test Session',
        date: '2026-05-01',
        startTime: '10:00',
        endTime: '11:00',
        status: 'scheduled'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Create Session');
        CREATED_SESSION_ID = res.data.id;
    } else {
        log('ERROR', 'Create Session failed', res.data);
    }

    // List
    res = await request('GET', '/sessions', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Sessions (Found ${res.data.length})`);

    // Get One
    if (CREATED_SESSION_ID) {
        res = await request('GET', `/sessions/${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Get Session');
        else log('ERROR', 'Get Session failed', res.data);

        // Update
        res = await request('PATCH', `/sessions/${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN, {
            title: 'Updated Session'
        });
        if (res.status === 200) log('SUCCESS', 'Update Session');
        else log('ERROR', 'Update Session failed', res.data);

        // Delete
        res = await request('DELETE', `/sessions/${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Delete Session');
        else log('ERROR', 'Delete Session failed', res.data);
    }
}

async function testAttendance() {
    log('INFO', '=== Testing Attendance Endpoints ===');

    if (!CREATED_SESSION_ID) {
        log('WARN', 'Skipping Attendance test (No Session ID)');
        return;
    }

    // 1. Get a Student ID
    let studentId = '';
    let res = await request('GET', '/students', SUPER_ADMIN_TOKEN);
    if (res.status === 200 && res.data.length > 0) {
        studentId = res.data[0].id;
    } else {
        log('WARN', 'Skipping Attendance test (No Students found)');
        return;
    }

    // 2. Mark Student Attendance
    res = await request('POST', '/attendance/students', SUPER_ADMIN_TOKEN, {
        sessionId: CREATED_SESSION_ID,
        studentId: studentId,
        status: 'present',
        remark: 'Test Remark'
    });
    if (res.status === 200) log('SUCCESS', 'Mark Student Attendance');
    else log('ERROR', 'Mark Student Attendance failed', res.data);

    // 3. Get Student Attendance for Session
    res = await request('GET', `/attendance/students/${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN);
    if (res.status === 200) {
        const record = res.data.find((r: any) => r.student_id === studentId);
        if (record && record.status === 'present') {
            log('SUCCESS', 'Get Student Attendance (Verified)');
        } else {
            log('ERROR', 'Get Student Attendance failed (Record mismatch)', res.data);
        }
    } else {
        log('ERROR', 'Get Student Attendance List failed', res.data);
    }

    // 4. Mark Volunteer Attendance (using created volunteer)
    if (CREATED_VOLUNTEER_ID) {
        res = await request('POST', '/attendance/volunteers', SUPER_ADMIN_TOKEN, {
            sessionId: CREATED_SESSION_ID,
            volunteerId: CREATED_VOLUNTEER_ID,
            status: 'present'
        });
        if (res.status === 200) log('SUCCESS', 'Mark Volunteer Attendance');
        else log('ERROR', 'Mark Volunteer Attendance failed', res.data);

        // 5. Get Volunteer Attendance
        res = await request('GET', `/attendance/volunteers/${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) {
            log('SUCCESS', `Get Volunteer Attendance (Found ${res.data.length})`);
        } else {
            log('ERROR', 'Get Volunteer Attendance failed', res.data);
        }
    }

    // 6. Test Legacy/Frontend Aliases
    if (CREATED_SESSION_ID) {
        // GET /api/student_attendance?session_id=...
        res = await request('GET', `/student_attendance?session_id=${CREATED_SESSION_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Get Student Attendance via Alias');
        else log('ERROR', 'Get Student Attendance via Alias failed', res.data);
    }
}

async function testEvents() {
    log('INFO', '=== Testing Events Endpoints ===');

    let res = await request('POST', '/events', SUPER_ADMIN_TOKEN, {
        title: 'Test Event',
        date: '2026-06-01',
        description: 'Test Description'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Create Event');
        CREATED_EVENT_ID = res.data.id;
    } else {
        log('ERROR', 'Create Event failed', res.data);
    }

    res = await request('GET', '/events', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Events (Found ${res.data.length})`);

    if (CREATED_EVENT_ID) {
        res = await request('DELETE', `/events/${CREATED_EVENT_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Delete Event');
    }
}

async function testNotices() {
    log('INFO', '=== Testing Notices Endpoints ===');

    let res = await request('POST', '/notices', SUPER_ADMIN_TOKEN, {
        title: 'Test Notice',
        description: 'Public Notice',
        visibility: 'public'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Create Notice');
        CREATED_NOTICE_ID = res.data.id;
    } else {
        log('ERROR', 'Create Notice failed', res.data);
    }

    res = await request('GET', '/notices', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Notices (Found ${res.data.length})`);

    if (CREATED_NOTICE_ID) {
        res = await request('DELETE', `/notices/${CREATED_NOTICE_ID}`, SUPER_ADMIN_TOKEN);
        if (res.status === 200) log('SUCCESS', 'Delete Notice');
    }
}

async function testApplications() {
    log('INFO', '=== Testing Volunteer Applications ===');

    let res = await request('POST', '/volunteer_applications', undefined, {
        full_name: 'Applicant',
        email: 'applicant@test.com',
        motivation: 'I want to help'
    });
    if (res.status === 201) {
        log('SUCCESS', 'Submit Application');
        CREATED_APPLICATION_ID = res.data.id;
    } else {
        log('ERROR', 'Submit Application failed', res.data);
    }

    res = await request('GET', '/volunteer_applications', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Applications (Found ${res.data.length})`);
}

async function testContact() {
    log('INFO', '=== Testing Contact Messages ===');

    let res = await request('POST', '/contact_messages', undefined, {
        name: 'Contact User',
        email: 'contact@test.com',
        message: 'Hello'
    });
    if (res.status === 201) log('SUCCESS', 'Submit Contact Message');
    else log('ERROR', 'Submit Contact Message failed', res.data);

    res = await request('GET', '/contact_messages', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', `List Messages (Found ${res.data.length})`);
}

async function testSettings() {
    log('INFO', '=== Testing Settings ===');

    let res = await request('POST', '/app_settings', SUPER_ADMIN_TOKEN, {
        key: 'site_title',
        value: 'Umeed'
    });
    // Might fail if exists, so check for 201 or 200/409
    if (res.status === 201 || res.status === 200) log('SUCCESS', 'Set Setting');
    else if (res.status === 409) log('SUCCESS', 'Set Setting (Already exists)');
    else log('ERROR', 'Set Setting failed', res.data);

    res = await request('GET', '/app_settings', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', 'Get Settings');

    res = await request('DELETE', '/app_settings/site_title', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', 'Delete Setting');
    else log('ERROR', 'Delete Setting failed', res.data);
}

async function testContent() {
    log('INFO', '=== Testing Content ===');

    // Create/Update
    let res = await request('POST', '/content', SUPER_ADMIN_TOKEN, {
        section: 'home',
        key: 'hero_title',
        value: 'Welcome to Umeed',
        type: 'text'
    });
    if (res.status === 200) log('SUCCESS', 'Save Content');
    else log('ERROR', 'Save Content failed', res.data);

    // Get
    res = await request('GET', '/content/home', undefined);
    if (res.status === 200) log('SUCCESS', 'Get Content (Public)');
    else log('ERROR', 'Get Content failed', res.data);

    // Delete
    res = await request('DELETE', '/content/home/hero_title', SUPER_ADMIN_TOKEN);
    if (res.status === 200) log('SUCCESS', 'Delete Content');
    else log('ERROR', 'Delete Content failed', res.data);
}

async function main() {
    try {
        await testAuth();
        await testUsers();
        await testVolunteers();
        await testStudents();
        await testSessions();
        await testAttendance();
        await testEvents();
        await testNotices();
        await testApplications();
        await testContact();
        await testSettings();
        await testContent();

        log('INFO', '=== All Tests Completed ===');
    } catch (error) {
        log('ERROR', 'Test Suite Failed', error);
    }
}

main();
