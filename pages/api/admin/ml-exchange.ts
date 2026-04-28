import type { NextRequest } from 'next/server';

export const config = { runtime: 'edge' };

const json = (data: unknown, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...headers },
  });

export default async function handler(req: NextRequest) {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  if (!code) return json({ error: 'Falta el parámetro code' });

  const clientId     = process.env.ML_CLIENT_ID;
  const clientSecret = process.env.ML_CLIENT_SECRET;
  if (!clientId || !clientSecret)
    return json({ error: 'Credenciales ML no configuradas en Vercel' });

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
      return json({ error: `Error exchange ML ${tokenRes.status}: ${body.slice(0, 200)}` });
    }

    const { access_token, refresh_token, expires_in } = await tokenRes.json() as {
      access_token: string;
      refresh_token: string;
      expires_in: number;
    };

    const cookieOpts = 'Path=/; HttpOnly; Secure; SameSite=Strict';
    const headers = new Headers({ 'Content-Type': 'application/json' });
    headers.append('Set-Cookie', `ml_refresh=${refresh_token}; ${cookieOpts}; Max-Age=31536000`);
    headers.append('Set-Cookie', `ml_access=${access_token}; ${cookieOpts}; Max-Age=${expires_in}`);

    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (err: any) {
    return json({ error: `Error de conexión: ${err?.message ?? String(err)}` });
  }
}
