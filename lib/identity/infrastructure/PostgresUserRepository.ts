import pool from '../../shared/infrastructure/db';
import { IUserRepository } from '../domain/IUserRepository';
import { User } from '../domain/User';
import { Plan } from '../domain/Plan';
import { Password } from '../domain/Password';

export class PostgresUserRepository implements IUserRepository {

  private mapRow(row: Record<string, unknown>): User {
    return User.create(Number(row.id), {
      email:       String(row.email),
      password:    Password.fromHash(String(row.password_hash ?? '')),
      plan:        Plan.create(String(row.plan)),
      orderId:     String(row.order_id ?? ''),
      schemaName:  row.schema_name ? String(row.schema_name) : null,
      activatedAt: row.activated_at ? new Date(String(row.activated_at)) : null,
      createdAt:   new Date(String(row.created_at)),
    });
  }

  async findByEmail(email: string): Promise<User | null> {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async upsertPending(email: string, plan: Plan, orderId: string): Promise<User> {
    const { rows } = await pool.query(
      `INSERT INTO users (email, plan, order_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (email) DO UPDATE SET plan = $2, order_id = $3
       RETURNING *`,
      [email.toLowerCase(), plan.toString(), orderId]
    );
    return this.mapRow(rows[0]);
  }

  async activate(userId: number, passwordHash: string): Promise<User | null> {
    const { rows } = await pool.query(
      `UPDATE users
       SET password_hash = $1, activated_at = NOW()
       WHERE id = $2
       RETURNING *`,
      [passwordHash, userId]
    );
    return rows.length ? this.mapRow(rows[0]) : null;
  }

  async resetPassword(email: string, passwordHash: string): Promise<boolean> {
    const { rowCount } = await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [passwordHash, email.toLowerCase()]
    );
    return (rowCount ?? 0) > 0;
  }

  async createTenantSchema(userId: number): Promise<string> {
    const { rows } = await pool.query(
      'SELECT create_tenant_schema($1) AS schema_name',
      [userId]
    );
    return String(rows[0].schema_name);
  }
}
