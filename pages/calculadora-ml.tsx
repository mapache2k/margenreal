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

export default function CalculadoraML() {
  const [costo, setCosto] = useState('');
  const [precio, setPrecio] = useState('');
  const [margenObj, setMargenObj] = useState('30');
  const [categoria, setCategoria] = useState<MLChileCategoria>('otros');
  const [tipo, setTipo] = useState<MLChileTipoPublicacion>('clasica');
  const [envioKey, setEnvioKey] = useState<EstimadoEnvioKey>('mediano');
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const capturedOnce = useRef(false);

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

  const fmt = (n: number) =>
    n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const fmtPct = (n: number) =>
    n.toFixed(1).replace('.', ',') + '%';

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

      <style>{`


        .calc-wrap { max-width: 1060px; margin: 0 auto; padding: 16px 40px 80px; }
        @media(max-width:640px){ .calc-wrap { padding: 16px 20px 60px; } }

        .calc-grid { display: grid; grid-template-columns: 360px 1fr; gap: 24px; align-items: start; }
        @media(max-width:900px){ .calc-grid { grid-template-columns: 1fr; } }

        .inputs-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; position: sticky; top: 80px; }
        .inputs-card h3 { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 22px; line-height: 1; }

        .sf { margin-bottom: 16px; }
        .sf label { display: block; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; line-height: 1; }
        .sf input, .sf select { width: 100%; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 1rem; font-weight: 600; line-height: 1.2; padding: 11px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -moz-appearance: textfield; }
        .sf input::-webkit-outer-spin-button, .sf input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .sf input:focus, .sf select:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(249,215,27,0.08); }
        .sf input::placeholder { color: var(--border); }
        .sf select { appearance: none; cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%23888' d='M1 1l5 5 5-5'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 36px; }
        .sf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        /* Toggle */
        .tipo-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; }
        .tipo-btn { padding: 10px 12px; border-radius: 9px; border: 1.5px solid var(--border); background: var(--bg); color: var(--muted); font-family: var(--font-display); font-weight: 700; font-size: 0.8125rem; cursor: pointer; transition: all 0.15s; text-align: center; line-height: 1.2; }
        .tipo-btn span { display: block; font-size: 0.6875rem; font-weight: 400; color: var(--muted); margin-top: 3px; }
        .tipo-btn.active { border-color: var(--accent); background: rgba(249,215,27,0.08); color: var(--text); }
        .tipo-btn.active span { color: var(--accent); }
        .tipo-label { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 8px; }

        /* Comision chip */
        .comision-chip { display: inline-flex; align-items: center; gap: 5px; background: rgba(249,215,27,0.08); border: 1px solid rgba(249,215,27,0.2); border-radius: 6px; padding: 4px 10px; font-size: 0.75rem; font-weight: 700; color: var(--accent); margin-top: 6px; }

        /* Results */
        .results-panel { }
        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 20px; }
        .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px; }
        .metric-card.highlight { border-color: var(--accent); background: rgba(249,215,27,0.04); }
        .metric-card.danger { border-color: #ef4444; background: rgba(239,68,68,0.04); }
        .metric-lbl { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px; }
        .metric-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; line-height: 1; }
        .metric-val.accent { color: var(--accent); }
        .metric-val.danger { color: #ef4444; }
        .metric-val.green { color: #22c55e; }
        .metric-sub { font-size: 0.75rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }

        .desglose-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 20px; }
        .desglose-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 14px; }
        .desglose-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .desglose-row:last-child { border-bottom: none; font-weight: 700; }
        .desglose-lbl { color: var(--muted); }
        .desglose-val { font-family: var(--font-display); font-weight: 700; color: var(--text); }
        .desglose-val.red { color: #ef4444; }
        .desglose-val.green { color: #22c55e; }

        .ideal-card { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 20px 24px; margin-bottom: 20px; }
        .ideal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; flex-wrap: wrap; gap: 8px; }
        .ideal-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); }
        .ideal-margen-input { display: flex; align-items: center; gap: 6px; background: var(--bg); border: 1.5px solid var(--border); border-radius: 8px; padding: 6px 10px; }
        .ideal-margen-input input { width: 44px; background: transparent; border: none; color: var(--text); font-family: var(--font-display); font-size: 0.9375rem; font-weight: 800; outline: none; text-align: right; -moz-appearance: textfield; }
        .ideal-margen-input input::-webkit-outer-spin-button, .ideal-margen-input input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .ideal-margen-input span { color: var(--muted); font-size: 0.875rem; }
        .ideal-price { font-family: var(--font-display); font-size: 2.5rem; font-weight: 800; letter-spacing: -0.03em; color: var(--accent); line-height: 1; }
        .ideal-sub { font-size: 0.8125rem; color: var(--muted); margin-top: 6px; line-height: 1.5; }

        /* Alert */
        .alert-card { border-radius: var(--radius-lg); padding: 16px 20px; margin-bottom: 20px; display: flex; gap: 12px; align-items: flex-start; font-size: 0.875rem; line-height: 1.6; }
        .alert-card.red { background: rgba(239,68,68,0.07); border: 1px solid rgba(239,68,68,0.2); color: var(--text); }
        .alert-card.green { background: rgba(34,197,94,0.07); border: 1px solid rgba(34,197,94,0.2); color: var(--text); }
        .alert-icon { font-size: 1.25rem; flex-shrink: 0; line-height: 1.3; }

        /* Empty state */
        .es { background: var(--surface); border: 1.5px dashed var(--border); border-radius: 16px; padding: 48px 32px; text-align: center; }
        .es-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
        .es-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 8px; letter-spacing: -0.02em; }
        .es-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        /* Lead magnet */
        .lead-card { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.2); border-radius: 16px; padding: 28px; margin-top: 4px; }
        .lead-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .lead-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; margin-bottom: 16px; }
        .lead-form { display: flex; gap: 10px; flex-wrap: wrap; }
        .lead-form input { flex: 1; min-width: 200px; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 0.9375rem; padding: 11px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s; }
        .lead-form input:focus { border-color: var(--accent); }
        .lead-form button { background: var(--accent); color: #0a0a0e; font-family: var(--font-display); font-weight: 700; font-size: 0.875rem; padding: 11px 20px; border-radius: 9px; border: none; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
        .lead-form button:hover { opacity: 0.9; }
        .lead-success { font-size: 0.875rem; color: var(--success); font-weight: 600; margin-top: 8px; }      `}</style>


      <div className="page-hero centered">
        <div className="section-label">MercadoLibre Chile</div>
        <h1 className="page-h1">¿Cuánto te queda<br />después de ML?</h1>
        <p className="page-lead">
          Calculá tu margen real como vendedor. Incluye comisión por categoría,
          IVA 19% y costo de envío. Sin sorpresas.
        </p>
      </div>

      <div className="calc-wrap">
        <div className="calc-grid">

          {/* Panel de inputs */}
          <div className="inputs-card">
            <h3>Tu publicación</h3>

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
                onChange={e => setCosto(e.target.value)}
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
              <label>Costo de envío que asumís</label>
              <select value={envioKey} onChange={e => setEnvioKey(e.target.value as EstimadoEnvioKey)}>
                {Object.entries(ESTIMADOS_ENVIO_CLP).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}{v.valor > 0 ? ` — $${v.valor.toLocaleString('es-CL')}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Los resultados se actualizan automáticamente. Comisiones basadas en tarifas vigentes ML Chile.
            </div>
          </div>

          {/* Panel de resultados */}
          <div>
            {resultado ? (
              <div className="results-panel">
                {/* Alert según rentabilidad */}
                {!resultado.esCosteable ? (
                  <div className="alert-card red">
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>Este precio no es rentable.</strong> Después de comisión ML, IVA y envío, perdés {fmt(Math.abs(resultado.gananciaAbsoluta))} por unidad. El precio mínimo para no perder es <strong>${fmt(resultado.precioMinimoRentable)}</strong>.
                    </div>
                  </div>
                ) : resultado.margenPct < 15 ? (
                  <div className="alert-card red">
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>Margen muy bajo ({fmtPct(resultado.margenPct)}).</strong> Cualquier devolución, descuento o variación de costo te pone en rojo. Considerá subir el precio o reducir costos.
                    </div>
                  </div>
                ) : (
                  <div className="alert-card green">
                    <span className="alert-icon">✓</span>
                    <div>
                      <strong>Publicación rentable.</strong> Tenés {fmtPct(resultado.margenPct)} de margen sobre venta y ganás ${fmt(resultado.gananciaAbsoluta)} por unidad después de todos los costos ML.
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
                  <div className="ideal-header">
                    <div className="ideal-title">¿A qué precio vender para lograr</div>
                    <div className="ideal-margen-input">
                      <input
                        type="number"
                        value={margenObj}
                        onChange={e => setMargenObj(e.target.value)}
                        min={1}
                        max={80}
                      />
                      <span>% de margen?</span>
                    </div>
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

                {/* Lead magnet */}
                <div className="lead-card">
                  <div className="lead-title">¿Querés dominar los números de tu tienda ML?</div>
                  <div className="lead-text">
                    Recibí gratis el checklist de los 5 errores de pricing que más plata les cuestan a los vendedores de MercadoLibre Chile.
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
                      <button type="submit">Recibir checklist</button>
                    </form>
                  ) : (
                    <div className="lead-success">¡Listo! Revisá tu email (y también Promociones).</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="es">
                <div className="es-icon">🛒</div>
                <div className="es-title">Ingresá tus números para calcular</div>
                <div className="es-text">
                  Completá el costo del producto y el precio de venta.<br />
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
