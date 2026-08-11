import type { PoolConfig } from 'pg';

function isLocalDatabase(connectionString: string): boolean {
  return /localhost|127\.0\.0\.1/.test(connectionString);
}

function normalizeConnectionString(connectionString: string): string {
  if (isLocalDatabase(connectionString)) return connectionString;

  try {
    const url = new URL(connectionString);
    if (!url.searchParams.has('uselibpqcompat')) {
      url.searchParams.set('uselibpqcompat', 'true');
    }
    return url.toString();
  } catch {
    return connectionString;
  }
}

export function getPgPoolConfig(connectionString: string): PoolConfig {
  return {
    connectionString: normalizeConnectionString(connectionString),
    ...(isLocalDatabase(connectionString)
      ? {}
      : { ssl: { rejectUnauthorized: false } }),
    max: 50,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 20000,
  };
}
