/**
 * Temporary dev script — reset Parshwa's volunteer application for FE approval/email testing.
 *
 * 1. Deletes existing application(s) for Parshwa Mehta / parshwamehta.0510@gmail.com
 * 2. Inserts a fresh pending application (same as submitting the public form)
 *
 * Usage: npm run script:parshwa-application
 */
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';
import { getPgPoolConfig } from '../src/shared/pg-pool.config.ts';

dotenv.config();

const APPLICANT = {
  full_name: 'Parshwa Mehta',
  email: 'parshwamehta.0510@gmail.com',
  phone: '9227590139',
  age: 24,
  gender: 'Male',
  address: 'Mumbai, Maharashtra',
  occupation: 'Software Developer',
  availability: 'Weekends and weekday evenings',
  motivation:
    'I want to support UMEED children with tutoring and mentorship during my free time.',
  skills_subjects: ['Mathematics', 'English', 'Computer Basics'],
  preferred_languages: ['English', 'Hindi', 'Marathi'],
};

const pool = new Pool(getPgPoolConfig(process.env.DATABASE_URL || ''));
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔄 Resetting Parshwa volunteer application...\n');

  const deleted = await prisma.volunteer_applications.deleteMany({
    where: {
      OR: [
        { email: { equals: APPLICANT.email, mode: 'insensitive' } },
        { full_name: { equals: APPLICANT.full_name, mode: 'insensitive' } },
      ],
    },
  });

  console.log(`  Deleted ${deleted.count} existing application(s) for Parshwa Mehta`);

  const application = await prisma.volunteer_applications.create({
    data: {
      id: uuidv4(),
      full_name: APPLICANT.full_name,
      email: APPLICANT.email.toLowerCase(),
      phone: APPLICANT.phone,
      age: APPLICANT.age,
      gender: APPLICANT.gender,
      address: APPLICANT.address,
      occupation: APPLICANT.occupation,
      availability: APPLICANT.availability,
      motivation: APPLICANT.motivation,
      skills_subjects: JSON.stringify(APPLICANT.skills_subjects),
      preferred_languages: JSON.stringify(APPLICANT.preferred_languages),
      status: 'pending',
    },
  });

  console.log('\n✅ Created fresh pending application:');
  console.log(`  ID:     ${application.id}`);
  console.log(`  Name:   ${application.full_name}`);
  console.log(`  Email:  ${application.email}`);
  console.log(`  Phone:  ${application.phone}`);
  console.log(`  Status: ${application.status}`);
  console.log('\nOpen admin → Applications to approve and test FE email flow.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
