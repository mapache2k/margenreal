import type { NextApiRequest, NextApiResponse } from 'next';

let cachedToken: { value: string; expiresAt: number } | null = null;

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) return cachedToken.value;

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret) throw new Error('ML_CLIENT_ID o ML_CLIENT_SECRET no configurados en Vercel');

  const r = await fetch('https://api.mercadolibre.com/oauth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
    body: new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
  });

  if (!r.ok) {
    const body = await r.text().catch(() => '');
    throw new Error(`Error al obtener token ML ${r.status}: ${body.slice(0, 200)}`);
  }

  const data = await r.json();
  cachedToken = { value: data.access_token, expiresAt: Date.now() + (data.expires_in - 60) * 1000 };
  return cachedToken.value;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim()) return res.status(400).json({ error: 'Falta el parámetro q' });

  const controller = new AbortController();
  const timeout    = setTimeout(() => controller.abort(), 10_000);

  try {
    const token = await getToken();
    const url   = `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`;

    const r = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', Authorization: `Bearer ${token}` },
    });

    clearTimeout(timeout);

    if (!r.ok) {
      const body = await r.text().catch(() => '');
      return res.status(502).json({ error: `ML API ${r.status}: ${body.slice(0, 200)}` });
    }

    const data  = await r.json();
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
    clearTimeout(timeout);
    const msg = err?.name === 'AbortError'
      ? 'Timeout al conectar con MercadoLibre'
      : `${err?.message ?? String(err)}`;
    return res.status(502).json({ error: msg });
  }
}
