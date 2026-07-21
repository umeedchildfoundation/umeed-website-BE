import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import chalk from 'chalk';
import ENV_CONFIG from '../EnvConfig.js';

const pool = new Pool({
  connectionString: ENV_CONFIG.CONN_URL,
  // ssl: {
  //   rejectUnauthorized: false,
  // },
  max: 50,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
});

const adapter = new PrismaPg(pool);

declare global {
  var prisma: PrismaClient | undefined;
}

const prisma: PrismaClient = global.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

const connectToDatabase = async () => {
  try {
    console.log(chalk.blueBright("Making a connection to the database 🔌"));
    const client = await pool.connect();
    client.release();
    console.log(chalk.greenBright("Connection made successfully 🚀"));
  } catch (error) {
    console.error(chalk.red("Error connecting to the database"),  error);
    process.exit(1);
  }
};

export async function initializeDatabase() {
    await connectToDatabase();
    return prisma;
}

export function getDb() {
    return prisma;
}

export async function closeDb() {
    console.log(chalk.yellowBright('[DB] Disconnecting from Neon Database...'));
    await prisma.$disconnect();
    await pool.end();
}

