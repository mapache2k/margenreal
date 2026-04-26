import type { NextApiRequest, NextApiResponse } from 'next';
import { PostgresUserRepository } from '../../../lib/identity/infrastructure/PostgresUserRepository';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { Password } from '../../../lib/identity/domain/Password';
import { withRateLimit } from '../../../lib/security/withRateLimit';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, password } = req.body as { token?: string; password?: string };
  if (!token || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (password.length < 8) return res.status(400).json({ error: 'Mínimo 8 caracteres' });

  const tokenService = new TokenService();
  const payload = tokenService.verifyPasswordResetToken(token);
  if (!payload) return res.status(400).json({ error: 'Enlace inválido o expirado' });

  const hashed = Password.fromPlainText(password);
  const repo = new PostgresUserRepository();
  const ok = await repo.resetPassword(payload.email, hashed.hash);

  if (!ok) return res.status(404).json({ error: 'Usuario no encontrado' });

  return res.status(200).json({ ok: true });
};

export default withRateLimit(handler, { maxRequests: 10, windowMs: 15 * 60 * 1000, keyPrefix: 'reset' });
