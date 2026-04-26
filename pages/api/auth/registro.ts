import type { NextApiRequest, NextApiResponse } from 'next';
import { RegisterUserCommand } from '../../../lib/identity/application/RegisterUserCommand';
import { withRateLimit } from '../../../lib/security/withRateLimit';

async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body as { email?: string; password?: string };
  if (!email || !password) return res.status(400).json({ error: 'Datos incompletos' });
  if (password.length < 8) return res.status(400).json({ error: 'La contraseña debe tener al menos 8 caracteres' });

  const ip = String(req.headers['x-forwarded-for'] ?? req.socket.remoteAddress ?? '');
  const cmd = new RegisterUserCommand();
  const result = await cmd.execute({ email: email.trim().toLowerCase(), password, ip });

  if (!result.ok) return res.status(400).json({ error: result.error });
  return res.status(201).json(result);
}

export default withRateLimit({ max: 5, windowMs: 15 * 60 * 1000 })(handler);
