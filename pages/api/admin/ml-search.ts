import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim())
    return res.status(200).json({ error: 'Falta el parámetro q' });

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return res.status(200).json({ error: 'ML_CLIENT_ID o ML_CLIENT_SECRET no configurados en Vercel' });

  try {
    // 1. Token via Client Credentials
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body:    `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => '');
      return res.status(200).json({ error: `Error de autenticación ML ${tokenRes.status}: ${body.slice(0, 300)}` });
    }

    const { access_token } = await tokenRes.json();

    // 2. Búsqueda — access_token como query param (Client Credentials no autoriza Bearer en search)
    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20&access_token=${encodeURIComponent(access_token)}`,
      { headers: { Accept: 'application/json' } },
    );

    if (!searchRes.ok) {
      const body = await searchRes.text().catch(() => '');
      return res.status(200).json({ error: `Error búsqueda ML ${searchRes.status}: ${body.slice(0, 300)}` });
    }

    const data  = await searchRes.json();
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

    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=120');
    return res.status(200).json({ items, total: data.paging?.total ?? items.length });

  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
