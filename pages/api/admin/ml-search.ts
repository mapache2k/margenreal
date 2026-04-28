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

  try {
    // 1. Ping para diagnóstico
    const pingRes = await fetch('https://api.mercadolibre.com/sites/MLC', {
      headers: { Accept: 'application/json' },
    });
    if (!pingRes.ok) {
      return json({ error: `ML inaccesible desde Edge (${pingRes.status}) — IP bloqueada` });
    }

    // 2. Token via Client Credentials
    let tokenHeader: string | undefined;
    if (clientId && clientSecret) {
      const tokenRes = await fetch('https://api.mercadolibre.com/oauth/token', {
        method:  'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
        body:    `grant_type=client_credentials&client_id=${encodeURIComponent(clientId)}&client_secret=${encodeURIComponent(clientSecret)}`,
      });
      if (tokenRes.ok) {
        const { access_token } = await tokenRes.json() as { access_token: string };
        tokenHeader = `Bearer ${access_token}`;
      }
    }

    // 3. Búsqueda — con o sin token según disponibilidad
    const searchHeaders: Record<string, string> = { Accept: 'application/json' };
    if (tokenHeader) searchHeaders['Authorization'] = tokenHeader;

    const searchRes = await fetch(
      `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q.trim())}&limit=20`,
      { headers: searchHeaders },
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
