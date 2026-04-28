import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim())
    return res.status(200).json({ error: 'Falta el parámetro q' });

  try {
    // Diagnóstico: verificar si el servidor puede contactar ML en absoluto
    const pingRes = await fetch('https://api.mercadolibre.com/sites/MLC', {
      headers: {
        Accept: 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
      },
    });
    if (!pingRes.ok) {
      return res.status(200).json({ error: `ML inaccesible desde servidor (${pingRes.status}) — IP bloqueada por ML` });
    }

    const clientId     = process.env.ML_CLIENT_ID;
    const clientSecret = process.env.ML_CLIENT_SECRET;

    let tokenHeader: string | undefined;
    if (clientId && clientSecret) {
      const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body:    `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
      });
      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json();
        tokenHeader = `Bearer ${access_token}`;
      }
    }

    const searchHeaders: Record<string, string> = {
      Accept: 'application/json',
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    };
    if (tokenHeader) searchHeaders['Authorization'] = tokenHeader;

    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`,
      { headers: searchHeaders },
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

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items, total: data.paging?.total ?? items.length });

  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
