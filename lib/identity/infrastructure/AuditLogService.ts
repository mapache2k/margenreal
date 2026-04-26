import pool from '../../shared/infrastructure/db';

export type AuditEvent = 'activated' | 'login_ok' | 'login_fail' | 'session_check';

export class AuditLogService {
  async log(userId: number | null, email: string, event: AuditEvent, ip?: string): Promise<void> {
    // Append-only — nunca se actualiza ni borra (ISO 27001 A.12.4)
    await pool.query(
      'INSERT INTO auth_log (user_id, email, event, ip) VALUES ($1, $2, $3, $4)',
      [userId ?? null, email.toLowerCase(), event, ip ?? null]
    );
  }

  async countRecentFailures(email: string, windowMs = 15 * 60 * 1000): Promise<number> {
    const since = new Date(Date.now() - windowMs).toISOString();
    const { rows } = await pool.query(
      `SELECT count(*) AS n FROM auth_log
       WHERE email = $1 AND event = 'login_fail' AND created_at > $2`,
      [email.toLowerCase(), since]
    );
    return Number(rows[0].n);
  }
}
