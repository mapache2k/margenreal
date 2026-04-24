import Head from 'next/head';
import NavBar from '../components/NavBar';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import posthog from 'posthog-js';

interface Inputs {
  costoUSD: string;
  tipoCambio: string;
  flete: string;
  aduana: string;
  comision: string;
  margenObjetivo: string;
}

interface Resultado {
  costoLocal: number;
  costoTotal: number;
  precioMinimo: number;
  margenPesos: number;
}

function calcular(inputs: Inputs): Resultado | null {
  const costoUSD     = parseFloat(inputs.costoUSD)       || 0;
  const tipoCambio   = parseFloat(inputs.tipoCambio)      || 0;
  const flete        = parseFloat(inputs.flete)           / 100;
  const aduana       = parseFloat(inputs.aduana)          / 100;
  const comision     = parseFloat(inputs.comision)        / 100;
  const margen       = parseFloat(inputs.margenObjetivo)  / 100;

  if (!costoUSD || !tipoCambio) return null;

  const costoLocal  = costoUSD * tipoCambio;
  const costoTotal  = costoLocal * (1 + flete + aduana);
  const divisor     = 1 - comision - margen;
  if (divisor <= 0) return null;

  const precioMinimo = costoTotal / divisor;
  const margenPesos  = precioMinimo * margen;

  return { costoLocal, costoTotal, precioMinimo, margenPesos };
}

export default function Calculadora() {
  const [inputs, setInputs] = useState<Inputs>({
    costoUSD:       '',
    tipoCambio:     '',
    flete:          '5',
    aduana:         '10',
    comision:       '5',
    margenObjetivo: '30',
  });
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const calculatedOnce = useRef(false);

  const set = (k: keyof Inputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs(prev => ({ ...prev, [k]: e.target.value }));

  const resultado = calcular(inputs);

  useEffect(() => {
    if (resultado && !calculatedOnce.current) {
      calculatedOnce.current = true;
      posthog.capture('calculator_completed');
    }
  }, [resultado]);

  const fmt = (n: number) =>
    n.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const handleEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailSent(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        posthog.capture('free_signup', { source: 'calculadora' });
      }
    } catch {
      // optimistic — already shown success
    }
  };

  return (
    <>
      <Head>
        <title>Calculadora de Precio para Importados — Margen Real</title>
        <meta name="description" content="Calculá el precio mínimo de venta para tus productos importados. Incluye flete, aduana, comisión de plataforma y margen objetivo." />
      </Head>

      <style>{`
        .tool-header { padding: 56px 40px 32px; max-width: 1100px; margin: 0 auto; text-align: center; }
        @media(max-width:640px){ .tool-header { padding: 40px 20px 24px; } }
        .tool-header h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.01em; line-height: 1.15; margin-bottom: 12px; }
        .tool-header .sub { font-size: 1rem; color: var(--muted); line-height: 1.6; }

        .calc-wrap { max-width: 1060px; margin: 0 auto; padding: 16px 40px 80px; }
        @media(max-width:640px){ .calc-wrap { padding: 16px 20px 60px; } }

        .calc-grid { display: grid; grid-template-columns: 340px 1fr; gap: 24px; align-items: start; }
        @media(max-width:900px){ .calc-grid { grid-template-columns: 1fr; } }

        .inputs-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px 24px; position: sticky; top: 80px; }
        .inputs-card h3 { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 22px; line-height: 1; }

        .sf { margin-bottom: 16px; }
        .sf label { display: block; font-size: 0.625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 7px; line-height: 1; }
        .sf input { width: 100%; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 1rem; font-weight: 600; line-height: 1.2; padding: 11px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s, box-shadow 0.2s; -moz-appearance: textfield; }
        .sf input::-webkit-outer-spin-button, .sf input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .sf input:focus { border-color: var(--accent); box-shadow: 0 0 0 3px rgba(249,215,27,0.08); }
        .sf input::placeholder { color: var(--border); }
        .sf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .btn-calc { width: 100%; margin-top: 20px; background: var(--accent); color: #0a0a0e; font-family: var(--font-display); font-weight: 800; font-size: 0.9375rem; line-height: 1; padding: 15px; border-radius: 11px; border: none; cursor: pointer; transition: box-shadow 0.2s, transform 0.15s; letter-spacing: 0.02em; }
        .btn-calc:hover { box-shadow: 0 6px 24px rgba(249,215,27,0.2); transform: translateY(-1px); }

        /* Results */
        .results-panel { display: none; }
        .results-panel.show { display: block; }

        .metrics-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 12px; margin-bottom: 24px; }
        .metric-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px 20px; }
        .metric-card.highlight { border-color: var(--accent); background: rgba(249,215,27,0.04); }
        .metric-lbl { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 8px; }
        .metric-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; line-height: 1; }
        .metric-val.accent { color: var(--accent); }
        .metric-sub { font-size: 0.75rem; color: var(--muted); margin-top: 4px; }

        .desglose-card { background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 20px 24px; margin-bottom: 20px; }
        .desglose-title { font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); margin-bottom: 14px; }
        .desglose-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid var(--border); font-size: 0.875rem; }
        .desglose-row:last-child { border-bottom: none; font-weight: 700; color: var(--text); }
        .desglose-lbl { color: var(--muted); }
        .desglose-val { font-family: var(--font-display); font-weight: 700; color: var(--text); }

        /* Empty state */
        .es { background: var(--surface); border: 1.5px dashed var(--border); border-radius: 16px; padding: 48px 32px; text-align: center; }
        .es-icon { font-size: 3rem; margin-bottom: 16px; opacity: 0.5; }
        .es-title { font-family: var(--font-display); font-size: 1.1rem; font-weight: 800; color: var(--text); margin-bottom: 8px; letter-spacing: -0.02em; }
        .es-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        /* Lead magnet */
        .lead-card { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.2); border-radius: 16px; padding: 28px; margin-top: 20px; }
        .lead-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .lead-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; margin-bottom: 16px; }
        .lead-form { display: flex; gap: 10px; flex-wrap: wrap; }
        .lead-form input { flex: 1; min-width: 200px; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 0.9375rem; padding: 11px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s; }
        .lead-form input:focus { border-color: var(--accent); }
        .lead-form button { background: var(--accent); color: #0a0a0e; font-family: var(--font-display); font-weight: 700; font-size: 0.875rem; padding: 11px 20px; border-radius: 9px; border: none; cursor: pointer; white-space: nowrap; transition: opacity 0.15s; }
        .lead-form button:hover { opacity: 0.9; }
        .lead-success { font-size: 0.875rem; color: var(--success); font-weight: 600; margin-top: 8px; }

        footer { max-width: var(--section-max); margin: 40px auto 0; padding: 40px var(--section-x) 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; border-top: 1px solid var(--border); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; color: var(--text); font-size: 18px; text-decoration: none; }
        .footer-logo span { color: var(--accent); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .footer-link { font-size: 0.8125rem; color: var(--muted); text-decoration: none; }
        .footer-link:hover { color: var(--text); }
        .footer-copy { font-size: 0.75rem; color: var(--muted); }
      `}</style>

      {/* Nav */}
      <NavBar />

      {/* Header */}
      <div className="tool-header">
        <h1>Calculadora de Precio<br />para Importados</h1>
        <p className="sub">
          Ingresá tus costos reales y obtené el precio mínimo de venta al instante.<br />
          Incluye flete, aduana, comisión de plataforma y tu margen objetivo.
        </p>
      </div>

      <div className="calc-wrap">
        <div className="calc-grid">

          {/* Panel de inputs */}
          <div className="inputs-card">
            <h3>Tus costos</h3>

            <div className="sf-row">
              <div className="sf">
                <label>Costo del producto (USD)</label>
                <input
                  type="number"
                  placeholder="25.00"
                  value={inputs.costoUSD}
                  onChange={set('costoUSD')}
                />
              </div>
              <div className="sf">
                <label>Tipo de cambio</label>
                <input
                  type="number"
                  placeholder="1000"
                  value={inputs.tipoCambio}
                  onChange={set('tipoCambio')}
                />
              </div>
            </div>

            <div className="sf-row">
              <div className="sf">
                <label>Flete / envío (%)</label>
                <input
                  type="number"
                  placeholder="5"
                  value={inputs.flete}
                  onChange={set('flete')}
                />
              </div>
              <div className="sf">
                <label>Aduana / impuestos (%)</label>
                <input
                  type="number"
                  placeholder="10"
                  value={inputs.aduana}
                  onChange={set('aduana')}
                />
              </div>
            </div>

            <div className="sf-row">
              <div className="sf">
                <label>Comisión plataforma (%)</label>
                <input
                  type="number"
                  placeholder="5"
                  value={inputs.comision}
                  onChange={set('comision')}
                />
              </div>
              <div className="sf">
                <label>Margen objetivo (%)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={inputs.margenObjetivo}
                  onChange={set('margenObjetivo')}
                />
              </div>
            </div>

            <div style={{ marginTop: 8, padding: '10px 12px', background: 'var(--bg)', borderRadius: 8, fontSize: '0.75rem', color: 'var(--muted)', lineHeight: 1.6 }}>
              Los resultados se actualizan automáticamente mientras escribís.
            </div>
          </div>

          {/* Panel de resultados */}
          <div>
            {resultado ? (
              <div className="results-panel show">
                <div className="metrics-grid">
                  <div className="metric-card highlight">
                    <div className="metric-lbl">Precio mínimo de venta</div>
                    <div className="metric-val accent">{fmt(resultado.precioMinimo)}</div>
                    <div className="metric-sub">Por debajo de este número, perdés.</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Tu ganancia por unidad</div>
                    <div className="metric-val">{fmt(resultado.margenPesos)}</div>
                    <div className="metric-sub">Si vendés al precio mínimo</div>
                  </div>
                  <div className="metric-card">
                    <div className="metric-lbl">Costo total landed</div>
                    <div className="metric-val">{fmt(resultado.costoTotal)}</div>
                    <div className="metric-sub">Con flete y aduana incluidos</div>
                  </div>
                </div>

                <div className="desglose-card">
                  <div className="desglose-title">Desglose del precio mínimo</div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">Costo del producto en moneda local</span>
                    <span className="desglose-val">{fmt(resultado.costoLocal)}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">+ Flete y aduana ({parseFloat(inputs.flete || '0') + parseFloat(inputs.aduana || '0')}%)</span>
                    <span className="desglose-val">{fmt(resultado.costoTotal - resultado.costoLocal)}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">+ Comisión plataforma ({inputs.comision || '0'}%)</span>
                    <span className="desglose-val">{fmt(resultado.precioMinimo * (parseFloat(inputs.comision || '0') / 100))}</span>
                  </div>
                  <div className="desglose-row">
                    <span className="desglose-lbl">+ Ganancia objetivo ({inputs.margenObjetivo || '0'}%)</span>
                    <span className="desglose-val">{fmt(resultado.margenPesos)}</span>
                  </div>
                  <div className="desglose-row" style={{ paddingTop: 12 }}>
                    <span>Precio mínimo de venta</span>
                    <span className="desglose-val" style={{ color: 'var(--accent)', fontSize: '1.1rem' }}>
                      {fmt(resultado.precioMinimo)}
                    </span>
                  </div>
                </div>

                {/* Lead magnet */}
                <div className="lead-card">
                  <div className="lead-title">¿Querés el framework completo?</div>
                  <div className="lead-text">
                    Recibí gratis el checklist de los 5 errores de pricing que le cuestan plata a casi todos los vendedores de importados.
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
                    <div className="lead-success">¡Listo! Revisá tu email.</div>
                  )}
                </div>
              </div>
            ) : (
              <div className="es">
                <div className="es-icon">🧮</div>
                <div className="es-title">Ingresá tus datos para calcular</div>
                <div className="es-text">
                  Completá al menos el costo del producto en USD y el tipo de cambio.<br />
                  Los resultados aparecen automáticamente.
                </div>
              </div>
            )}
          </div>

        </div>
      </div>

      <footer>
        <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
          margen<span>real</span>
        </Link>
        <div className="footer-links">
          <Link href="/importados" className="footer-link">Para Importadores</Link>
          <Link href="/tool" className="footer-link">Herramienta</Link>
          <Link href="/about" className="footer-link">Nosotros</Link>
          <Link href="/privacy" className="footer-link">Privacidad</Link>
          <Link href="/terms" className="footer-link">Términos</Link>
        </div>
        <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
      </footer>
    </>
  );
}
