/**
 * Database Viewer Script
 * Uses the existing database utilities
 */

import { query, initializeDatabase } from './db/index.js';

// Initialize database first
await initializeDatabase();

console.log('\n📊 UMEED Database Contents\n');
console.log('='.repeat(80));

// List all tables
const tables = query(`
  SELECT name FROM sqlite_master 
  WHERE type='table' 
  AND name NOT LIKE 'sqlite_%'
  ORDER BY name
`);

console.log('\n📋 Database Tables:');
tables.forEach((table: any) => {
    const count = query(`SELECT COUNT(*) as count FROM ${table.name}`)[0];
    console.log(`  ✓ ${table.name.padEnd(30)} (${count.count} records)`);
});

console.log('\n' + '='.repeat(80));

// Users
console.log('\n👥 USERS:');
const users = query('SELECT id, email, full_name, role FROM users');
console.table(users);

// Students (first 10)
console.log('\n👨‍🎓 STUDENTS (first 10):');
const students = query(`
  SELECT id, full_name, class_grade, school_name, status 
  FROM students 
  ORDER BY created_at DESC 
  LIMIT 10
`);
console.table(students);

// Volunteers (first 10)
console.log('\n🙋 VOLUNTEERS (first 10):');
const volunteers = query(`
  SELECT id, volunteer_id, name, email, phone, status 
  FROM volunteers 
  ORDER BY created_at DESC 
  LIMIT 10
`);
console.table(volunteers);

// Sessions (first 10)
console.log('\n📅 SESSIONS (first 10):');
const sessions = query(`
  SELECT id, title, date, start_time, end_time, location, status 
  FROM sessions 
  ORDER BY date DESC 
  LIMIT 10
`);
console.table(sessions);

// Notices (first 5)
console.log('\n📢 NOTICES (first 5):');
const notices = query(`
  SELECT id, title, date, visibility 
  FROM notices 
  ORDER BY created_at DESC 
  LIMIT 5
`);
console.table(notices);

// Events (first 5)
console.log('\n🎉 EVENTS (first 5):');
const events = query(`
  SELECT id, title, date, location 
  FROM events 
  ORDER BY date DESC 
  LIMIT 5
`);
console.table(events);

console.log('\n' + '='.repeat(80));

// Summary
console.log('\n📊 RECORD SUMMARY:');
const summary = {
    'Users': query('SELECT COUNT(*) as count FROM users')[0],
    'Students': query('SELECT COUNT(*) as count FROM students')[0],
    'Volunteers': query('SELECT COUNT(*) as count FROM volunteers')[0],
    'Sessions': query('SELECT COUNT(*) as count FROM sessions')[0],
    'Notices': query('SELECT COUNT(*) as count FROM notices')[0],
    'Events': query('SELECT COUNT(*) as count FROM events')[0],
    'Student Attendance': query('SELECT COUNT(*) as count FROM student_attendance')[0],
    'Volunteer Attendance': query('SELECT COUNT(*) as count FROM volunteer_attendance')[0]
};
console.table(summary);

console.log('\n' + '='.repeat(80));
console.log('\n✅ Database viewing complete!\n');
