import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import ProGate, { ProSession } from '../components/ProGate';
import {
  calcularML,
  precioParaMargenObjetivo,
  ML_CATEGORIAS,
  ESTIMADOS_ENVIO_CLP,
  type MLChileCategoria,
  type EstimadoEnvioKey,
} from '../lib/mlChileEngine';

const SESSION_KEY = 'mr_session';

type SavedProduct = {
  id: number;
  nombre: string;
  categoria: string;
  precio: number;
  costo: number;
  margen_pct: number;
  created_at: string;
  detalle?: { tipo?: string; envioKey?: string; ganancia?: number };
};

const findCatKey = (label: string): MLChileCategoria => {
  const entry = Object.entries(ML_CATEGORIAS).find(([, v]) => v.label === label);
  return (entry?.[0] ?? 'otros') as MLChileCategoria;
};

const getEstado = (m: number) => m < 0 ? '❌ Pérdida' : m < 15 ? '⚠️ Bajo' : '✅ Saludable';
const getEstadoColor = (m: number) => m < 0 ? '#e85555' : m < 15 ? '#f0b429' : '#2dd4a0';
const getPrioridad = (g: number, m: number) => g < 0 || m < 10 ? '🔥 Alta' : m < 20 ? '⚠️ Media' : '—';

function DashboardContent({ session }: { session: ProSession }) {
  const router = useRouter();
  const [products, setProducts] = useState<SavedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editPrecio, setEditPrecio] = useState('');
  const [editCosto, setEditCosto] = useState('');
  const [saving, setSaving] = useState(false);
  const [plUnits, setPlUnits] = useState(10);
  const [expandedPl, setExpandedPl] = useState<Set<number>>(new Set());

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
    if (editingId === id) setEditingId(null);
  };

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('mr_user_email');
    localStorage.removeItem('mr_user_plan');
    router.replace('/');
  };

  const startEdit = (p: SavedProduct) => {
    if (editingId === p.id) { setEditingId(null); return; }
    setEditingId(p.id);
    setEditPrecio(String(p.precio));
    setEditCosto(String(p.costo));
  };

  const getEditResult = (p: SavedProduct, precioStr: string, costoStr: string) => {
    const precioN = parseFloat(precioStr) || 0;
    const costoN = parseFloat(costoStr) || 0;
    if (!precioN || !costoN) return null;
    const catKey = findCatKey(p.categoria);
    const tipo = (p.detalle?.tipo ?? 'clasica') as 'clasica' | 'premium';
    const envioKey = (p.detalle?.envioKey ?? 'mediano') as EstimadoEnvioKey;
    const costoEnvio = ESTIMADOS_ENVIO_CLP[envioKey].valor;
    return calcularML({ costoCLP: costoN, precioVenta: precioN, categoria: catKey, tipoPublicacion: tipo, costoEnvio });
  };

  const handleSave = async (p: SavedProduct) => {
    const result = getEditResult(p, editPrecio, editCosto);
    if (!result) return;
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) return;
    setSaving(true);
    try {
      await fetch('/api/user/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          id: p.id,
          precio: parseFloat(editPrecio),
          costo: parseFloat(editCosto),
          margen_pct: result.margenPct,
          ganancia: result.gananciaAbsoluta,
        }),
      });
      setProducts(prev => prev.map(x => x.id === p.id ? {
        ...x,
        precio: parseFloat(editPrecio),
        costo: parseFloat(editCosto),
        margen_pct: result.margenPct,
        detalle: { ...x.detalle, ganancia: result.gananciaAbsoluta },
      } : x));
      setEditingId(null);
    } catch {} finally {
      setSaving(false);
    }
  };

  const isFree    = session.plan === 'free';
  const planLabel = session.plan === 'pro' ? 'Pro' : session.plan === 'starter' ? 'Starter' : 'Gratis';
  const initial   = session.email.charAt(0).toUpperCase();

  const fmt = (n: number) =>
    n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const sortedProducts = [...products].sort((a, b) => {
    const ga = a.detalle?.ganancia ?? a.precio * (a.margen_pct / 100);
    const gb = b.detalle?.ganancia ?? b.precio * (b.margen_pct / 100);
    return ga - gb;
  });

  return (
    <>
      <style>{`
        .dash-wrap { max-width: 900px; margin: 0 auto; padding: 32px 16px 64px; }
        @media (min-width: 600px) { .dash-wrap { padding: 40px 24px 64px; } }

        .dash-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 36px; flex-wrap: wrap; gap: 12px; }
        .dash-user { display: flex; align-items: center; gap: 14px; }
        .dash-avatar { width: 48px; height: 48px; border-radius: 13px; background: var(--accent); color: var(--bg); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; flex-shrink: 0; }
        .dash-email { font-size: 0.9375rem; font-weight: 700; color: var(--text); }
        .dash-plan-badge { display: inline-block; margin-top: 3px; font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; border-radius: 4px; padding: 2px 7px; }
        .dash-plan-badge-free { background: rgba(160,160,160,0.12); color: var(--muted); }
        .dash-plan-badge-paid { background: rgba(249,215,27,0.14); color: var(--accent); }
        .dash-upgrade-banner { margin-bottom: 40px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .dash-upgrade-text { font-size: 0.875rem; color: var(--muted); line-height: 1.55; }
        .dash-upgrade-text strong { color: var(--text); display: block; margin-bottom: 4px; font-size: 0.9375rem; }
        .dash-upgrade-btn { background: var(--accent); color: var(--bg); font-size: 0.875rem; font-weight: 800; padding: 10px 18px; border-radius: 9px; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
        .dash-upgrade-btn:hover { opacity: 0.85; text-decoration: none; }
        .dash-logout-btn { background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.8125rem; font-weight: 600; padding: 8px 16px; border-radius: 9px; cursor: pointer; font-family: inherit; }
        .dash-logout-btn:hover { color: #ef4444; border-color: #ef4444; }

        .dash-section-title { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-2); margin-bottom: 16px; }

        .dash-compras { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 40px; }
        .dash-compra-card { width: 160px; background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; flex-shrink: 0; }
        @media (max-width: 400px) { .dash-compra-card { width: calc(50% - 7px); } }
        .dash-compra-thumb { height: 100px; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%); display: flex; align-items: center; justify-content: center; font-size: 2.5rem; }
        .dash-compra-body { padding: 12px 14px; }
        .dash-compra-type { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 4px; }
        .dash-compra-name { font-size: 0.875rem; font-weight: 800; color: var(--text); margin-bottom: 12px; font-family: var(--font-display); }
        .dash-compra-btn { display: block; width: 100%; text-align: center; background: var(--accent); color: var(--bg); font-size: 0.8125rem; font-weight: 800; padding: 9px; border-radius: 8px; text-decoration: none; }
        .dash-compra-btn:hover { opacity: 0.85; text-decoration: none; }

        .dash-widget { background: var(--surface); border: 1.5px solid var(--border); border-radius: 16px; padding: 20px; margin-bottom: 40px; display: flex; align-items: center; gap: 16px; flex-wrap: wrap; }
        .dash-widget-icon { font-size: 2rem; flex-shrink: 0; }
        .dash-widget-info { flex: 1; min-width: 160px; }
        .dash-widget-title { font-size: 1rem; font-weight: 800; color: var(--text); font-family: var(--font-display); margin-bottom: 4px; }
        .dash-widget-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.5; }
        .dash-widget-btn { display: inline-block; background: var(--accent); color: var(--bg); font-size: 0.875rem; font-weight: 800; padding: 10px 18px; border-radius: 10px; text-decoration: none; white-space: nowrap; flex-shrink: 0; }
        .dash-widget-btn:hover { opacity: 0.85; text-decoration: none; }
        @media (max-width: 480px) { .dash-widget { flex-direction: column; align-items: flex-start; } }

        /* Products table */
        .dash-products-empty { text-align: center; padding: 32px 20px; color: var(--muted); font-size: 0.875rem; line-height: 1.7; border: 1.5px dashed var(--border); border-radius: 14px; }
        .dash-products-table { border: 1.5px solid var(--border); border-radius: 14px; overflow: hidden; }
        .dash-products-head { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; padding: 8px 16px; background: var(--bg); font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.09em; color: var(--muted-2); gap: 8px; align-items: center; }
        .dash-products-row { display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; padding: 12px 16px; border-top: 1px solid var(--border); align-items: center; gap: 8px; font-size: 0.875rem; cursor: pointer; transition: background 0.1s; }
        .dash-products-row:hover { background: var(--surface); }
        .dash-prod-name { font-weight: 600; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dash-prod-cat { font-size: 0.6875rem; color: var(--muted); margin-top: 2px; }
        .dash-prod-del { background: none; border: none; cursor: pointer; color: var(--muted-2); font-size: 1rem; padding: 4px 6px; border-radius: 5px; }
        .dash-prod-del:hover { color: #e85555; }

        @media (max-width: 540px) {
          .dash-products-head { grid-template-columns: 2fr 1fr 1fr auto; }
          .dash-products-row { grid-template-columns: 2fr 1fr 1fr auto; }
          .dash-col-prioridad { display: none; }
        }
        @media (max-width: 380px) {
          .dash-products-head { grid-template-columns: 2fr 1fr auto; }
          .dash-products-row { grid-template-columns: 2fr 1fr auto; }
          .dash-col-prioridad { display: none; }
          .dash-col-estado { display: none; }
        }

        .dash-products-total { padding: 10px 16px; border-top: 1px solid var(--border); display: flex; align-items: center; justify-content: space-between; gap: 8px; background: rgba(232,85,85,0.06); }
        .dash-total-label { font-size: 0.75rem; color: #e85555; font-weight: 600; }
        .dash-total-val { font-size: 0.875rem; font-weight: 800; color: #e85555; }

        /* Inline edit panel */
        .dash-edit-panel { border-top: 1px solid var(--border); background: var(--surface); padding: 16px; }
        .dash-edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 14px; }
        @media (max-width: 400px) { .dash-edit-grid { grid-template-columns: 1fr; } }
        .dash-edit-field label { display: block; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-2); margin-bottom: 5px; }
        .dash-edit-field input { width: 100%; padding: 8px 10px; border: 1.5px solid var(--border); border-radius: 8px; background: var(--bg); color: var(--text); font-size: 0.875rem; font-family: inherit; box-sizing: border-box; }
        .dash-edit-field input:focus { outline: none; border-color: var(--accent); }
        .dash-edit-result { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; padding: 12px 14px; background: var(--bg); border-radius: 10px; border: 1px solid var(--border); }
        .dash-edit-stat label { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted-2); display: block; margin-bottom: 4px; }
        .dash-edit-stat span { font-size: 0.9375rem; font-weight: 800; }
        .dash-guidance { padding: 10px 14px; background: rgba(249,215,27,0.06); border: 1px solid rgba(249,215,27,0.2); border-radius: 8px; margin-bottom: 14px; font-size: 0.8125rem; }
        .dash-guidance strong { color: var(--text); }
        .dash-guidance span { color: var(--muted); }
        .dash-pl-toggle { background: none; border: 1px solid var(--border); color: var(--muted); font-size: 0.75rem; padding: 5px 10px; border-radius: 6px; cursor: pointer; font-family: inherit; margin-bottom: 10px; }
        .dash-pl-body { padding: 10px 14px; background: var(--bg); border-radius: 8px; margin-bottom: 14px; font-size: 0.875rem; }
        .dash-pl-units { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; color: var(--muted); }
        .dash-pl-units input { width: 60px; padding: 4px 8px; border: 1.5px solid var(--border); border-radius: 6px; background: var(--surface); color: var(--text); font-size: 0.875rem; font-family: inherit; text-align: center; }
        .dash-edit-actions { display: flex; gap: 8px; }
        .dash-save-btn { flex: 1; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.875rem; padding: 9px; border-radius: 8px; border: none; cursor: pointer; font-family: inherit; }
        .dash-save-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .dash-cancel-btn { background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.875rem; padding: 9px 16px; border-radius: 8px; cursor: pointer; font-family: inherit; }
        .dash-add-btn { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; padding: 13px; background: none; border: 1.5px dashed var(--border); color: var(--muted); font-size: 0.875rem; font-weight: 600; border-radius: 0 0 12px 12px; cursor: pointer; font-family: inherit; text-decoration: none; }
        .dash-add-btn:hover { border-color: var(--accent); color: var(--accent); background: rgba(249,215,27,0.04); text-decoration: none; }
      `}</style>

      <div className="dash-wrap">

        {/* Header */}
        <div className="dash-header">
          <div className="dash-user">
            <div className="dash-avatar">{initial}</div>
            <div>
              <div className="dash-email">{session.email}</div>
              <span className={`dash-plan-badge ${isFree ? 'dash-plan-badge-free' : 'dash-plan-badge-paid'}`}>
                Plan {planLabel}
              </span>
            </div>
          </div>
          <button className="dash-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>

        {/* Mis compras */}
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

        {/* Banner upgrade */}
        {isFree && (
          <div className="dash-upgrade-banner" style={{ marginBottom: 40 }}>
            <div className="dash-upgrade-text">
              <strong>Estás en el plan gratuito</strong>
              Comprá un plan para desbloquear productos ilimitados y análisis completo.
            </div>
            <Link href="/checkout" className="dash-upgrade-btn">Ver planes →</Link>
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
              Calcular mi primer producto →
            </Link>
          </div>
        ) : (
          <div className="dash-products-table">
            <div className="dash-products-head">
              <span>Producto</span>
              <span>Ganancia/u.</span>
              <span className="dash-col-estado">Estado</span>
              <span className="dash-col-prioridad">Prioridad</span>
              <span></span>
            </div>

            {sortedProducts.map(p => {
              const ganancia = p.detalle?.ganancia ?? p.precio * (p.margen_pct / 100);
              const isEditing = editingId === p.id;
              const editResult = isEditing ? getEditResult(p, editPrecio, editCosto) : null;
              const plExpanded = expandedPl.has(p.id);
              const catKey = findCatKey(p.categoria);
              const precioMinimo = precioParaMargenObjetivo(p.costo, ESTIMADOS_ENVIO_CLP[(p.detalle?.envioKey ?? 'mediano') as EstimadoEnvioKey].valor, catKey, (p.detalle?.tipo ?? 'clasica') as 'clasica' | 'premium', 0);
              const precioObjetivo = precioParaMargenObjetivo(p.costo, ESTIMADOS_ENVIO_CLP[(p.detalle?.envioKey ?? 'mediano') as EstimadoEnvioKey].valor, catKey, (p.detalle?.tipo ?? 'clasica') as 'clasica' | 'premium', 30);

              return (
                <div key={p.id}>
                  <div
                    className="dash-products-row"
                    onClick={() => startEdit(p)}
                    style={{ background: isEditing ? 'var(--surface)' : undefined }}
                  >
                    <div>
                      <div className="dash-prod-name">{p.nombre}</div>
                      <div className="dash-prod-cat">{p.categoria}</div>
                    </div>
                    <span style={{ fontWeight: 700, color: ganancia >= 0 ? '#2dd4a0' : '#e85555' }}>
                      {ganancia < 0 ? '−' : ''}${fmt(Math.abs(ganancia))}
                    </span>
                    <span className="dash-col-estado" style={{ fontSize: '0.8125rem', color: getEstadoColor(p.margen_pct) }}>
                      {getEstado(p.margen_pct)}
                    </span>
                    <span className="dash-col-prioridad" style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>
                      {getPrioridad(ganancia, p.margen_pct)}
                    </span>
                    <button
                      className="dash-prod-del"
                      title="Eliminar"
                      onClick={e => { e.stopPropagation(); handleDelete(p.id); }}
                    >×</button>
                  </div>

                  {isEditing && (
                    <div className="dash-edit-panel">
                      <div className="dash-edit-grid">
                        <div className="dash-edit-field">
                          <label>Precio de venta (CLP)</label>
                          <input
                            type="number"
                            value={editPrecio}
                            onChange={e => setEditPrecio(e.target.value)}
                            placeholder={String(p.precio)}
                          />
                        </div>
                        <div className="dash-edit-field">
                          <label>Costo del producto (CLP)</label>
                          <input
                            type="number"
                            value={editCosto}
                            onChange={e => setEditCosto(e.target.value)}
                            placeholder={String(p.costo)}
                          />
                        </div>
                      </div>

                      {editResult && (
                        <div className="dash-edit-result">
                          <div className="dash-edit-stat">
                            <label>Ganancia/u.</label>
                            <span style={{ color: editResult.esCosteable ? '#2dd4a0' : '#e85555' }}>
                              {editResult.gananciaAbsoluta < 0 ? '−' : ''}${fmt(Math.abs(editResult.gananciaAbsoluta))}
                            </span>
                          </div>
                          <div className="dash-edit-stat">
                            <label>Margen</label>
                            <span style={{ color: getEstadoColor(editResult.margenPct) }}>
                              {editResult.margenPct.toFixed(1).replace('.', ',')}%
                            </span>
                          </div>
                          <div className="dash-edit-stat">
                            <label>Estado</label>
                            <span style={{ fontSize: '0.875rem', color: getEstadoColor(editResult.margenPct) }}>
                              {getEstado(editResult.margenPct)}
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="dash-guidance">
                        <strong>Precio mínimo rentable:</strong>{' '}
                        <span>${fmt(precioMinimo)}</span>
                        {precioObjetivo > 0 && (
                          <> &nbsp;·&nbsp; <strong>Precio objetivo (30% margen):</strong>{' '}
                          <span>${fmt(precioObjetivo)}</span></>
                        )}
                      </div>

                      <button
                        className="dash-pl-toggle"
                        onClick={() => setExpandedPl(prev => {
                          const next = new Set(prev);
                          next.has(p.id) ? next.delete(p.id) : next.add(p.id);
                          return next;
                        })}
                      >
                        {plExpanded ? '▲' : '▼'} Ver impacto en tu negocio
                      </button>

                      {plExpanded && (() => {
                        const g = editResult ? editResult.gananciaAbsoluta : ganancia;
                        const mensual = g * plUnits;
                        return (
                          <div className="dash-pl-body">
                            <div className="dash-pl-units">
                              <span>Si vendés</span>
                              <input
                                type="number"
                                value={plUnits}
                                onChange={e => setPlUnits(Math.max(1, parseInt(e.target.value) || 1))}
                                min={1}
                              />
                              <span>unidades al mes:</span>
                            </div>
                            <div style={{ fontWeight: 700, fontSize: '1rem', color: mensual >= 0 ? '#2dd4a0' : '#e85555' }}>
                              {mensual < 0 ? 'Perdés ' : 'Ganás '}
                              {mensual < 0 ? '−' : ''}${fmt(Math.abs(mensual))} al mes después de todos los costos ML.
                            </div>
                          </div>
                        );
                      })()}

                      <div className="dash-edit-actions">
                        <button
                          className="dash-save-btn"
                          onClick={() => handleSave(p)}
                          disabled={saving || !editResult}
                        >
                          {saving ? 'Guardando…' : 'Guardar cambios'}
                        </button>
                        <button className="dash-cancel-btn" onClick={() => setEditingId(null)}>Cancelar</button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {(() => {
              const perdidos = products.filter(p => (p.detalle?.ganancia ?? p.precio * (p.margen_pct / 100)) < 0);
              if (perdidos.length === 0) return null;
              const totalPerdido = perdidos.reduce((s, p) => s + Math.abs(p.detalle?.ganancia ?? p.precio * (p.margen_pct / 100)), 0);
              return (
                <div className="dash-products-total">
                  <span className="dash-total-label">
                    {perdidos.length === 1 ? '1 producto en pérdida' : `${perdidos.length} productos en pérdida`}
                  </span>
                  <span className="dash-total-val">−${fmt(totalPerdido)} / unidad</span>
                </div>
              );
            })()}

            <Link href="/calculadora-ml" className="dash-add-btn">
              + Agregar producto
            </Link>
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
