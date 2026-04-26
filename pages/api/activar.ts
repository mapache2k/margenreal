import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyActivationToken, createSessionToken } from '../../lib/tokens';
import { activate, findByEmail, verifyPassword, logAuthEvent } from '../../lib/users';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { token, password } = req.body as { token?: string; password?: string };
  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '');

  if (!token || !password) return res.status(400).json({ error: 'Faltan datos' });
  if (password.length < 8)  return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  const payload = verifyActivationToken(token);
  if (!payload) return res.status(400).json({ error: 'Enlace inválido o expirado' });

  const existing = await findByEmail(payload.email);

  if (existing?.activatedAt) {
    // Ya activado — verificar contraseña y emitir sesión
    if (!verifyPassword(existing, password)) {
      await logAuthEvent(existing.id, existing.email, 'login_fail', ip);
      return res.status(400).json({ error: 'Esta cuenta ya está activa. La contraseña no coincide.' });
    }
    await logAuthEvent(existing.id, existing.email, 'login_ok', ip);
    const session = createSessionToken(existing.email, existing.plan);
    return res.status(200).json({ ok: true, session, plan: existing.plan, email: existing.email });
  }

  const user = await activate(payload.email, password);
  if (!user) return res.status(400).json({ error: 'No se encontró la cuenta. Contactá a soporte.' });

  await logAuthEvent(user.id, user.email, 'activated', ip);
  const session = createSessionToken(user.email, user.plan);
  return res.status(200).json({ ok: true, session, plan: user.plan, email: user.email });
}
