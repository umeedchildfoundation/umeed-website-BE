import 'dotenv/config';
import { defineConfig } from 'prisma/config';

// Placeholder allows `prisma generate` in Docker/CI without a real database URL.
const databaseUrl =
  process.env.DATABASE_URL ??
  'postgresql://build:build@127.0.0.1:5432/build';

export default defineConfig({
  schema: 'prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'node --experimental-strip-types prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl,
  },
});
