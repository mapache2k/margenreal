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

/* ─── Tab Conexión ───────────────────────────────────────────── */
function TabConexion() {
  const [appId, setAppId]   = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (!appId.trim() || !secret.trim()) return;
    setStatus('saving');
    await new Promise(r => setTimeout(r, 800));
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  };

  return (
    <div className="ml-wrap">
      <h1 className="ml-title">Conexión</h1>
      <p className="ml-sub">Configurá las credenciales OAuth para acceder a datos privados de tu cuenta MercadoLibre (publicaciones, ventas, mensajes).</p>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
        <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />
        <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Sin conexión activa</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 6, padding: '2px 8px' }}>Desconectado</span>
      </div>

      <div className="ml-label" style={{ marginBottom: 16 }}>Credenciales de la App</div>
      <div className="ml-field">
        <label>App ID</label>
        <input type="text" placeholder="ej. 123456789" value={appId} onChange={e => setAppId(e.target.value)} />
      </div>
      <div className="ml-field">
        <label>Client Secret</label>
        <input type="password" placeholder="••••••••••••••••" value={secret} onChange={e => setSecret(e.target.value)} />
      </div>
      <button className="ml-btn" onClick={handleSave} disabled={status === 'saving' || !appId.trim() || !secret.trim()}>
        {status === 'saving' ? 'Guardando...' : status === 'saved' ? 'Guardado ✓' : 'Guardar credenciales'}
      </button>
      {status === 'error' && <div className="ml-error">Error al guardar. Intentá de nuevo.</div>}

      <div className="ml-divider" />

      <div className="ml-instr">
        <strong>Cómo obtener las credenciales</strong>
        <ol>
          <li>Ingresá a <a href="https://developers.mercadolibre.com.ar" target="_blank" rel="noopener noreferrer">developers.mercadolibre.com.ar</a></li>
          <li>Creá una nueva aplicación en el panel de desarrolladores</li>
          <li>Copiá el <strong style={{ display: 'inline', color: 'var(--text)' }}>App ID</strong> y el <strong style={{ display: 'inline', color: 'var(--text)' }}>Client Secret</strong></li>
          <li>Pegá los valores arriba y guardá</li>
        </ol>
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border)', fontSize: '0.8125rem', color: 'var(--muted-2)' }}>
          La búsqueda de productos usa la API pública de MercadoLibre Chile (MLC) y no requiere credenciales.
        </div>
      </div>
    </div>
  );
}

/* ─── Tab Buscar Productos ───────────────────────────────────── */
function TabBuscar() {
  const [query, setQuery]   = useState('');
  const [items, setItems]   = useState<MLItem[]>([]);
  const [total, setTotal]   = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = async () => {
    const q = query.trim();
    if (!q) return;
    setLoading(true); setError(''); setItems([]); setTotal(null);
    try {
      const r = await fetch(`/api/admin/ml-search?q=${encodeURIComponent(q)}`);
      const data = await r.json();
      if (!r.ok) { setError(data.error || 'Error al buscar'); return; }
      setItems(data.items);
      setTotal(data.total);
    } catch {
      setError('No se pudo conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <div className="ml-wrap">
      <h1 className="ml-title">Buscar Productos</h1>
      <p className="ml-sub">Consultá precios y vendedores en MercadoLibre Chile en tiempo real.</p>

      {/* Barra de búsqueda */}
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
        <button
          className="ml-search-btn"
          onClick={handleSearch}
          disabled={loading || !query.trim()}
        >
          {loading ? '...' : 'Buscar'}
        </button>
      </div>

      {error && (
        <div className="ml-error" style={{ marginBottom: 20 }}>{error}</div>
      )}

      {/* Resultados */}
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
                      {item.free_shipping && (
                        <span className="ml-badge-ship">Envío gratis</span>
                      )}
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
  );
}

/* ─── Page ───────────────────────────────────────────────────── */
type Tab = 'conexion' | 'buscar';

const TABS: { id: Tab; label: string }[] = [
  { id: 'conexion', label: 'Conexión' },
  { id: 'buscar',   label: 'Buscar Productos' },
];

export default function AdminMercadoLibre() {
  const [tab, setTab] = useState<Tab>('buscar');

  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>API Mercado Libre — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <style>{`
          .ml-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--border); padding: 0 24px; background: var(--bg); position: sticky; top: 56px; z-index: 100; }
          .ml-tab { padding: 14px 20px; font-size: 0.875rem; font-weight: 600; color: var(--muted); background: none; border: none; border-bottom: 2px solid transparent; cursor: pointer; font-family: inherit; transition: color 0.15s; white-space: nowrap; }
          .ml-tab:hover { color: var(--text); }
          .ml-tab.active { color: var(--text); border-bottom-color: var(--accent); }

          .ml-wrap { max-width: 940px; margin: 0 auto; padding: 40px 24px 80px; }
          .ml-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); margin: 0 0 6px; }
          .ml-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
          .ml-label { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); }

          .ml-field { margin-bottom: 20px; }
          .ml-field label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
          .ml-field input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
          .ml-field input:focus { border-color: var(--accent); }

          .ml-btn { background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 13px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; width: 100%; }
          .ml-btn:hover { opacity: 0.9; }
          .ml-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .ml-error { color: #ef4444; font-size: 0.875rem; }
          .ml-divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }

          .ml-instr { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 18px 22px; font-size: 0.875rem; color: var(--muted); line-height: 1.7; }
          .ml-instr strong { color: var(--text); display: block; margin-bottom: 8px; }
          .ml-instr ol { margin: 0; padding-left: 18px; }
          .ml-instr a { color: var(--accent); }

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
        `}</style>

        {/* Tab bar */}
        <div className="ml-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`ml-tab${tab === t.id ? ' active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'conexion' && <TabConexion />}
        {tab === 'buscar'   && <TabBuscar />}

      </Layout>
    </AdminGate>
  );
}
