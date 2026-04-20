import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import posthog from 'posthog-js';

const ERRORES = [
  {
    n: '01',
    titulo: 'No separás el costo real del precio de compra',
    desc: 'El precio que pagaste por el producto es solo el punto de partida. Flete, aduana, gestión aduanera, seguro — todo eso suma. Ignorarlo te hace creer que tu margen es mayor de lo que es.',
    ejemplo: 'Comprás una prenda a US$20. Con flete y aduana te sale US$28. Si calculás margen sobre US$20, tu número es mentira.',
  },
  {
    n: '02',
    titulo: 'Calculás el margen sobre el precio de venta, no sobre el costo',
    desc: 'Si vendés a $10.000 y tu costo es $7.000, no tenés 30% de margen. Tenés 30% de margen bruto sobre ventas, pero 42.8% de markup sobre costo. Son cosas distintas y confundirlas te hace tomar malas decisiones.',
    ejemplo: 'Margen sobre venta: (10.000 - 7.000) / 10.000 = 30%. Markup sobre costo: (10.000 - 7.000) / 7.000 = 42.8%. No es lo mismo.',
  },
  {
    n: '03',
    titulo: 'Olvidás la comisión de la plataforma de pago',
    desc: 'Mercado Pago, PayPal, Stripe, Shopify Payments — todos se llevan entre 3% y 6% de cada transacción. Si no lo sumás al costo, trabajás para ellos sin saberlo.',
    ejemplo: 'Vendés a $10.000 con Mercado Pago (4.99% + IVA ≈ 6%). Recibís $9.400. Si calculaste margen sobre $10.000, tu número está inflado en $600.',
  },
  {
    n: '04',
    titulo: 'No contemplás la variación del tipo de cambio',
    desc: 'Comprás hoy al dólar de hoy. Pero si tardás semanas en vender, el tipo de cambio puede moverse. Si el dólar sube y tu precio en pesos no se actualizó, tu margen en USD cae.',
    ejemplo: 'Comprás a dólar 1000, ponés precio. Tres semanas después el dólar está a 1080. Si no ajustaste precio, perdiste 7.4% de margen en dólares.',
  },
  {
    n: '05',
    titulo: 'Copiás el precio de la competencia sin saber sus costos',
    desc: 'Si el competidor está mal, vos también quedás mal. Si vende más volumen tiene descuentos que vos no tenés. Si importa de otro proveedor su estructura de costos es diferente. El precio de otro no es referencia válida para tu negocio.',
    ejemplo: 'Tu competidor vende a $8.000. Vos lo copiás. Pero él compra 500 unidades con 15% de descuento y vos comprás 20. Su costo real es muy diferente al tuyo.',
  },
];

export default function Gratis() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    posthog.capture('free_signup', { source: 'gratis' });
    setSent(true);
  };

  return (
    <>
      <Head>
        <title>5 errores de pricing que te hacen vender sin margen — Margen Real</title>
        <meta name="description" content="El checklist gratuito para vendedores de importados en Instagram. Los 5 errores más comunes que hacen que vendas bien pero ganes poco." />
      </Head>

      <style>{`
        .gratis-hero { padding: 72px 40px 60px; max-width: 720px; margin: 0 auto; text-align: center; }
        @media(max-width:640px){ .gratis-hero { padding: 48px 20px 40px; } }
        .gratis-hero h1 { font-family: var(--font-display); font-size: clamp(2rem, 5vw, 3rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; margin-bottom: 16px; }
        .gratis-hero h1 em { font-style: normal; color: var(--accent); }
        .gratis-hero .sub { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 520px; margin: 0 auto 36px; }

        /* Email capture */
        .capture-card { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.25); border-radius: 16px; padding: 32px; max-width: 480px; margin: 0 auto 64px; }
        .capture-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; margin-bottom: 8px; }
        .capture-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 20px; line-height: 1.6; }
        .capture-form { display: flex; flex-direction: column; gap: 10px; }
        .capture-form input { background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-body); font-size: 0.9375rem; padding: 12px 14px; border-radius: 9px; outline: none; transition: border-color 0.2s; }
        .capture-form input:focus { border-color: var(--accent); }
        .capture-form button { background: var(--accent); color: #0a0a0e; font-family: var(--font-display); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 9px; border: none; cursor: pointer; transition: opacity 0.15s, transform 0.12s; }
        .capture-form button:hover { opacity: 0.9; transform: translateY(-1px); }
        .capture-success { font-size: 0.9375rem; color: var(--success); font-weight: 600; text-align: center; padding: 16px 0; }
        .capture-hint { font-size: 0.75rem; color: var(--muted); text-align: center; margin-top: 8px; }

        /* Errores list */
        .errores-wrap { max-width: 720px; margin: 0 auto; padding: 0 40px 80px; }
        @media(max-width:640px){ .errores-wrap { padding: 0 20px 60px; } }
        .errores-title { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; }

        .error-item { border-bottom: 1px solid var(--border); padding: 40px 0; }
        .error-item:last-child { border-bottom: none; }
        .error-num { font-size: 0.75rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 12px; }
        .error-titulo { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 12px; line-height: 1.25; }
        .error-desc { font-size: 0.9375rem; color: var(--muted); line-height: 1.75; margin-bottom: 16px; }
        .error-ejemplo { background: var(--surface); border: 1px solid var(--border); border-left: 3px solid var(--accent); border-radius: 10px; padding: 16px 20px; font-size: 0.875rem; color: var(--text-2); line-height: 1.7; }
        .error-ejemplo strong { display: block; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--muted); margin-bottom: 6px; }

        /* CTA final */
        .cta-section { max-width: 720px; margin: 0 auto; padding: 0 40px 80px; }
        @media(max-width:640px){ .cta-section { padding: 0 20px 60px; } }
        .cta-card { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 48px 40px; text-align: center; }
        @media(max-width:640px){ .cta-card { padding: 36px 24px; } }
        .cta-card h2 { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; }
        .cta-card p { font-size: 0.9375rem; color: var(--muted); line-height: 1.7; margin-bottom: 28px; max-width: 440px; margin-left: auto; margin-right: auto; }
        .cta-btns { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }

        footer { max-width: var(--section-max); margin: 40px auto 0; padding: 40px var(--section-x) 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; border-top: 1px solid var(--border); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; color: var(--text); font-size: 18px; text-decoration: none; }
        .footer-logo span { color: var(--accent); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .footer-link { font-size: 0.8125rem; color: var(--muted); text-decoration: none; }
        .footer-link:hover { color: var(--text); }
        .footer-copy { font-size: 0.75rem; color: var(--muted); }
      `}</style>

      {/* Nav */}
      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link" style={{ textDecoration: 'none' }}>Inicio</Link>
          <Link href="/tool" className="nav-link" style={{ textDecoration: 'none' }}>Herramienta Gratis</Link>
          <Link href="/importados" className="nav-link" style={{ textDecoration: 'none' }}>Para Importadores</Link>
          <Link href="/about" className="nav-link" style={{ textDecoration: 'none' }}>Nosotros</Link>
        </div>
        <Link href="/calculadora" className="btn nav-cta" style={{ textDecoration: 'none' }}>
          Calcular mi precio →
        </Link>
      </nav>

      {/* Hero */}
      <div className="gratis-hero">
        <div className="label" style={{ justifyContent: 'center', display: 'flex', marginBottom: 16 }}>Guía gratuita</div>
        <h1>
          Los <em>5 errores</em> que te<br />hacen vender sin margen
        </h1>
        <p className="sub">
          El checklist para vendedores de importados en Instagram. Si cometés aunque sea uno de estos errores, estás dejando plata en la mesa — o peor, perdiendo sin saberlo.
        </p>

        {/* Email capture */}
        <div className="capture-card">
          <div className="capture-title">Recibí el checklist completo</div>
          <div className="capture-sub">
            Incluyendo la hoja de cálculo base y la fórmula de precio mínimo. Gratis, sin trampa.
          </div>
          {!sent ? (
            <form className="capture-form" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
              <button type="submit">Quiero el checklist gratis →</button>
              <div className="capture-hint">Sin spam. Podés darte de baja cuando quieras.</div>
            </form>
          ) : (
            <div className="capture-success">
              ¡Perfecto! Revisá tu email — el checklist ya está en camino.
            </div>
          )}
        </div>
      </div>

      {/* Errores */}
      <div className="errores-wrap">
        <div className="label">Los 5 errores</div>
        <h2 className="errores-title">Leelos todos. Seguro<br />te identificás con alguno.</h2>

        <div style={{ marginTop: 32 }}>
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
      </div>

      {/* CTA final */}
      <div className="cta-section">
        <div className="cta-card">
          <h2>¿Y ahora qué?</h2>
          <p>
            Calculá el precio mínimo de tu próximo producto importado en 2 minutos, o llevate los frameworks completos para fijar precios con lógica.
          </p>
          <div className="cta-btns">
            <Link href="/calculadora" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Calcular mi precio gratis →
            </Link>
            <Link href="/importados#planes" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Ver planes
            </Link>
          </div>
        </div>
      </div>

      <footer>
        <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
          margen<span>real</span>
        </Link>
        <div className="footer-links">
          <Link href="/importados" className="footer-link">Para Importadores</Link>
          <Link href="/calculadora" className="footer-link">Calculadora</Link>
          <Link href="/tool" className="footer-link">Herramienta</Link>
          <Link href="/privacy" className="footer-link">Privacidad</Link>
          <Link href="/terms" className="footer-link">Términos</Link>
        </div>
        <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
      </footer>
    </>
  );
}
