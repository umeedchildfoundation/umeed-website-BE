import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || '',
  // ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

const SEED_USERS = [
  {
    email: 'preet@umeed.org',
    password: 'admin2026',
    fullName: 'Preet (Super Admin)',
    role: 'super_admin' as const,
    volunteerStatus: 'approved' as const,
    volunteerId: 'UMV1001',
  },
  {
    email: 'admin@umeed.org',
    password: 'admin2026',
    fullName: 'Admin User',
    role: 'admin' as const,
    volunteerStatus: 'approved' as const,
    volunteerId: 'UMV1002',
  },
  {
    email: 'volunteer@umeed.org',
    password: 'volunteer2026',
    fullName: 'Demo Volunteer',
    role: 'volunteer' as const,
    volunteerStatus: 'approved' as const,
    volunteerId: 'UMV1003',
  },
];

async function seed() {
  console.log('Seeding users...');

  for (const u of SEED_USERS) {
    const existing = await prisma.users.findFirst({
      where: { email: { equals: u.email, mode: 'insensitive' } },
    });

    if (existing) {
      console.log(`  [skip] ${u.email} already exists`);
      continue;
    }

    const passwordHash = await hashPassword(u.password);
    const userId = uuidv4();

    await prisma.users.create({
      data: {
        id: userId,
        email: u.email.toLowerCase(),
        password_hash: passwordHash,
        full_name: u.fullName,
        role: u.role,
        profile: {
          create: {
            id: uuidv4(),
            email: u.email.toLowerCase(),
            full_name: u.fullName,
            role: u.role,
          },
        },
      },
    });

    await prisma.volunteers.create({
      data: {
        id: uuidv4(),
        user_id: userId,
        volunteer_id: u.volunteerId,
        name: u.fullName,
        email: u.email.toLowerCase(),
        status: u.volunteerStatus,
        joined_at: new Date().toISOString(),
      },
    });

    console.log(`  [created] ${u.email} (${u.role})`);
  }

  console.log('Done.');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
