import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const code = req.query.code as string | undefined;
  if (!code) return res.status(200).json({ error: 'Falta el parámetro code' });

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(200).json({ error: 'Credenciales ML no configuradas' });

  try {
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body: [
        'grant_type=authorization_code',
        `client_id=${encodeURIComponent(clientId)}`,
        `client_secret=${encodeURIComponent(clientSecret)}`,
        `code=${encodeURIComponent(code)}`,
        `redirect_uri=${encodeURIComponent('https://margenreal.io/admin/mercadolibre')}`,
      ].join('&'),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => '');
      return res.status(200).json({ error: `Error exchange ML ${tokenRes.status}: ${body.slice(0, 200)}` });
    }

    const { access_token, refresh_token, expires_in } = await tokenRes.json() as {
      access_token: string; refresh_token: string; expires_in: number;
    };

    const cookieOpts = 'Path=/; HttpOnly; Secure; SameSite=Strict';
    res.setHeader('Set-Cookie', [
      `ml_refresh=${refresh_token}; ${cookieOpts}; Max-Age=31536000`,
      `ml_access=${access_token}; ${cookieOpts}; Max-Age=${expires_in}`,
    ]);
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ success: true });
  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
