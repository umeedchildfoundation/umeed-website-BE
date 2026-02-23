/**
 * One-off script to print current DB contents (read-only).
 * Run from backend: npx tsx scripts/show-db.ts
 */

import 'dotenv/config';
import { initializeDatabase, query, closeDb } from '../src/db/index.js';

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  console.log('  ' + title);
  console.log('='.repeat(60));
}

function table(name: string, rows: any[], excludeKeys: string[] = []) {
  console.log(`\n--- ${name} (${rows.length} rows) ---`);
  if (rows.length === 0) {
    console.log('  (empty)');
    return;
  }
  const keys = Object.keys(rows[0]).filter((k) => !excludeKeys.includes(k));
  rows.forEach((row, i) => {
    console.log(`  [${i + 1}]`, keys.map((k) => `${k}: ${row[k] ?? ''}`).join(' | '));
  });
}

async function main() {
  await initializeDatabase();

  section('USERS');
  const users = query('SELECT id, email, full_name, role, created_at FROM users ORDER BY role, email');
  table('users', users);

  section('PROFILES');
  const profiles = query('SELECT id, user_id, email, full_name, role FROM profiles');
  table('profiles', profiles);

  section('VOLUNTEERS');
  const volunteers = query('SELECT id, volunteer_id, name, email, phone, status FROM volunteers');
  table('volunteers', volunteers);

  section('STUDENTS');
  const students = query('SELECT id, full_name, gender, class_grade, parent_contact_number, status FROM students LIMIT 20');
  table('students', students);

  const studentCount = query('SELECT COUNT(*) as c FROM students');
  if (studentCount[0] && (studentCount[0] as any).c > 20) {
    console.log(`  ... and ${(studentCount[0] as any).c - 20} more students`);
  }

  section('SESSIONS');
  const sessions = query('SELECT id, title, date, start_time, end_time, location, status FROM sessions');
  table('sessions', sessions);

  section('APP_SETTINGS');
  const settings = query('SELECT * FROM app_settings');
  table('app_settings', settings);

  closeDb();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
