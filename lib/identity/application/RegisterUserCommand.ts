import { PostgresUserRepository } from '../infrastructure/PostgresUserRepository';
import { TokenService } from '../infrastructure/TokenService';
import { AuditLogService } from '../infrastructure/AuditLogService';
import { Password } from '../domain/Password';
import { Plan } from '../domain/Plan';
import pool from '../../shared/infrastructure/db';

interface RegisterInput {
  email: string;
  password: string;
  ip: string;
}

export class RegisterUserCommand {
  async execute({ email, password, ip }: RegisterInput) {
    const repo    = new PostgresUserRepository();
    const audit   = new AuditLogService();
    const tokens  = new TokenService();

    const existing = await repo.findByEmail(email);
    if (existing && existing.isActivated()) {
      return { ok: false, error: 'Este email ya tiene una cuenta. Iniciá sesión.' };
    }

    const passwordHash = Password.fromPlainText(password).hash;

    let userId: number;
    let schemaName: string;

    if (existing) {
      // Usuario pendiente (compró pero no activó) — activar con plan existente
      await repo.activate(existing.id, passwordHash);
      userId = existing.id;
      schemaName = existing.schemaName ?? await repo.createTenantSchema(existing.id);
    } else {
      // Usuario nuevo — crear con plan free
      const { rows } = await pool.query(
        `INSERT INTO users (email, password_hash, plan, order_id, activated_at)
         VALUES ($1, $2, 'free', '', NOW()) RETURNING *`,
        [email.toLowerCase(), passwordHash]
      );
      userId = Number(rows[0].id);
      schemaName = await repo.createTenantSchema(userId);
    }

    await audit.log({ userId, email, event: 'activated', ip });

    const accessToken  = tokens.createAccessToken(email, existing?.plan.toString() ?? 'free', userId);
    const refreshToken = tokens.createRefreshToken(email, userId);

    return { ok: true, accessToken, refreshToken, email, plan: existing?.plan.toString() ?? 'free' };
  }
}
