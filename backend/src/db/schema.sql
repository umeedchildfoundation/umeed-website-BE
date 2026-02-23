-- UMEED Backend SQLite Schema
-- Production-Ready Server-Side Database

-- Users table for authentication
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'volunteer' CHECK(role IN ('volunteer', 'admin', 'super_admin')),
    preferences TEXT,
    raw_user_meta_data TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Profiles table (extended user info)
CREATE TABLE IF NOT EXISTS profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT UNIQUE,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'volunteer' CHECK(role IN ('volunteer', 'admin', 'super_admin')),
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Volunteers table
CREATE TABLE IF NOT EXISTS volunteers (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    volunteer_id TEXT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    address TEXT,
    occupation TEXT,
    skills TEXT,
    preferred_languages TEXT,
    availability TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'inactive')),
    joined_at TEXT,
    profile_picture TEXT,
    documents TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Students table
CREATE TABLE IF NOT EXISTS students (
    id TEXT PRIMARY KEY,
    name TEXT,
    full_name TEXT NOT NULL,
    gender TEXT,
    date_of_birth TEXT,
    school_name TEXT,
    class_grade TEXT,
    parent_name TEXT,
    parent_guardian_name TEXT,
    parent_contact TEXT,
    parent_contact_number TEXT,
    address TEXT,
    area TEXT,
    area_locality TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
    notes TEXT,
    enrollment_date TEXT,
    image_url TEXT,
    roll_number TEXT,
    location_code TEXT,
    documents TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Sessions table
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    title TEXT,
    date TEXT NOT NULL,
    session_date TEXT,
    start_time TEXT,
    end_time TEXT,
    location TEXT,
    notes TEXT,
    status TEXT,
    rsvp_enabled INTEGER DEFAULT 0,
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Session Assignments table
CREATE TABLE IF NOT EXISTS session_assignments (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    volunteer_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Student Attendance table
CREATE TABLE IF NOT EXISTS student_attendance (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    student_id TEXT NOT NULL,
    status TEXT DEFAULT 'absent' CHECK(status IN ('present', 'absent', 'late', 'excused')),
    remark TEXT,
    marked_at TEXT DEFAULT (datetime('now')),
    marked_by TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- Volunteer Attendance table
CREATE TABLE IF NOT EXISTS volunteer_attendance (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    volunteer_id TEXT NOT NULL,
    status TEXT DEFAULT 'absent' CHECK(status IN ('present', 'absent', 'late', 'excused')),
    remark TEXT,
    marked_at TEXT DEFAULT (datetime('now')),
    marked_by TEXT,
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- Events table
CREATE TABLE IF NOT EXISTS events (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    event_date TEXT,
    location TEXT,
    tags TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Event Media table
CREATE TABLE IF NOT EXISTS event_media (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL,
    url TEXT NOT NULL,
    media_type TEXT DEFAULT 'image' CHECK(media_type IN ('image', 'video')),
    caption TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);

-- Media table (general)
CREATE TABLE IF NOT EXISTS media (
    id TEXT PRIMARY KEY,
    event_id TEXT,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'image' CHECK(type IN ('image', 'video')),
    caption TEXT,
    filename TEXT,
    mimetype TEXT,
    size INTEGER,
    uploaded_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE SET NULL
);

-- Notices table
CREATE TABLE IF NOT EXISTS notices (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    date TEXT,
    published_date TEXT,
    attachment_url TEXT,
    visibility TEXT DEFAULT 'public' CHECK(visibility IN ('public', 'internal')),
    created_by TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Volunteer Applications table
CREATE TABLE IF NOT EXISTS volunteer_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    age INTEGER,
    gender TEXT,
    address TEXT,
    occupation TEXT,
    availability TEXT,
    motivation TEXT,
    skills_subjects TEXT,
    preferred_languages TEXT,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'inactive')),
    reviewed_by TEXT,
    reviewed_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Contact Messages table
CREATE TABLE IF NOT EXISTS contact_messages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now'))
);



-- User Roles table
CREATE TABLE IF NOT EXISTS user_roles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'volunteer' CHECK(role IN ('volunteer', 'admin', 'super_admin')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Session RSVPs table
CREATE TABLE IF NOT EXISTS session_rsvps (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    volunteer_id TEXT NOT NULL,
    response TEXT CHECK(response IN ('yes', 'no', 'maybe')),
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (session_id) REFERENCES sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (volunteer_id) REFERENCES volunteers(id) ON DELETE CASCADE
);

-- App Settings table
CREATE TABLE IF NOT EXISTS app_settings (
    id TEXT PRIMARY KEY,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- Site Content table for CMS
CREATE TABLE IF NOT EXISTS site_content (
    id TEXT PRIMARY KEY,
    section TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    type TEXT DEFAULT 'text' CHECK(type IN ('text', 'image', 'number', 'json')),
    updated_at TEXT DEFAULT (datetime('now')),
    UNIQUE(section, key)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_user_id ON volunteers(user_id);
CREATE INDEX IF NOT EXISTS idx_volunteers_email ON volunteers(email);
CREATE INDEX IF NOT EXISTS idx_volunteers_status ON volunteers(status);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_grade);
CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_student_attendance_session ON student_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_volunteer_attendance_session ON volunteer_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_events_date ON events(date);
CREATE INDEX IF NOT EXISTS idx_notices_visibility ON notices(visibility);
CREATE INDEX IF NOT EXISTS idx_volunteer_applications_status ON volunteer_applications(status);
