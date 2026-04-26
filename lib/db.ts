import { Pool, PoolClient } from 'pg';

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL no está configurada');
  return new Pool({
    connectionString,
    max: 3,
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 5_000,
    ssl: connectionString.includes('neon.tech') ? { rejectUnauthorized: false } : false,
  });
}

const pool: Pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== 'production') global._pgPool = pool;

export default pool;

/**
 * Ejecuta un callback dentro del schema del tenant.
 * Todas las queries dentro del callback operan sobre tenant_{userId}.
 * El search_path vuelve a public al terminar la transacción.
 */
export async function withTenant<T>(
  schemaName: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Setear search_path al schema del tenant + public (para referencias cruzadas)
    await client.query(`SET LOCAL search_path TO ${schemaName}, public`);
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}
