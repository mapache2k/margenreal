import type { NextApiRequest, NextApiResponse } from 'next';
import { PostgresUserRepository } from '../../../lib/identity/infrastructure/PostgresUserRepository';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { withRateLimit } from '../../../lib/security/withRateLimit';

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') return res.status(405).end();

  const { email } = req.body as { email?: string };
  if (!email || !email.includes('@')) return res.status(400).json({ error: 'Email inválido' });

  const repo = new PostgresUserRepository();
  const user = await repo.findByEmail(email);

  // Siempre responder OK para no revelar si el email existe
  if (!user || !user.isActivated()) {
    return res.status(200).json({ ok: true });
  }

  const tokenService = new TokenService();
  const token = tokenService.createPasswordResetToken(email);
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://margenreal.io';
  const link = `${appUrl}/reset-password?token=${encodeURIComponent(token)}`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Margen Real <contacto@margenreal.io>',
      to: [email],
      subject: 'Restablece tu contraseña — Margen Real',
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111;line-height:1.7;max-width:600px;">
<p>Recibimos una solicitud para restablecer la contraseña de tu cuenta.</p>
<p>Si no la solicitaste, puedes ignorar este email.</p>
<p style="margin:28px 0;">
  <a href="${link}" style="background:#f9d71b;color:#0a0a0e;font-weight:800;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;">Restablecer contraseña →</a>
</p>
<p style="color:#888;font-size:13px;">Válido por 1 hora.</p>
<p>Saludos,<br>Margen Real</p>
</body></html>`,
      text: `Restablece tu contraseña: ${link}\n\nVálido por 1 hora.\n\nSaludos,\nMargen Real`,
    }),
  });

  return res.status(200).json({ ok: true });
};

export default withRateLimit(handler, { maxRequests: 5, windowMs: 15 * 60 * 1000, keyPrefix: 'forgot' });
