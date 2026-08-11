import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import { getPgPoolConfig } from '../src/shared/pg-pool.config.ts';
import { cleanupAllSeedData, cleanupFixtures } from './seed/cleanup.ts';
import { seedFixtures, upsertCoreUsers } from './seed/fixtures.ts';

dotenv.config();

const pool = new Pool(getPgPoolConfig(process.env.DATABASE_URL || ''));
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const fullReset = process.env.SEED_RESET === 'true';

  console.log('🌱 UMEED seed starting...');
  if (fullReset) {
    console.log('  SEED_RESET=true → removing all seed users + fixtures');
    await cleanupAllSeedData(prisma);
  } else {
    console.log('  Cleaning fixture data only (fixed IDs — no DB bloat)');
    await cleanupFixtures(prisma);
  }

  console.log('  Upserting core accounts...');
  const ctx = await upsertCoreUsers(prisma);

  console.log('  Seeding test fixtures...');
  await seedFixtures(prisma, ctx);

  console.log('\n✅ Seed complete. Re-running seed is safe — fixture rows are replaced, not duplicated.');
  console.log('\nDemo logins:');
  console.log('  preet@umeed.org / admin2026 (super_admin)');
  console.log('  admin@umeed.org / admin2026 (admin)');
  console.log('  volunteer@umeed.org / volunteer2026 (volunteer)');
  console.log('\nTest approval flow: approve application for applicant.pending@seed.umeed.local');
  console.log('  (Email is sent by the frontend via Apps Script after approval)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
