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
  const [showComoCalc, setShowComoCalc] = useState(false);
  const capturedOnce = useRef(false);
  const startedOnce = useRef(false);

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

  const handleAgregarProducto = () => {
    if (!resultado) return;
    const catLabel = ML_CATEGORIAS[categoria].label;
    setProductos(prev => {
      const nuevo: ProductoGuardado = {
        id: _nextId++,
        nombre: nombre.trim() || `Producto ${_nextId - 1}`,
        costo: costoNum,
        precio: precioNum,
        margenPct: resultado.margenPct,
        ganancia: resultado.gananciaAbsoluta,
        esCosteable: resultado.esCosteable,
        categoria: catLabel,
      };
      return [...prev, nuevo].sort((a, b) => a.margenPct - b.margenPct);
    });
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
            <span className="social-proof-badge">+3.400 cálculos realizados</span>
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

            {/* Control — Agregar a comparación */}
            {resultado && (
              <button className="btn-agregar" style={{ marginTop: 12 }} onClick={handleAgregarProducto}>
                {productos.length > 0
                  ? `+ Agregar · ${productos.length} producto${productos.length > 1 ? 's' : ''} en comparación`
                  : '+ Comparar con otros productos'
                }
              </button>
            )}
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

                {/* Pago — Upgrade CTA */}
                <div className="upgrade-card">
                  <div className="upgrade-body">
                    <div className="upgrade-text">
                      <strong>¿Vendés más de un producto?</strong> El Plan Starter incluye guías avanzadas de pricing para ML Chile, análisis de canales y plantillas de costos listas para usar.
                    </div>
                    <Link href="/importados" className="btn-upgrade">Ver Plan Starter — USD 19 →</Link>
                  </div>
                </div>

                {/* Acción — Lead magnet */}
                <div className="lead-card" style={{ marginTop: 16 }}>
                  <div className="lead-title">Llevate el checklist de los 5 errores de pricing</div>
                  <div className="lead-text">
                    Gratis. Lo usan más de 3.000 vendedores ML Chile para no vender a pérdida.
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

        {/* Tabla comparación multi-producto */}
        {productos.length > 0 && (
          <div className="comparacion-wrap">
            <div className="comparacion-header">
              <div className="comparacion-title">Comparación de productos ({productos.length})</div>
              <button className="btn-limpiar" onClick={() => setProductos([])}>Limpiar lista</button>
            </div>
            <div className="comp-table-wrap" style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 16, overflow: 'hidden' }}>
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Producto</th>
                    <th>Costo</th>
                    <th>Precio venta</th>
                    <th>Margen</th>
                    <th>Ganancia / unidad</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productos.map(p => {
                    const cls = !p.esCosteable ? 'loss' : p.margenPct < 15 ? 'low' : 'ok';
                    const badge = cls === 'loss' ? 'Pérdida' : cls === 'low' ? 'Margen bajo' : 'Rentable';
                    const fmt = (n: number) => n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
                    return (
                      <tr key={p.id} className={cls}>
                        <td>
                          <div className="comp-nombre">{p.nombre}</div>
                          <div className="comp-cat">{p.categoria}</div>
                        </td>
                        <td>${fmt(p.costo)}</td>
                        <td>${fmt(p.precio)}</td>
                        <td><span className={`comp-margen ${cls}`}>{p.margenPct.toFixed(1).replace('.', ',')}%</span></td>
                        <td>
                          <span className="comp-ganancia" style={{ color: p.esCosteable ? '#22c55e' : '#ef4444' }}>
                            {p.esCosteable ? '' : '−'}${fmt(Math.abs(p.ganancia))}
                          </span>
                        </td>
                        <td><span className={`comp-badge ${cls}`}>{badge}</span></td>
                        <td><button className="btn-del" onClick={() => handleEliminarProducto(p.id)} title="Eliminar">×</button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

    </Layout>
  );
}
