import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') return new Response(null, { status: 405 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim();
  if (!q) return json({ error: 'Falta el parámetro q' }, 400);

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret) return json({ error: 'ML_CLIENT_ID o ML_CLIENT_SECRET no configurados en Vercel' }, 500);

  try {
    // 1. Obtener access token via Client Credentials
    const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
      body:    new URLSearchParams({ grant_type: 'client_credentials', client_id: clientId, client_secret: clientSecret }),
    });

    if (!tokenRes.ok) {
      const body = await tokenRes.text().catch(() => '');
      return json({ error: `Error de autenticación ML ${tokenRes.status}: ${body.slice(0, 200)}` }, 502);
    }

    const { access_token } = await tokenRes.json() as any;

    // 2. Buscar productos
    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=20`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${access_token}` } },
    );

    if (!searchRes.ok) {
      const body = await searchRes.text().catch(() => '');
      return json({ error: `ML API ${searchRes.status}: ${body.slice(0, 200)}` }, 502);
    }

    const data  = await searchRes.json() as any;
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

    return json({ items, total: data.paging?.total ?? items.length }, 200, {
      'Cache-Control': 's-maxage=60, stale-while-revalidate=120',
    });
  } catch (err: any) {
    return json({ error: `Error de red: ${err?.message ?? String(err)}` }, 502);
  }
}

function json(data: unknown, status: number, extra: Record<string, string> = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...extra },
  });
}
