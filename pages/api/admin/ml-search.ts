import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end();

  const { q } = req.query;
  if (!q || typeof q !== 'string' || !q.trim())
    return res.status(200).json({ error: 'Falta el parámetro q' });

  try {
    // Endpoint público de MercadoLibre Chile — no requiere autenticación
    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`,
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

    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ items, total: data.paging?.total ?? items.length });

  } catch (err: any) {
    return res.status(200).json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
