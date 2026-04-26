import type { NextApiRequest, NextApiResponse } from 'next';
import { findByEmail, verifyPassword, logAuthEvent } from '../../../lib/users';
import { createSessionToken } from '../../../lib/tokens';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body as { email?: string; password?: string };
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '');

  if (!email || !password) return res.status(400).json({ error: 'Faltan datos' });

  const user = await findByEmail(email);

  if (!user || !user.activatedAt || !verifyPassword(user, password)) {
    if (user) await logAuthEvent(user.id, email, 'login_fail', ip);
    return res.status(401).json({ error: 'Email o contraseña incorrectos' });
  }

  await logAuthEvent(user.id, user.email, 'login_ok', ip);
  const session = createSessionToken(user.email, user.plan);
  return res.status(200).json({ ok: true, session, plan: user.plan, email: user.email });
}
