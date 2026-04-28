'use client';
import Head from 'next/head';
import { useState, useRef } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

type MLItem = {
  id: string;
  title: string;
  price: number;
  currency: string;
  seller: string;
  seller_id: number | null;
  permalink: string;
  thumbnail: string;
  condition: string;
  free_shipping: boolean;
};

const fmtCLP = (n: number) =>
  '$' + Math.round(n).toLocaleString('es-CL');

export default function AdminMercadoLibre() {
  const [query, setQuery]     = useState('');
  const [items, setItems]     = useState<MLItem[]>([]);
  const [total, setTotal]     = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setItems([]); setTotal(null);
    try {
      // 1. Obtener token del servidor (Client Secret nunca sale del server)
      const tokenR    = await fetch('/api/admin/ml-token');
      const tokenData = await tokenR.json();
      if (tokenData.error) { setError(tokenData.error); return; }

      // 2. Buscar desde el browser con access_token como query param
      // (Bearer header no funciona: CORS de ML solo permite Content-Type, no Authorization)
      const r = await fetch(
        `https://api.mercadolibre.com/sites/MLC/search?q=${encodeURIComponent(q)}&limit=20&access_token=${encodeURIComponent(tokenData.access_token)}`,
        { headers: { Accept: 'application/json' } },
      );
      if (!r.ok) {
        const body = await r.text().catch(() => '');
        setError(`Error MercadoLibre ${r.status}: ${body.slice(0, 200)}`);
        return;
      }
      const data = await r.json();
      setItems((data.results ?? []).map((item: any) => ({
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
      })));
      setTotal(data.paging?.total ?? 0);
    } catch (err: any) {
      setError(`Error de conexión: ${err?.message ?? ''}`);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>API Mercado Libre — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <style>{`
          .ml-wrap { max-width: 940px; margin: 0 auto; padding: 40px 24px 80px; }
          .ml-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); margin: 0 0 6px; }
          .ml-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }

          .ml-search-input { flex: 1; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 16px; border-radius: 10px; outline: none; transition: border-color 0.2s; }
          .ml-search-input:focus { border-color: var(--accent); }
          .ml-search-btn { background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; white-space: nowrap; flex-shrink: 0; }
          .ml-search-btn:hover { opacity: 0.9; }
          .ml-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }

          .ml-table { width: 100%; border-collapse: collapse; font-size: 0.875rem; }
          .ml-table th { padding: 10px 14px; color: var(--muted); font-weight: 600; font-size: 0.6875rem; text-transform: uppercase; letter-spacing: 0.08em; text-align: left; border-bottom: 1px solid var(--border); background: var(--bg); white-space: nowrap; }
          .ml-table td { padding: 12px 14px; border-bottom: 1px solid var(--border); vertical-align: middle; }
          .ml-table tr:last-child td { border-bottom: none; }
          .ml-table tr:hover td { background: rgba(255,255,255,0.02); }

          .ml-prod-title { color: var(--text); font-weight: 500; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; max-width: 380px; }
          .ml-price { font-family: var(--font-display); font-size: 1rem; font-weight: 800; color: var(--accent); letter-spacing: -0.02em; white-space: nowrap; }
          .ml-seller { color: var(--muted); font-size: 0.8125rem; font-weight: 600; }
          .ml-link { color: var(--accent); text-decoration: none; font-size: 0.8125rem; font-weight: 600; white-space: nowrap; }
          .ml-link:hover { text-decoration: underline; }

          .ml-badge { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.06em; padding: 2px 8px; border-radius: 999px; white-space: nowrap; }
          .ml-badge-new  { background: rgba(45,212,160,0.12); color: #2dd4a0; }
          .ml-badge-used { background: rgba(245,158,11,0.12); color: #f59e0b; }
          .ml-badge-ship { display: inline-block; margin-top: 4px; font-size: 0.625rem; font-weight: 700; color: #2dd4a0; background: rgba(45,212,160,0.08); border-radius: 4px; padding: 1px 6px; }
          .ml-error { color: #ef4444; font-size: 0.875rem; margin-bottom: 20px; }
        `}</style>

        <div className="ml-wrap">
          <h1 className="ml-title">API Mercado Libre</h1>
          <p className="ml-sub">Consultá precios y vendedores en MercadoLibre Chile en tiempo real.</p>

          <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
            <input
              ref={inputRef}
              type="text"
              className="ml-search-input"
              placeholder="Buscar producto en MercadoLibre Chile..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
            <button className="ml-search-btn" onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? '...' : 'Buscar'}
            </button>
          </div>

          {error && <div className="ml-error">{error}</div>}

          {items.length > 0 && (
            <>
              <div style={{ fontSize: '0.75rem', color: 'var(--muted-2)', marginBottom: 14 }}>
                Mostrando {items.length} de {total?.toLocaleString('es-CL') ?? '—'} resultados para <strong style={{ color: 'var(--muted)' }}>"{query}"</strong>
              </div>
              <div style={{ overflowX: 'auto' }}>
                <table className="ml-table">
                  <thead>
                    <tr>
                      <th style={{ width: 52 }}></th>
                      <th>Producto</th>
                      <th>Estado</th>
                      <th style={{ textAlign: 'right' }}>Precio</th>
                      <th>Vendedor</th>
                      <th style={{ width: 60 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id}>
                        <td>
                          {item.thumbnail
                            ? <img src={item.thumbnail} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6, display: 'block' }} />
                            : <div style={{ width: 40, height: 40, borderRadius: 6, background: 'var(--border)' }} />
                          }
                        </td>
                        <td>
                          <div className="ml-prod-title">{item.title}</div>
                          {item.free_shipping && <span className="ml-badge-ship">Envío gratis</span>}
                        </td>
                        <td>
                          <span className={`ml-badge ${item.condition === 'new' ? 'ml-badge-new' : 'ml-badge-used'}`}>
                            {item.condition === 'new' ? 'Nuevo' : 'Usado'}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <span className="ml-price">{fmtCLP(item.price)}</span>
                        </td>
                        <td>
                          <span className="ml-seller">{item.seller}</span>
                        </td>
                        <td>
                          <a href={item.permalink} target="_blank" rel="noopener noreferrer" className="ml-link">Ver →</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {!loading && items.length === 0 && total === 0 && (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--muted)', fontSize: '0.875rem' }}>
              Sin resultados para "{query}"
            </div>
          )}

          {!loading && items.length === 0 && total === null && !error && (
            <div style={{ padding: '48px 0', textAlign: 'center', color: 'var(--muted-2)', fontSize: '0.875rem' }}>
              Ingresá un producto para buscar
            </div>
          )}
        </div>

      </Layout>
    </AdminGate>
  );
}
