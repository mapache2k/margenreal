import type { NextApiRequest, NextApiResponse } from 'next';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { PostgresUserRepository } from '../../../lib/identity/infrastructure/PostgresUserRepository';
import { Password } from '../../../lib/identity/domain/Password';
import pool from '../../../lib/shared/infrastructure/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  const session = new TokenService().verifyAccessToken(token);
  if (!session) return res.status(401).json({ error: 'No autorizado' });

  const { currentPassword, newPassword } = req.body as { currentPassword?: string; newPassword?: string };
  if (!currentPassword || !newPassword) return res.status(400).json({ error: 'Datos incompletos' });
  if (newPassword.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  const repo = new PostgresUserRepository();
  const user = await repo.findByEmail(session.email);
  if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

  const valid = await user.verifyPassword(currentPassword);
  if (!valid) return res.status(400).json({ error: 'La contraseña actual es incorrecta' });

  const newHash = Password.fromPlainText(newPassword).hash;
  await pool.query('UPDATE users SET password_hash = $1 WHERE id = $2', [newHash, user.id]);

  return res.status(200).json({ ok: true });
}
