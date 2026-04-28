import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(200).json({ error: 'ML_CLIENT_ID o ML_CLIENT_SECRET no configurados' });

  try {
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body:    `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => '');
      return res.status(200).json({ error: `Error auth ML ${tokenRes.status}: ${body.slice(0, 200)}` });
    }

    const { access_token, expires_in } = await tokenRes.json();
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ access_token, expires_in });
  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
