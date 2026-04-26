import crypto from 'crypto';
import pool from './db';

export type Plan = 'starter' | 'pro';

export interface User {
  id: number;
  email: string;
  passwordHash: string;
  plan: Plan;
  orderId: string;
  schemaName: string | null;   // tenant_{id} — se crea al activar
  activatedAt: string | null;
  createdAt: string;
}

function mapRow(row: Record<string, unknown>): User {
  return {
    id:           Number(row.id),
    email:        String(row.email),
    passwordHash: String(row.password_hash),
    plan:         row.plan as Plan,
    orderId:      String(row.order_id),
    schemaName:   row.schema_name ? String(row.schema_name) : null,
    activatedAt:  row.activated_at ? String(row.activated_at) : null,
    createdAt:    String(row.created_at),
  };
}

export async function findByEmail(email: string): Promise<User | null> {
  const { rows } = await pool.query(
    'SELECT * FROM users WHERE email = $1 LIMIT 1',
    [email.toLowerCase()]
  );
  return rows.length ? mapRow(rows[0]) : null;
}

export async function upsertPending(email: string, plan: Plan, orderId: string): Promise<User> {
  const { rows } = await pool.query(
    `INSERT INTO users (email, plan, order_id)
     VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET plan = $2, order_id = $3
     RETURNING *`,
    [email.toLowerCase(), plan, orderId]
  );
  return mapRow(rows[0]);
}

export async function activate(email: string, password: string): Promise<User | null> {
  const hash = hashPassword(password);

  // 1. Actualizar contraseña y marcar como activado
  const { rows } = await pool.query(
    `UPDATE users
     SET password_hash = $1, activated_at = NOW()
     WHERE email = $2
     RETURNING *`,
    [hash, email.toLowerCase()]
  );
  if (!rows.length) return null;

  const user = mapRow(rows[0]);

  // 2. Crear schema del tenant: tenant_{id}
  await pool.query('SELECT create_tenant_schema($1)', [user.id]);

  // 3. Releer con schema_name actualizado
  const { rows: updated } = await pool.query('SELECT * FROM users WHERE id = $1', [user.id]);
  return updated.length ? mapRow(updated[0]) : user;
}

export function verifyPassword(user: User, password: string): boolean {
  if (!user.passwordHash) return false;
  const [salt, stored] = user.passwordHash.split(':');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return hash === stored;
}

export async function logAuthEvent(
  userId: number | null,
  email: string,
  event: 'activated' | 'login_ok' | 'login_fail' | 'session_check',
  ip?: string
): Promise<void> {
  await pool.query(
    'INSERT INTO auth_log (user_id, email, event, ip) VALUES ($1, $2, $3, $4)',
    [userId ?? null, email.toLowerCase(), event, ip ?? null]
  );
}

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}
