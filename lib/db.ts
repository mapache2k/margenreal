import { Pool } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  return new Pool({
    connectionString,
    max: 3,                  // bajo para serverless — cada función tiene su propio pool
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
}

// En dev, reutilizamos el pool entre hot-reloads
const pool: Pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== 'production') global._pgPool = pool;

export default pool;
