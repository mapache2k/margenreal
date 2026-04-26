import type { NextApiRequest, NextApiResponse } from 'next';
import crypto from 'crypto';
import { PostgresUserRepository } from '../../../lib/identity/infrastructure/PostgresUserRepository';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { Plan } from '../../../lib/identity/domain/Plan';

export const config = { api: { bodyParser: false } };

async function getRawBody(req: NextApiRequest): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', chunk => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    req.on('end',  () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

function verifySignature(rawBody: Buffer, signature: string): boolean {
  const secret   = process.env.LS_WEBHOOK_SECRET ?? '';
  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex');
  try { return crypto.timingSafeEqual(Buffer.from(signature, 'hex'), Buffer.from(expected, 'hex')); }
  catch { return false; }
}

async function sendActivationEmail(email: string, token: string, plan: string) {
  const appUrl    = process.env.NEXT_PUBLIC_APP_URL ?? 'https://margenreal.io';
  const link      = `${appUrl}/activar?token=${encodeURIComponent(token)}`;
  const planLabel = plan === 'pro' ? 'Pro' : 'Starter';

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: 'Margen Real <contacto@margenreal.io>',
      to:   [email],
      subject: `Activá tu cuenta Margen Real ${planLabel}`,
      html: `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:40px 20px;background:#fff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;font-size:16px;color:#111;line-height:1.7;max-width:600px;">
<p>Tu compra del plan <strong>${planLabel}</strong> fue confirmada.</p>
<p style="margin:28px 0;">
  <a href="${link}" style="background:#f9d71b;color:#0a0a0e;font-weight:800;font-size:15px;padding:14px 28px;border-radius:10px;text-decoration:none;display:inline-block;">Activar mi cuenta →</a>
</p>
<p style="color:#888;font-size:13px;">Válido por 7 días.</p>
<p>Saludos,<br>Margen Real</p>
</body></html>`,
      text: `Activá tu cuenta: ${link}\n\nVálido por 7 días.\n\nSaludos,\nMargen Real`,
    }),
  });
}

const PLAN_MAP: Record<string, string> = {
  [process.env.NEXT_PUBLIC_LS_VARIANT_STARTER ?? '']: 'starter',
  [process.env.NEXT_PUBLIC_LS_VARIANT_PRO     ?? '']: 'pro',
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const rawBody   = await getRawBody(req);
  const signature = req.headers['x-signature'] as string ?? '';

  if (!verifySignature(rawBody, signature)) {
    console.warn('[webhook/lemon] firma inválida');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  let event: Record<string, unknown>;
  try { event = JSON.parse(rawBody.toString()); } catch { return res.status(400).end(); }

  const eventName = (event['meta'] as Record<string, unknown>)?.['event_name'];
  if (eventName !== 'order_created') return res.status(200).json({ ok: true });

  const data      = event['data'] as Record<string, unknown>;
  const attrs     = (data?.['attributes'] as Record<string, unknown>) ?? {};
  const email     = String(attrs['user_email'] ?? '');
  const orderId   = String(data?.['id'] ?? '');
  const variantId = String(((attrs['first_order_item'] as Record<string, unknown>)?.['variant_id'] ?? ''));
  const planStr   = PLAN_MAP[variantId] ?? 'starter';

  if (!email) return res.status(400).json({ error: 'No email in payload' });

  const repo = new PostgresUserRepository();
  const plan = Plan.create(planStr);
  const user = await repo.upsertPending(email, plan, orderId);

  const tokenService = new TokenService();
  const token = tokenService.createActivationToken(email, planStr, orderId);
  await sendActivationEmail(email, token, planStr);

  console.info(`[webhook/lemon] activación enviada a ${email} (${planStr}), userId=${user.id}`);
  return res.status(200).json({ ok: true });
}
