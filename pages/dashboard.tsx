import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProGate, { ProSession } from '../components/ProGate';

const SESSION_KEY = 'mr_session';

type SavedProduct = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  margen_pct: number;
  created_at: string;
};

function DashboardContent({ session }: { session: ProSession }) {
  const router = useRouter();
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    fetch('/api/user/products', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => { if (data.products) setProducts(data.products); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id: number) => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    await fetch(`/api/user/products?id=${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('mr_user_email');
    localStorage.removeItem('mr_user_plan');
    router.replace('/');
  };

  const isFree    = session.plan === 'free';
  const planLabel = session.plan === 'pro' ? 'Pro' : session.plan === 'starter' ? 'Starter' : 'Gratis';
  const initial = session.email.charAt(0).toUpperCase();

  const fmt = (n: number) =>
    n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <>
      <style>{`
        .dash-wrap { max-width: 860px; margin: 0 auto; padding: 32px 16px 64px; }
        @media (min-width: 600px) { .dash-wrap { padding: 40px 24px 64px; } }

        /* Header */
        .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .dash-user { display: flex; align-items: center; gap: 14px; }
        .dash-avatar { width: 48px; height: 48px; border-radius: 13px; background: var(--accent); color: var(--bg); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; flex-shrink: 0; }
        .dash-user-info {}
        .dash-email { font-size: 0.9375rem; font-weight: 700; color: var(--text); }
        .dash-plan-badge { display: inline-block; margin-top: 3px; font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 4px; padding: 2px 7px; }
        .dash-plan-badge-free { background: rgba(160,160,160,0.12); color: var(--muted); }
        .dash-plan-badge-paid { background: rgba(249,215,27,0.14); color: var(--accent); }
        .dash-upgrade-banner { margin-bottom: 40px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dash-upgrade-text { font-size: 0.875rem; color: var(--muted); line-height: 1.55; }
        .dash-upgrade-text strong { color: var(--text); display: block; margin-bottom: 4px; font-size: 0.9375rem; }
        .dash-upgrade-btn { background: var(--accent); color: var(--bg); font-size: 0.875rem; font-weight: 800; padding: 10px 18px; border-radius: 9px; text-decoration: none; white-space: nowrap; transition: opacity 0.15s; flex-shrink: 0; }
        .dash-upgrade-btn:hover { opacity: 0.85; text-decoration: none; }
        .dash-logout-btn { background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.8125rem; font-weight: 600; padding: 8px 16px; border-radius: 9px; cursor: pointer; font-family: inherit; transition: color 0.15s, border-color 0.15s; }
        .dash-logout-btn:hover { color: #ef4444; border-color: #ef4444; }

        /* Section title */
        .dash-section-title { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-2); margin-bottom: 16px; }

        /* Compras */
        .dash-compras { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
        .dash-compra-card { width: 160px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; flex-shrink: 0; }
        @media (max-width: 400px) { .dash-compra-card { width: calc(50% - 7px); } }
        .dash-compra-thumb { height: 100px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .dash-compra-body { padding: 12px 14px; }
        .dash-compra-type { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 4px; }
        .dash-compra-name { font-size: 0.875rem; font-weight: 800; color: var(--text); margin-bottom: 12px; font-family: var(--font-display); }
        .dash-compra-btn { display: block; width: 100%; text-align: center; background: var(--accent); color: var(--bg); font-size: 0.8125rem; font-weight: 800; padding: 9px; border-radius: 8px; text-decoration: none; transition: opacity 0.15s; }
        .dash-compra-btn:hover { opacity: 0.85; text-decoration: none; }

        /* Mini calculator widget */
        .dash-widget-icon { font-size: 2rem; flex-shrink: 0; }
        .dash-widget-info { flex: 1; min-width: 160px; }
        .dash-widget-title { font-size: 1rem; font-weight: 800; color: var(--text); font-family: var(--font-display); margin-bottom: 4px; }
        .dash-widget-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.5; }
        .dash-widget-btn:hover { opacity: 0.85; text-decoration: none; }

        /* Productos */
        .dash-products-empty { text-align: center; padding: 32px 20px; color: var(--muted); font-size: 0.875rem; line-height: 1.7; border: 1.5px dashed var(--border); border-radius: 14px; }
        .dash-products-table { border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; }
        .dash-products-head { display: grid; grid-template-columns: 2fr 1fr 1fr auto; padding: 8px 16px; background: var(--bg); font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted-2); gap: 8px; }
        .dash-products-row { display: grid; grid-template-columns: 2fr 1fr 1fr auto; padding: 12px 16px; border-top: 1px solid var(--border); align-items: center; gap: 8px; font-size: 0.875rem; }
        .dash-products-row:hover { background: var(--surface); }
        .dash-prod-name { font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dash-prod-cat { font-size: 0.6875rem; color: var(--muted); margin-top: 2px; }
        .dash-prod-val { color: var(--muted); }
        .dash-prod-margen-ok { font-weight: 700; color: #2dd4a0; }
        .dash-prod-margen-warn { font-weight: 700; color: #f0b429; }
        .dash-prod-margen-bad { font-weight: 700; color: #e85555; }
        .dash-prod-del { background: none; border: none; cursor: pointer; color: var(--muted-2); font-size: 1rem; padding: 2px 6px; border-radius: 5px; transition: color 0.15s; }
        .dash-prod-del:hover { color: #e85555; }

        /* Tabla responsive — oculta margen en muy pequeño */
        @media (max-width: 380px) {
          .dash-products-head { grid-template-columns: 2fr 1fr auto; }
          .dash-products-row { grid-template-columns: 2fr 1fr auto; }
          .dash-col-margen { display: none; }
        }
        .dash-products-total { padding: 10px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(232,85,85,0.06); }
        .dash-total-label { font-size: 0.75rem; color: #e85555; font-weight: 600; }
        .dash-total-val { font-size: 0.875rem; font-weight: 800; color: #e85555; }

        /* Widget responsive */
        .dash-widget { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .dash-widget-btn { display: inline-block; background: var(--accent); color: var(--bg); font-size: 0.875rem; font-weight: 800; padding: 10px 18px; border-radius: 10px; text-decoration: none; white-space: nowrap; transition: opacity 0.15s; flex-shrink: 0; }
        @media (max-width: 480px) { .dash-widget { flex-direction: column; align-items: flex-start; } }
      `}</style>

      <div className="dash-wrap">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-user">
            <div className="dash-avatar">{initial}</div>
            <div className="dash-user-info">
              <div className="dash-email">{session.email}</div>
              <span className={`dash-plan-badge ${isFree ? 'dash-plan-badge-free' : 'dash-plan-badge-paid'}`}>
                Plan {planLabel}
              </span>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        {/* Mis compras — solo si tiene plan pago */}
        {!isFree && (
          <>
            <div className="dash-section-title">Mis compras</div>
            <div className="dash-compras">
              <div className="dash-compra-card">
                <div className="dash-compra-thumb">📊</div>
                <div className="dash-compra-body">
                  <div className="dash-compra-type">Herramienta</div>
                  <div className="dash-compra-name">Plan {planLabel}</div>
                  <Link href="/calculadora-ml" className="dash-compra-btn">Acceder →</Link>
                </div>
              </div>
              {session.plan === 'pro' && (
                <div className="dash-compra-card">
                  <div className="dash-compra-thumb">⚡</div>
                  <div className="dash-compra-body">
                    <div className="dash-compra-type">Herramienta Pro</div>
                    <div className="dash-compra-name">Calculadoras avanzadas</div>
                    <Link href="/pro" className="dash-compra-btn">Acceder →</Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Banner upgrade — solo plan free */}
        {isFree && (
          <div className="dash-upgrade-banner" style={{ marginBottom: 40 }}>
            <div className="dash-upgrade-text">
              <strong>Estás en el plan gratuito</strong>
              Comprá un plan para desbloquear productos ilimitados y todas las herramientas.
            </div>
            <Link href="/pricing" className="dash-upgrade-btn">Ver planes →</Link>
          </div>
        )}

        {/* Widget calculadora */}
        <div className="dash-section-title">Calculadora rápida</div>
        <div className="dash-widget">
          <span className="dash-widget-icon">🧮</span>
          <div className="dash-widget-info">
            <div className="dash-widget-title">Calculadora MercadoLibre Chile</div>
            <div className="dash-widget-desc">
              Calculá tu margen real al instante. Comisión, IVA 19% y envío incluidos.
              Tus productos se guardan automáticamente acá.
            </div>
          </div>
          <Link href="/calculadora-ml" className="dash-widget-btn">Ir a la calculadora →</Link>
        </div>

        {/* Mis productos */}
        <div className="dash-section-title">Mis productos guardados</div>

        {loading ? (
          <div style={{ color: 'var(--muted)', fontSize: '0.875rem', padding: '20px 0' }}>Cargando…</div>
        ) : products.length === 0 ? (
          <div className="dash-products-empty">
            Todavía no guardaste ningún producto.<br />
            <Link href="/calculadora-ml" style={{ color: 'var(--accent)', fontWeight: 700, textDecoration: 'none' }}>
              Ir a la calculadora →
            </Link>
          </div>
        ) : (
          <div className="dash-products-table">
            <div className="dash-products-head">
              <span>Producto</span>
              <span>Ganancia/u.</span>
              <span className="dash-col-margen">Margen</span>
              <span></span>
            </div>
            {products.map(p => {
              const ganancia = p.precio * (p.margen_pct / 100);
              const gananciaOk = ganancia >= 0;
              const margenCls = p.margen_pct >= 20
                ? 'dash-prod-margen-ok'
                : p.margen_pct >= 0
                ? 'dash-prod-margen-warn'
                : 'dash-prod-margen-bad';
              return (
                <div key={p.id} className="dash-products-row">
                  <div>
                    <div className="dash-prod-name">{p.nombre}</div>
                    <div className="dash-prod-cat">{p.categoria}</div>
                  </div>
                  <span style={{ fontWeight: 700, color: gananciaOk ? '#2dd4a0' : '#e85555' }}>
                    {!gananciaOk && '−'}${fmt(Math.abs(ganancia))}
                  </span>
                  <span className={`${margenCls} dash-col-margen`}>
                    {p.margen_pct.toFixed(1).replace('.', ',')}%
                  </span>
                  <button className="dash-prod-del" title="Eliminar" onClick={() => handleDelete(p.id)}>×</button>
                </div>
              );
            })}
            {(() => {
              const perdidos = products.filter(p => p.margen_pct < 0);
              if (perdidos.length === 0) return null;
              const totalPerdido = perdidos.reduce((s, p) => s + Math.abs(p.precio * (p.margen_pct / 100)), 0);
              return (
                <div className="dash-products-total">
                  <span className="dash-total-label">
                    {perdidos.length === 1 ? '1 producto en pérdida' : `${perdidos.length} productos en pérdida`}
                  </span>
                  <span className="dash-total-val">−${fmt(totalPerdido)} / unidad</span>
                </div>
              );
            })()}
          </div>
        )}

      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Layout>
      <Head>
        <title>Mi cuenta — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ProGate>
        {session => <DashboardContent session={session} />}
      </ProGate>
    </Layout>
  );
}
