
import { query } from './db/index.js';
import { initializeDatabase } from './db/index.js';

async function check() {
    await initializeDatabase();
    console.log('--- VOLUNTEERS ---');
    const vols = query("SELECT id, volunteer_id, name, email FROM volunteers");
    console.log(JSON.stringify(vols, null, 2));

    console.log('--- STUDENTS ---');
    const students = query("SELECT id, name FROM students");
    console.log(JSON.stringify(students, null, 2));
}

check();
