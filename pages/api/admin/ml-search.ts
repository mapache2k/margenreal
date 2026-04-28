import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim())
    return res.status(200).json({ error: 'Falta el parámetro q' });

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(200).json({ error: 'Credenciales ML no configuradas en Vercel' });

  // Leer token de usuario OAuth desde cookie (seteada por /api/admin/ml-exchange)
  const cookieHeader = req.headers.cookie ?? '';
  const accessToken  = parseCookie(cookieHeader, 'ml_access');
  const refreshToken = parseCookie(cookieHeader, 'ml_refresh');

  if (!accessToken && !refreshToken)
    return res.status(200).json({ error: 'no_auth' });

  try {
    let token = accessToken;

    // Si no hay access token vigente, renovar con el refresh token
    if (!token && refreshToken) {
      const refreshRes = await fetch('https://api.mercadolibre.com/oauth/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body: [
          'grant_type=refresh_token',
          `client_id=${encodeURIComponent(clientId)}`,
          `client_secret=${encodeURIComponent(clientSecret)}`,
          `refresh_token=${encodeURIComponent(refreshToken)}`,
        ].join('&'),
      });
      if (!refreshRes.ok) return res.status(200).json({ error: 'no_auth' });
      const refreshData = await refreshRes.json() as { access_token: string };
      token = refreshData.access_token;
    }

    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${token}` } },
    );

    if (!searchRes.ok) {
      const body = await searchRes.text().catch(() => '');
      return res.status(200).json({ error: `Error ML ${searchRes.status}: ${body.slice(0, 300)}` });
    }

    const data  = await searchRes.json() as { results?: any[]; paging?: { total?: number } };
    const items = (data.results ?? []).map((item: any) => ({
      id:            item.id,
      title:         item.title,
      price:         item.price,
      currency:      item.currency_id,
      seller:        item.seller?.nickname ?? '—',
      seller_id:     item.seller?.id ?? null,
      permalink:     item.permalink,
      thumbnail:     item.thumbnail,
      condition:     item.condition,
      free_shipping: item.shipping?.free_shipping ?? false,
    }));

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items, total: data.paging?.total ?? items.length });
  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}

function parseCookie(header: string, name: string): string | undefined {
  const match = header.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : undefined;
}
