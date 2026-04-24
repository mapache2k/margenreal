import Head from 'next/head';
import Layout from '../components/Layout';
import { useState } from 'react';
import posthog from 'posthog-js';

const ERRORES = [
  {
    n: '01',
    titulo: 'No separás la comisión real del precio de venta',
    desc: 'La comisión de ML no es solo el porcentaje que ves en la categoría. Es ese porcentaje MÁS el IVA del 19% sobre esa comisión. Si vendés en Electrónica Clásica, la comisión aparece como 8% — pero la comisión efectiva que ML te descuenta es 9.5%. Esa diferencia destruye tu margen.',
    ejemplo: 'Vendés un producto a $50.000. Creés que ML se lleva $4.000 (8%). En realidad te descuenta $4.760 (9.52% efectivo con IVA). En 100 ventas al mes eso son $76.000 que no calculaste.',
  },
  {
    n: '02',
    titulo: 'Ignorás el costo de envío en tu estructura de precios',
    desc: 'Con publicación Premium, el envío gratis lo pagás vos. ML estima el costo según el tamaño y destino del producto. Si no lo sumás al costo antes de fijar precio, estás subsidiando los envíos de tus compradores sin saberlo.',
    ejemplo: 'Tu producto pesa 2kg y cuesta $8.000 enviarlo en promedio. Si lo ignorás, en 50 envíos al mes perdés $400.000 que nunca contabilizaste como costo.',
  },
  {
    n: '03',
    titulo: 'Calculás el margen sobre el precio de venta, no sobre el costo',
    desc: 'Si vendés a $20.000 y tu costo total es $14.000, no tenés 30% de margen. Tenés 30% de margen sobre ventas, pero 42.8% de markup sobre costo. Son cosas distintas. Confundirlos te hace creer que ganás más de lo que ganás — y fijar precios que parecen rentables pero no lo son.',
    ejemplo: 'Precio venta: $20.000. Costo total: $14.000. Margen sobre venta: 30%. Markup sobre costo: 42.8%. Si querés 30% de margen real sobre costo, tu precio mínimo es $18.200, no $20.000.',
  },
  {
    n: '04',
    titulo: 'Copiás el precio de la competencia sin conocer sus costos',
    desc: 'Si un competidor vende más barato, puede ser porque compra mayor volumen, tiene mejor proveedor, o simplemente está perdiendo plata y no lo sabe. Su precio no es referencia válida para tu negocio. Cada estructura de costos es diferente.',
    ejemplo: 'Tu competidor vende a $15.000. Vos copiás el precio. Pero él compra 200 unidades con descuento del 20% y vos comprás 20. Su costo real es $8.000, el tuyo es $11.000. Al precio de $15.000, él gana $7.000 y vos perdés plata.',
  },
  {
    n: '05',
    titulo: 'No calculás el precio mínimo antes de publicar',
    desc: 'El precio mínimo es el precio por debajo del cual cada venta te genera una pérdida. Incluye tu costo del producto, la comisión ML con IVA, el envío estimado y el margen mínimo que necesitás. Sin calcularlo antes, publicás a ciegas y descubrís el problema cuando ya es tarde.',
    ejemplo: 'Costo producto: $8.000. Comisión ML efectiva (15%+IVA): $1.785. Envío estimado: $2.500. Solo para no perder plata necesitás vender a $12.285. Si querés 20% de margen, tu precio mínimo es $15.356. ¿Sabés cuál es el tuyo?',
  },
];

export default function Gratis() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (res.ok) {
        setStatus('ok');
        posthog.capture('free_signup', { source: 'gratis' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  return (
    <Layout>
      <Head>
        <title>5 errores que te hacen vender sin margen en MercadoLibre Chile — Margen Real</title>
        <meta name="description" content="Los 5 errores más comunes de vendedores en ML Chile. Comisiones, IVA, envíos y precios mínimos. Checklist gratuito." />
      </Head>

      <style>{`
        .capture-card { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.25); border-radius: var(--radius-lg); padding: 32px; max-width: 480px; margin: 32px auto 0; }
        .capture-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; margin-bottom: 8px; }
        .capture-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
        .capture-form { display: flex; flex-direction: column; gap: 10px; }
        .capture-form input { background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 0.9375rem; padding: 12px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s; }
        .capture-form input:focus { border-color: var(--accent); }
        .capture-form button { background: var(--accent); color: #0a0a0e; font-family: var(--font-display); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 9px; border: none; cursor: pointer; transition: opacity 0.15s, transform 0.12s; }
        .capture-form button:hover { opacity: 0.9; transform: translateY(-1px); }
        .capture-success { font-size: 0.9375rem; color: var(--success); font-weight: 600; text-align: center; padding: 16px 0; }
        .capture-hint { font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 8px; }

        .errores-list { max-width: var(--content-max); margin: 0 auto; padding: 0 var(--section-x) 80px; }
        @media(max-width:640px){ .errores-list { padding: 0 20px 60px; } }
        .error-item { border-bottom: 1px solid var(--border); padding: 40px 0; }
        .error-item:last-child { border-bottom: none; }
        .error-num { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .error-titulo { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.25; }
        .error-desc { font-size: 0.9375rem; color: var(--muted); line-height: 1.75; margin-bottom: 16px; }
        .error-ejemplo { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: var(--radius-md); padding: 16px 20px; font-size: 0.875rem; color: var(--text-2); line-height: 1.7; }
        .error-ejemplo strong { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }

        .cta-banner { background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 48px 40px; text-align: center; max-width: var(--content-max); margin: 0 auto 80px; }
        @media(max-width:640px){ .cta-banner { padding: 36px 24px; margin: 0 20px 60px; } }
        .cta-banner h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; }
        .cta-banner p { font-size: 0.9375rem; color: var(--muted); line-height: 1.7; margin-bottom: 28px; max-width: 440px; margin-left: auto; margin-right: auto; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
      `}</style>

      <div className="page-hero narrow centered">
        <div className="section-label">Guía gratuita · ML Chile</div>
        <h1 className="page-h1">Los <span style={{ color: 'var(--accent)' }}>5 errores</span> que te<br />hacen vender sin margen</h1>
        <p className="page-lead">
          Si vendés en MercadoLibre Chile y cometés aunque sea uno de estos errores, estás dejando plata en la mesa — o peor, perdiendo sin saberlo.
        </p>

        <div className="capture-card">
          <div className="capture-title">Recibí el checklist completo</div>
          <div className="capture-sub">
            Incluyendo la fórmula de precio mínimo para ML Chile. Gratis, sin trampa.
          </div>
          {status !== 'ok' ? (
            <form className="capture-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={status === 'loading'}
              />
              <button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Enviando...' : 'Quiero el checklist gratis →'}
              </button>
              {status === 'error' && (
                <div style={{ color: '#f87171', fontSize: '0.875rem' }}>Error al enviar. Intentá de nuevo.</div>
              )}
              <div className="capture-hint">Sin spam. Podés darte de baja cuando quieras.</div>
            </form>
          ) : (
            <div className="capture-success">
              ¡Perfecto! Revisá tu email — el checklist ya está en camino.
            </div>
          )}
        </div>
      </div>

      <div className="errores-list">
        <div className="section-label">Los 5 errores</div>
        <h2 className="page-h2" style={{ marginBottom: 32 }}>Leelos todos. Seguro<br />te identificás con alguno.</h2>

        {ERRORES.map((e) => (
          <div className="error-item" key={e.n}>
            <div className="error-num">Error {e.n}</div>
            <div className="error-titulo">{e.titulo}</div>
            <div className="error-desc">{e.desc}</div>
            <div className="error-ejemplo">
              <strong>Ejemplo real</strong>
              {e.ejemplo}
            </div>
          </div>
        ))}
      </div>

      <div className="cta-banner">
        <h2>¿Sabés cuál es tu precio mínimo?</h2>
        <p>Calculá exactamente cuánto necesitás cobrar para no perder plata en cada venta de MercadoLibre Chile.</p>
        <div className="cta-btns">
          <a href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
            Calcular mi margen gratis →
          </a>
          <a href="/guias" className="btn btn-outline btn-lg" style={{ textDecoration: 'none' }}>
            Ver guías
          </a>
        </div>
      </div>

    </Layout>
  );
}
