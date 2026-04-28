import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

const json = (data: unknown) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  if (!q.trim()) return json({ error: 'Falta el parámetro q' });

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return json({ error: 'Credenciales ML no configuradas en Vercel' });

  // 1. Intentar obtener access_token desde la cookie de sesión
  let accessToken = req.cookies.get('ml_access')?.value;

  if (!accessToken) {
    const refreshToken = req.cookies.get('ml_refresh')?.value;
    if (!refreshToken) return json({ error: 'no_auth' }); // señal para mostrar botón Conectar

    // Renovar access_token con refresh_token
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

    if (!refreshRes.ok) return json({ error: 'no_auth' });
    const { access_token } = await refreshRes.json() as { access_token: string };
    accessToken = access_token;
  }

  try {
    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`,
      { headers: { Accept: 'application/json', Authorization: `Bearer ${accessToken}` } },
    );

    if (!searchRes.ok) {
      const body = await searchRes.text().catch(() => '');
      return json({ error: `Error búsqueda ML ${searchRes.status}: ${body.slice(0, 300)}` });
    }

    const data = await searchRes.json() as { results?: any[]; paging?: { total?: number } };
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

    return json({ items, total: data.paging?.total ?? items.length });
  } catch (err: any) {
    return json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
