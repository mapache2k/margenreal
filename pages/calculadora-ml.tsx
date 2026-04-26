import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import { useState, useEffect, useRef } from 'react';
import posthog from 'posthog-js';
import {
  calcularML,
  precioParaMargenObjetivo,
  ML_CATEGORIAS,
  ESTIMADOS_ENVIO_CLP,
  type MLChileCategoria,
  type MLChileTipoPublicacion,
  type EstimadoEnvioKey,
} from '../lib/mlChileEngine';

const CATEGORIAS_OPTIONS = Object.entries(ML_CATEGORIAS).map(([k, v]) => ({
  value: k as MLChileCategoria,
  label: v.label,
  pctClasica: Math.round(v.comisionClasica * 100),
  pctPremium: Math.round(v.comisionPremium * 100),
}));

type ProductoGuardado = {
  id: number;
  nombre: string;
  costo: number;
  precio: number;
  margenPct: number;
  ganancia: number;
  esCosteable: boolean;
  categoria: string;
};

let _nextId = 1;

export default function CalculadoraML() {
  const [nombre, setNombre] = useState('');
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [margenObj, setMargenObj] = useState('30');
  const [categoria, setCategoria] = useState<MLChileCategoria>('otros');
  const [tipo, setTipo] = useState<MLChileTipoPublicacion>('clasica');
  const [envioKey, setEnvioKey] = useState<EstimadoEnvioKey>('mediano');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [productos, setProductos] = useState<ProductoGuardado[]>([]);
  const [slotsUsados, setSlotsUsados] = useState(0);
  const [hydrated, setHydrated] = useState(false);
  const [showComoCalc, setShowComoCalc] = useState(false);
  const [isPro, setIsPro] = useState(false);
  const capturedOnce = useRef(false);
  const startedOnce = useRef(false);

  // Cargar estado persistido al montar + verificar sesión pro
  useEffect(() => {
    try {
      const stored = localStorage.getItem('mr_productos');
      if (stored) setProductos(JSON.parse(stored));
      const slots = localStorage.getItem('mr_slots');
      if (slots) setSlotsUsados(parseInt(slots, 10));
    } catch {}
    setHydrated(true);

    const token = localStorage.getItem('mr_session');
    if (token) {
      fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session: token }),
      })
        .then(r => r.json())
        .then(data => { if (data.valid && (data.plan === 'starter' || data.plan === 'pro')) setIsPro(true); })
        .catch(() => {});
    }
  }, []);

  // Persistir productos cuando cambian
  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem('mr_productos', JSON.stringify(productos));
  }, [productos, hydrated]);

  const trackStart = () => {
    if (!startedOnce.current) {
      startedOnce.current = true;
      posthog.capture('calculator_started', { calculator: 'ml_chile' });
    }
  };

  const costoNum = parseFloat(costo) || 0;
  const precioNum = parseFloat(precio) || 0;
  const margenObjNum = parseFloat(margenObj) || 0;
  const costoEnvio = ESTIMADOS_ENVIO_CLP[envioKey].valor;

  const resultado = costoNum > 0 && precioNum > 0
    ? calcularML({ costoCLP: costoNum, precioVenta: precioNum, categoria, tipoPublicacion: tipo, costoEnvio })
    : null;

  const precioIdeal = costoNum > 0
    ? precioParaMargenObjetivo(costoNum, costoEnvio, categoria, tipo, margenObjNum)
    : 0;

  useEffect(() => {
    if (resultado && !capturedOnce.current) {
      capturedOnce.current = true;
      posthog.capture('calculator_completed', { calculator: 'ml_chile', tipo, categoria });
    }
  }, [resultado]);

  const fmt = (n: number) => {
    const abs = Math.abs(n);
    const sign = n < 0 ? '−' : '';
    if (abs >= 1_000_000_000) return `${sign}$${(abs / 1_000_000_000).toFixed(1).replace('.', ',')}B`;
    if (abs >= 1_000_000) return `${sign}$${(abs / 1_000_000).toFixed(1).replace('.', ',')}M`;
    return n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  };

  const fmtPct = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000) return n < 0 ? '<−999%' : '>999%';
    return n.toFixed(1).replace('.', ',') + '%';
  };

  const FREE_LIMIT = 3;
  const limitAlcanzado = !isPro && slotsUsados >= FREE_LIMIT;

  const handleAgregarProducto = () => {
    if (!resultado || limitAlcanzado) return;
    const newSlots = slotsUsados + 1;
    setSlotsUsados(newSlots);
    if (!isPro) localStorage.setItem('mr_slots', newSlots.toString());
    const catLabel = ML_CATEGORIAS[categoria].label;
    const nombreFinal = nombre.trim() || `Producto ${_nextId}`;
    setProductos(prev => {
      const nuevo: ProductoGuardado = {
        id: _nextId++,
        nombre: nombreFinal,
        costo: costoNum,
        precio: precioNum,
        margenPct: resultado.margenPct,
        ganancia: resultado.gananciaAbsoluta,
        esCosteable: resultado.esCosteable,
        categoria: catLabel,
      };
      return [...prev, nuevo].sort((a, b) => a.margenPct - b.margenPct);
    });

    if (isPro) {
      const token = localStorage.getItem('mr_session');
      if (token) {
        fetch('/api/user/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            nombre: nombreFinal, categoria: catLabel,
            precio: precioNum, costo: costoNum,
            margen_pct: resultado.margenPct,
            detalle: { tipo, envioKey, ganancia: resultado.gananciaAbsoluta },
          }),
        }).catch(() => {});
      }
    }

    setNombre('');
    setCosto('');
    setPrecio('');
    capturedOnce.current = false;
  };

  const handleEliminarProducto = (id: number) => {
    setProductos(prev => prev.filter(p => p.id !== id));
  };

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) posthog.capture('free_signup', { source: 'calculadora_ml' });
    } catch { /* optimistic */ }
  };

  const catConfig = ML_CATEGORIAS[categoria];
  const comisionActual = tipo === 'premium' ? catConfig.comisionPremium : catConfig.comisionClasica;

  return (
    <Layout>
      <Head>
        <title>Calculadora de Margen para MercadoLibre Chile — Margen Real</title>
        <meta name="description" content="Calculá tu margen real como vendedor en MercadoLibre Chile. Incluye comisiones por categoría, IVA 19% y costos de envío reales." />
      </Head>

      <div className="page-wrap">
        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Para vendedores de MercadoLibre Chile
          </div>
          <h1 className="page-h1">¿Cuánto te queda<br />después de ML?</h1>
          <p className="page-lead">
            Calculá tu margen real como vendedor. Incluye comisión por categoría,
            IVA 19% y costo de envío. Sin sorpresas.
          </p>
        </div>
      </div>

      <div className="single-wrap">
        <div className="tool-grid">

          {/* Panel de inputs */}
          <div className="inputs-card">
            <h3>Tu publicación</h3>

            {/* Nombre del producto */}
            <div className="sf">
              <label>Nombre del producto (opcional)</label>
              <input
                type="text"
                placeholder="ej. Zapatillas Nike Air"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>

            {/* Tipo de publicación */}
            <div style={{ marginBottom: 16 }}>
              <div className="tipo-label">Tipo de publicación</div>
              <div className="tipo-toggle">
                <button
                  className={`tipo-btn${tipo === 'clasica' ? ' active' : ''}`}
                  onClick={() => setTipo('clasica')}
                  type="button"
                >
                  Clásica
                  <span>{ML_CATEGORIAS[categoria].comisionClasica * 100}% comisión</span>
                </button>
                <button
                  className={`tipo-btn${tipo === 'premium' ? ' active' : ''}`}
                  onClick={() => setTipo('premium')}
                  type="button"
                >
                  Premium
                  <span>{ML_CATEGORIAS[categoria].comisionPremium * 100}% comisión</span>
                </button>
              </div>
            </div>

            {/* Categoría */}
            <div className="sf">
              <label>Categoría</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value as MLChileCategoria)}>
                {CATEGORIAS_OPTIONS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <div className="comision-chip">
                Comisión ML: {Math.round(comisionActual * 100)}% + IVA 19% = {(comisionActual * 1.19 * 100).toFixed(1)}% efectivo
              </div>
            </div>

            {/* Costo del producto */}
            <div className="sf">
              <label>Costo del producto (CLP)</label>
              <input
                type="number"
                placeholder="15.000"
                value={costo}
                onChange={e => { trackStart(); setCosto(e.target.value); }}
              />
            </div>

            {/* Precio de venta */}
            <div className="sf">
              <label>Precio de venta en ML (CLP)</label>
              <input
                type="number"
                placeholder="29.990"
                value={precio}
                onChange={e => setPrecio(e.target.value)}
              />
            </div>

            {/* Costo de envío */}
            <div className="sf">
              <label>Costo de envío que asumes</label>
              <select value={envioKey} onChange={e => setEnvioKey(e.target.value as EstimadoEnvioKey)}>
                {Object.entries(ESTIMADOS_ENVIO_CLP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}{v.valor > 0 ? ` — $${v.valor.toLocaleString('es-CL')}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              {costoNum > 0 && precioNum === 0
                ? `ML cobra ${(comisionActual * 1.19 * 100).toFixed(1)}% efectivo sobre tu precio. Ingresá el precio para ver cuánto te queda.`
                : 'Resultados automáticos. Comisiones basadas en tarifas vigentes ML Chile.'
              }
            </div>

            {/* Duda — ¿Cómo calculamos esto? */}
            <div className="como-calc" style={{ marginTop: 12 }}>
              <button className="como-calc-toggle" onClick={() => setShowComoCalc(v => !v)}>
                {showComoCalc ? '−' : '+'} ¿Cómo calculamos esto?
              </button>
              {showComoCalc && (
                <div className="como-calc-body">
                  <p>Tarifas oficiales ML Chile 2025: comisión por categoría (11%–17%) + IVA 19% sobre la comisión + envío que asumís vos.</p>
                  <code>Ganancia = Precio − Comisión×1,19 − Envío − Costo</code>
                  <p style={{ marginTop: 8 }}>Margen = Ganancia ÷ Precio. Precio mínimo = punto donde Ganancia = $0.</p>
                </div>
              )}
            </div>

            {/* Botón agregar — siempre visible */}
            {limitAlcanzado ? (
              <Link
                href="/pricing"
                className="btn-agregar"
                style={{ marginTop: 12, display: 'block', textAlign: 'center', textDecoration: 'none', background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--accent)' }}
                onClick={() => posthog.capture('free_limit_hit', { source: 'calculadora', limit: FREE_LIMIT })}
              >
                🔒 Límite gratis ({FREE_LIMIT} productos) · Ver plan completo →
              </Link>
            ) : resultado ? (
              <button className="btn-agregar" style={{ marginTop: 12 }} onClick={handleAgregarProducto}>
                {slotsUsados > 0
                  ? isPro ? `+ Agregar · ${slotsUsados} guardados` : `+ Agregar · ${slotsUsados}/${FREE_LIMIT} usados`
                  : '+ Comparar con otros productos'
                }
              </button>
            ) : (
              <button className="btn-agregar" disabled style={{ marginTop: 12, opacity: 0.4, cursor: 'not-allowed' }}>
                {slotsUsados > 0
                  ? isPro ? `Calculá otro producto para agregar · ${slotsUsados} guardados` : `Calculá otro producto para agregar · ${slotsUsados}/${FREE_LIMIT}`
                  : 'Calculá un producto para comparar'}
              </button>
            )}

            {/* Tabla de comparación — siempre visible */}
            <div style={{ marginTop: 20, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span style={{ fontSize: '0.8125rem', fontWeight: 700, color: 'var(--text)' }}>
                  Comparación{' '}
                  {isPro
                    ? <span style={{ color: 'var(--accent)', fontWeight: 700, fontSize: '0.6875rem' }}>Pro</span>
                    : <span style={{ color: 'var(--muted)', fontWeight: 400 }}>{slotsUsados}/{FREE_LIMIT}</span>
                  }
                </span>
                {productos.length > 0 && (
                  <button
                    onClick={() => { setProductos([]); localStorage.removeItem('mr_productos'); }}
                    style={{ fontSize: '0.75rem', color: 'var(--muted)', background: 'none', border: 'none', cursor: 'pointer', padding: '2px 6px' }}
                  >
                    Limpiar
                  </button>
                )}
              </div>
              <div style={{ border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden', fontSize: '0.8125rem' }}>
                {productos.length === 0 ? (
                  <div style={{ padding: '20px 14px', textAlign: 'center', color: 'var(--muted)', fontSize: '0.8125rem', lineHeight: 1.6 }}>
                    Calculá un producto y hacé clic en<br /><em>Comparar</em> para verlo aquí.
                  </div>
                ) : (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', padding: '7px 14px', background: 'var(--bg)', fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--muted-2)' }}>
                      <span>Producto</span><span>Ganancia</span><span>Margen</span><span></span>
                    </div>
                    {productos.map(p => (
                      <div key={p.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', padding: '10px 14px', borderTop: '1px solid var(--border)', alignItems: 'center', gap: 4 }}>
                        <div>
                          <div style={{ color: 'var(--text)', fontWeight: 500 }}>{p.nombre}</div>
                          <div style={{ fontSize: '0.6875rem', color: 'var(--muted)' }}>{p.categoria}</div>
                        </div>
                        <span style={{ fontWeight: 700, color: p.ganancia >= 0 ? '#2dd4a0' : '#e85555' }}>
                          {p.ganancia < 0 ? '−' : ''}${fmt(Math.abs(p.ganancia))}
                        </span>
                        <span style={{ color: 'var(--muted)', fontSize: '0.75rem' }}>
                          {p.margenPct.toFixed(1).replace('.', ',')}%
                        </span>
                        <button onClick={() => handleEliminarProducto(p.id)} style={{ color: 'var(--muted-2)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', lineHeight: 1, padding: '0 2px' }} title="Eliminar">×</button>
                      </div>
                    ))}
                    {(() => {
                      const perdidos = productos.filter(p => p.ganancia < 0);
                      const totalPerdido = perdidos.reduce((s, p) => s + Math.abs(p.ganancia), 0);
                      if (perdidos.length === 0) return null;
                      return (
                        <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', background: 'rgba(232,85,85,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: '0.75rem', color: '#e85555', fontWeight: 600 }}>
                            {perdidos.length === 1 ? '1 producto en pérdida' : `${perdidos.length} productos en pérdida`}
                          </span>
                          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: '#e85555' }}>
                            −${fmt(totalPerdido)} / unidad
                          </span>
                        </div>
                      );
                    })()}
                    {limitAlcanzado && (
                      <div style={{ padding: '10px 14px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: 'rgba(249,215,27,0.04)' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>🔒 Límite del plan gratis</span>
                        <Link href="/pricing" style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--accent)', textDecoration: 'none' }}
                          onClick={() => posthog.capture('free_limit_hit', { source: 'comparacion' })}>
                          Ver plan →
                        </Link>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

          </div>

          {/* Panel de resultados */}
          <div>
            {resultado ? (
              <div>
                {/* Alert según rentabilidad */}
                {!resultado.esCosteable ? (
                  <div className="alert-card red">
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>Este precio no es rentable.</strong> Después de comisión ML, IVA y envío, perdés ${fmt(Math.abs(resultado.gananciaAbsoluta))} por unidad. El precio mínimo para no perder es <strong>${fmt(resultado.precioMinimoRentable)}</strong>.
                      <div className="tension-stat">El 67% de los vendedores ML descubren que venden a pérdida cuando hacen este cálculo por primera vez.</div>
                    </div>
                  </div>
                ) : resultado.margenPct < 15 ? (
                  <div className="alert-card red">
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>Margen muy bajo ({fmtPct(resultado.margenPct)}).</strong> Cualquier devolución, descuento o variación de costo te pone en rojo.
                      <div className="tension-stat">Operar con menos del 15% de margen es la principal causa de quiebra en vendedores ML Chile.</div>
                    </div>
                  </div>
                ) : (
                  <div className="alert-card green">
                    <span className="alert-icon">✓</span>
                    <div>
                      <strong>Publicación rentable.</strong> De cada ${fmt(precioNum)} que cobrás, <strong>${fmt(resultado.gananciaAbsoluta)}</strong> son tuyos después de todos los costos ML.
                    </div>
                  </div>
                )}

                {/* Métricas principales */}
                <div className="metrics-grid">
                  <div className={`metric-card${resultado.esCosteable ? ' highlight' : ' danger'}`}>
                    <div className="metric-lbl">Lo que te queda</div>
                    <div className={`metric-val ${resultado.esCosteable ? 'accent' : 'danger'}`}>
                      ${fmt(resultado.gananciaAbsoluta)}
                    </div>
                    <div className="metric-sub">Por unidad vendida</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Margen sobre venta</div>
                    <div className={`metric-val ${resultado.margenPct >= 20 ? 'green' : resultado.margenPct >= 10 ? '' : 'danger'}`}>
                      {fmtPct(resultado.margenPct)}
                    </div>
                    <div className="metric-sub">Ganancia / precio venta</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Margen sobre costo</div>
                    <div className="metric-val">
                      {fmtPct(resultado.margenSobreCosto)}
                    </div>
                    <div className="metric-sub">Ganancia / costo producto</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Precio mínimo rentable</div>
                    <div className="metric-val">${fmt(resultado.precioMinimoRentable)}</div>
                    <div className="metric-sub">Para no perder dinero</div>
                  </div>
                </div>

                {/* Desglose */}
                <div className="desglose-card">
                  <div className="desglose-title">Desglose de cada venta</div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">Precio de venta</span>
                    <span className="desglose-val">${fmt(resultado.precioVenta)}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">− Comisión ML ({(resultado.comisionPct * 100).toFixed(0)}%)</span>
                    <span className="desglose-val red">−${fmt(resultado.comisionML)}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">− IVA sobre comisión (19%)</span>
                    <span className="desglose-val red">−${fmt(resultado.ivaComision)}</span>
                  </div>
                  {resultado.costoEnvio > 0 && (
                    <div className="desglose-row">
                      <span className="desglose-lbl">− Costo de envío</span>
                      <span className="desglose-val red">−${fmt(resultado.costoEnvio)}</span>
                    </div>
                  )}
                  <div className="desglose-row" style={{ borderTop: '1px solid var(--border)', paddingTop: 12 }}>
                    <span className="desglose-lbl">= Ingresos netos</span>
                    <span className="desglose-val">${fmt(resultado.ingresosNetos)}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">− Costo del producto</span>
                    <span className="desglose-val red">−${fmt(resultado.costoProducto)}</span>
                  </div>
                  <div className="desglose-row" style={{ paddingTop: 12 }}>
                    <span style={{ fontWeight: 700 }}>= Tu ganancia real</span>
                    <span className={`desglose-val ${resultado.esCosteable ? 'green' : 'red'}`}>
                      {resultado.esCosteable ? '' : '−'}${fmt(Math.abs(resultado.gananciaAbsoluta))}
                    </span>
                  </div>
                </div>

                {/* Precio ideal para margen objetivo */}
                <div className="ideal-card">
                  <div className="ideal-title">Precio para tu margen objetivo</div>
                  <div className="ideal-margen-row">
                    <div className="ideal-margen-input">
                      <input
                        type="number"
                        value={margenObj}
                        onChange={e => setMargenObj(e.target.value)}
                        min={1}
                        max={80}
                      />
                      <span className="pct-symbol">%</span>
                    </div>
                    <span className="ideal-margen-label">de margen objetivo</span>
                  </div>
                  {precioIdeal > 0 ? (
                    <>
                      <div className="ideal-price">${fmt(precioIdeal)}</div>
                      <div className="ideal-sub">
                        A este precio, después de comisión ML ({(comisionActual * 100).toFixed(0)}%), IVA 19%{costoEnvio > 0 ? ` y envío ($${fmt(costoEnvio)})` : ''}, te queda un {margenObj}% de margen real.
                      </div>
                    </>
                  ) : (
                    <div className="ideal-sub" style={{ color: '#ef4444' }}>
                      El margen objetivo es demasiado alto para esta categoría y tipo de publicación.
                    </div>
                  )}
                </div>

                {/* Interpretación */}
                <div style={{ margin: '16px 0', padding: '18px 22px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                  <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--muted-2)', marginBottom: 8 }}>
                    Lo que esto significa
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.7, margin: 0 }}>
                    {!resultado.esCosteable
                      ? `Estás vendiendo a pérdida. Por cada unidad que vendés, perdés $${fmt(Math.abs(resultado.gananciaAbsoluta))}. Eso no se compensa con volumen — se multiplica.`
                      : resultado.margenPct < 15
                      ? `Tu margen de ${fmtPct(resultado.margenPct)} es frágil. Una devolución, un descuento del 10% o un ajuste de envío puede ponerte en rojo. Se recomienda al menos 20% para operar con seguridad.`
                      : `Tu margen de ${fmtPct(resultado.margenPct)} es sólido para este producto. Pero revisá todos tus productos — es raro que todos tengan el mismo margen.`
                    }
                  </p>
                </div>

                {/* Qué podés hacer ahora */}
                {(() => {
                  const acciones = !resultado.esCosteable ? [
                    { icon: '📈', titulo: `Subir precio a $${fmt(resultado.precioMinimoRentable)}`, detalle: 'El mínimo para no perder dinero en cada venta.' },
                    { icon: '✂️', titulo: 'Reducir costos del producto o envío', detalle: 'Cada peso que bajás en costos sube tu margen directamente.' },
                    { icon: '🚫', titulo: 'Evaluar si ML es el canal correcto', detalle: 'Algunos productos no soportan las comisiones. La venta directa puede ser más rentable.' },
                  ] : resultado.margenPct < 15 ? [
                    { icon: '📈', titulo: `Subir precio a $${fmt(precioIdeal)}`, detalle: `Para alcanzar el ${margenObj}% de margen objetivo y protegerte de devoluciones o descuentos.` },
                    { icon: '✂️', titulo: 'Negociar costos con tu proveedor', detalle: 'Cada reducción en costo se convierte directamente en margen.' },
                    { icon: '📦', titulo: 'Revisá el tipo de publicación', detalle: 'Premium da más visibilidad pero cobra más comisión. Calculá si el volumen lo justifica.' },
                  ] : [
                    { icon: '✅', titulo: 'Mantener este precio', detalle: `Tu margen de ${fmtPct(resultado.margenPct)} es sólido. Protegerlo es tan importante como conseguirlo.` },
                    { icon: '📊', titulo: 'Revisá el resto de tu catálogo', detalle: 'Es raro que todos tus productos tengan el mismo margen. Encontrá los que están en rojo.' },
                    { icon: '🔁', titulo: 'Escalá lo que funciona', detalle: 'Ponele más esfuerzo a los productos con mejor margen, no solo a los que más venden.' },
                  ];
                  return (
                    <div style={{ margin: '16px 0', padding: '18px 22px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12 }}>
                      <div style={{ fontSize: '0.625rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: 'var(--muted-2)', marginBottom: 12 }}>
                        Qué podés hacer ahora
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {acciones.map((a, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)' }}>
                            <span style={{ fontSize: '1.125rem', lineHeight: 1.4 }}>{a.icon}</span>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text)' }}>{a.titulo}</div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 2, lineHeight: 1.5 }}>{a.detalle}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Impacto mensual */}
                <div style={{ padding: '14px 20px', background: resultado.esCosteable ? 'rgba(45,212,160,0.07)' : 'rgba(232,85,85,0.07)', borderRadius: 10, marginBottom: 16, fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6 }}>
                  Si vendés <strong style={{ color: 'var(--text)' }}>10 unidades al mes</strong> a este precio,{' '}
                  {resultado.esCosteable
                    ? <><strong style={{ color: '#2dd4a0' }}>ganás ${fmt(resultado.gananciaAbsoluta * 10)}</strong> al mes después de todos los costos ML.</>
                    : <><strong style={{ color: '#e85555' }}>perdés ${fmt(Math.abs(resultado.gananciaAbsoluta * 10))}</strong> al mes aunque vendas bien.</>
                  }
                </div>

                {/* Primary CTA — Esto es solo un producto */}
                <div style={{ marginTop: 16, padding: '24px 22px', background: 'linear-gradient(135deg, rgba(249,215,27,0.06), rgba(249,215,27,0.02))', border: '1.5px solid var(--border)', borderRadius: 16, textAlign: 'center' }}>
                  <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--text)', marginBottom: 8, fontFamily: 'var(--font-display)' }}>
                    Esto es solo un producto
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--muted)', lineHeight: 1.6, maxWidth: 380, margin: '0 auto 20px' }}>
                    Si tenés varios productos, es muy probable que estés perdiendo margen en más de uno. La mayoría lo descubre demasiado tarde.
                  </p>
                  <Link
                    href="/checkout"
                    style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--bg)', fontWeight: 800, fontSize: '0.9375rem', padding: '13px 28px', borderRadius: 12, textDecoration: 'none' }}
                    onClick={() => posthog.capture('cta_analizar_todos', { source: 'calculadora_resultado' })}
                  >
                    Analizar todos mis productos →
                  </Link>
                </div>

                {/* Preview multi-producto — solo usuarios free */}
                {!isPro && (
                  <div style={{ marginTop: 16, border: '1.5px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
                    <div style={{ padding: '16px 20px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.9375rem', color: 'var(--text)', marginBottom: 4 }}>Estás viendo solo un producto</div>
                      <div style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>Tu margen no depende de un solo producto.</div>
                    </div>
                    <div style={{ padding: '10px 20px', background: 'rgba(232,85,85,0.07)', borderBottom: '1px solid var(--border)', fontSize: '0.8125rem', color: '#e85555', fontWeight: 600 }}>
                      ⚠️ Probablemente tenés productos perdiendo dinero sin darte cuenta
                    </div>
                    {(() => {
                      const getEstado = (m: number) => m < 0 ? '❌ Pérdida' : m < 15 ? '⚠️ Bajo' : '✅ Saludable';
                      const getPrioridad = (g: number, m: number) => g < 0 || m < 10 ? '🔥 Alta' : m < 20 ? '⚠️ Media' : '—';
                      const visibleRows = [
                        { nombre: nombre.trim() || 'Este producto', ganancia: resultado.gananciaAbsoluta, margenPct: resultado.margenPct, current: true },
                        { nombre: 'Mochila Outdoor 45L', ganancia: -1430, margenPct: -8.4, current: false },
                        { nombre: 'Auriculares Inalámbricos', ganancia: 5900, margenPct: 23.6, current: false },
                      ];
                      return (
                        <>
                          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '7px 16px', background: 'var(--bg)', fontSize: '0.5625rem', fontWeight: 800, textTransform: 'uppercase' as const, letterSpacing: '0.08em', color: 'var(--muted-2)', borderBottom: '1px solid var(--border)' }}>
                            <span>Producto</span><span>Ganancia/u.</span><span>Estado</span><span>Prioridad</span>
                          </div>
                          {visibleRows.map((row, i) => (
                            <div key={i} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: '1px solid var(--border)', alignItems: 'center', background: row.current ? 'rgba(249,215,27,0.04)' : 'transparent' }}>
                              <span style={{ fontWeight: row.current ? 700 : 500, color: 'var(--text)', fontSize: '0.8125rem' }}>
                                {row.nombre}
                                {row.current && <span style={{ marginLeft: 6, fontSize: '0.5625rem', background: 'rgba(249,215,27,0.18)', color: 'var(--accent)', fontWeight: 800, padding: '1px 5px', borderRadius: 4 }}>tú</span>}
                              </span>
                              <span style={{ fontWeight: 700, fontSize: '0.8125rem', color: row.ganancia >= 0 ? '#2dd4a0' : '#e85555' }}>
                                {row.ganancia < 0 ? '−' : ''}${fmt(Math.abs(row.ganancia))}
                              </span>
                              <span style={{ fontSize: '0.75rem' }}>{getEstado(row.margenPct)}</span>
                              <span style={{ fontSize: '0.75rem' }}>{getPrioridad(row.ganancia, row.margenPct)}</span>
                            </div>
                          ))}
                          {[0, 1].map(i => (
                            <div key={`locked-${i}`} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', padding: '10px 16px', borderBottom: i === 0 ? '1px solid var(--border)' : undefined, alignItems: 'center', filter: 'blur(3px)', opacity: 0.45, userSelect: 'none', pointerEvents: 'none' as const }}>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>🔒 Producto {i + 4}</span>
                              <span style={{ fontSize: '0.8125rem', color: 'var(--muted)' }}>$—</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>—</span>
                              <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>—</span>
                            </div>
                          ))}
                          <div style={{ padding: '16px 20px', background: 'var(--surface)', textAlign: 'center' }}>
                            <div style={{ fontSize: '0.75rem', color: 'var(--muted)', marginBottom: 12 }}>
                              Aquí solo podés analizar un producto a la vez.
                            </div>
                            <Link
                              href="/checkout"
                              style={{ display: 'inline-block', background: 'var(--accent)', color: 'var(--bg)', fontWeight: 800, fontSize: '0.875rem', padding: '11px 24px', borderRadius: 10, textDecoration: 'none' }}
                              onClick={() => posthog.capture('cta_analizar_todos', { source: 'preview_table' })}
                            >
                              Analizar todos mis productos →
                            </Link>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}

                {/* Acción — Lead magnet (secundario) */}
                <div className="lead-card" style={{ marginTop: 16 }}>
                  <div className="lead-title">¿Preferís empezar con una guía gratuita?</div>
                  <div className="lead-text">
                    Recibí el checklist de los 5 errores de pricing más comunes en ML Chile.
                  </div>
                  {!emailSent ? (
                    <form className="lead-form" onSubmit={handleEmail}>
                      <input
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                      />
                      <button type="submit">Recibir checklist gratis</button>
                    </form>
                  ) : (
                    <div>
                      <div className="lead-success">¡Listo! Revisá tu email en los próximos minutos.</div>
                      <div className="seq-preview">
                        <div className="seq-item seq-active">Hoy — Los 5 errores de pricing (checklist)</div>
                        <div className="seq-item">Día 3–5 — El error que destruye tu margen en ML</div>
                        <div className="seq-item">Día 7–10 — Cómo calcular tu precio mínimo</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="es">
                <div className="es-icon">🛒</div>
                <div className="es-title">Ingresa tus números para calcular</div>
                <div className="es-text">
                  Completa el costo del producto y el precio de venta.<br />
                  Los resultados aparecen al instante, incluyendo comisión ML, IVA y envío.
                </div>
              </div>
            )}
          </div>
        </div>


      </div>

    </Layout>
  );
}
