import type { NextApiRequest, NextApiResponse } from 'next';
import { PostgresUserRepository } from '../../lib/identity/infrastructure/PostgresUserRepository';
import { TokenService } from '../../lib/identity/infrastructure/TokenService';
import { AuditLogService } from '../../lib/identity/infrastructure/AuditLogService';
import { ActivateUserCommand } from '../../lib/identity/application/ActivateUserCommand';
import { withRateLimit } from '../../lib/security/withRateLimit';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, password } = req.body as { token?: string; password?: string };
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '');

  if (!token || !password) return res.status(400).json({ error: 'Faltan datos' });

  const command = new ActivateUserCommand(
    new PostgresUserRepository(),
    new TokenService(),
    new AuditLogService(),
  );

  try {
    const result = await command.execute({ token, password, ip });
    return res.status(200).json({
      ok: true,
      accessToken:  result.accessToken,
      refreshToken: result.refreshToken,
      email: result.email,
      plan:  result.plan,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al activar';
    return res.status(400).json({ error: msg });
  }
};

export default withRateLimit(handler, { maxRequests: 10, windowMs: 15 * 60 * 1000, keyPrefix: 'activar' });
