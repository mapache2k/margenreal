import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

const faqItems = [
  {
    q: '¿Necesito saber contabilidad?',
    a:
      'No. Solo necesitas saber cuánto vendes, cuánto gastas y cuánta caja tienes. No hay balances ni cuentas contables.'
  },
  {
    q: '¿Mis datos son privados?',
    a:
      'Sí. Todo se calcula en tu navegador. No almacenamos ningún número de tu negocio en ningún servidor.'
  },
  {
    q: '¿Para qué tipo de negocio sirve?',
    a:
      'Para cualquier PyME con ingresos recurrentes: comercio, servicios, manufactura ligera, distribución.'
  },
  {
    q: '¿Reemplaza a mi contador?',
    a:
      'No. margenreal es una capa de decisión, no de contabilidad. Tu contador maneja el cumplimiento tributario. Nosotros te ayudamos a entender si tu negocio es viable.'
  },
  {
    q: '¿Cuánto cuesta?',
    a:
      'Completamente gratuito en la fase beta. En el futuro habrá funciones avanzadas de pago: escenarios múltiples, benchmarks sectoriales, reportes exportables.'
  }
];

export default function Home(): React.JSX.Element {
  const [openFaq, setOpenFaq] = useState<boolean[]>(faqItems.map(() => false));

  function toggleFaq(i: number) {
    setOpenFaq(prev => {
      const next = [...prev];
      next[i] = !next[i];
      return next;
    });
  }

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>margenreal — Conoce si tu negocio va a sobrevivir</title>
        <meta
          name="description"
          content="En 3 minutos sabes si tu negocio va a sobrevivir, cuánto dinero tienes realmente, y exactamente qué debes cambiar."
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/style.css" />
        {/* Inline page-specific CSS from your original file */}
        <style>{`
/* ── Hero ── */
.hero {
  position: relative;
  display: flex; flex-direction: column; justify-content: center;
  padding: var(--hero-pt) var(--section-x) var(--hero-pb);
  max-width: var(--section-max); margin: 0 auto;
  overflow: hidden;
}
@media(max-width:640px){ .hero{ padding: var(--hero-pt) var(--section-x) var(--hero-pb); } }
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(245,240,232,.05) 0%, transparent 65%);
}
.hero-grid { display: none; }
.hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; width: 100%; }

/* Eyebrow — simple text tag, no pill border */
.hero-eyebrow {
  display: inline-flex; align-items: center; gap: 8px;
  font-size: 0.8125rem; font-weight: 500;
  color: var(--muted); margin-bottom: 24px;
  letter-spacing: 0.01em;
}
.hero-eyebrow .dot {
  width: 5px; height: 5px;
  background: var(--success);
  border-radius: 50%;
  animation: pulse 2.5s infinite;
  flex-shrink: 0;
}
.hero h1 { font-family: var(--font-display); font-size: clamp(2.5rem, 5.5vw, 4rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 20px; }
.hero h1 em { font-style: normal; color: var(--accent); }
.hero-sub { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 480px; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
.hero-stats { display: flex; gap: 40px; margin-top: var(--sp-12); flex-wrap: wrap; padding-top: 32px; border-top: 1px solid var(--border); }
.hs-val   { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
.hs-label { font-size: 0.8125rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }

/* ── Hooks grid — 3 cols, no orphan ── */
.hooks-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1px;
  background: var(--border);
  border-radius: 16px;
  overflow: hidden;
  margin-top: var(--sp-12);
}
@media(max-width:700px){ .hooks-grid{ grid-template-columns: 1fr 1fr; } }
@media(max-width:480px){ .hooks-grid{ grid-template-columns: 1fr; } }
.hook-card { background: var(--surface); padding: 28px 24px; transition: background var(--transition); }
.hook-card:hover { background: var(--surface2); }
.hook-icon  { font-size: 22px; margin-bottom: 12px; line-height: 1; }
.hook-title { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; margin-bottom: 8px; color: var(--text); line-height: 1.3; }
.hook-text  { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }

/* ── How it works — cleaner step numbers ── */
.hiw-list { margin-top: var(--sp-12); display: grid; gap: 1px; }
.hiw-step {
  display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start;
  background: var(--surface); padding: 24px 28px; transition: background var(--transition);
}
.hiw-step:first-child { border-radius: 16px 16px 0 0; }
.hiw-step:last-child  { border-radius: 0 0 16px 16px; }
.hiw-step:hover { background: var(--surface2); }
.hiw-num {
  font-family: var(--font-body);
  font-size: 0.8125rem;
  font-weight: 700;
  color: var(--muted);
  letter-spacing: 0.05em;
  line-height: 1;
  padding-top: 3px;
}
.hiw-title { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 700; margin-bottom: 6px; color: var(--text); line-height: 1.3; }
.hiw-text  { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

/* ── Testimonials ── */
.testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-top: var(--sp-12); }
.testi { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
.testi-stars  { color: var(--warning); font-size: 11px; margin-bottom: 14px; letter-spacing: 3px; }
.testi-text   { font-size: 0.9375rem; line-height: 1.75; color: var(--text-2); margin-bottom: 20px; }
.testi-author { display: flex; align-items: center; gap: 12px; }
.testi-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--surface2); border: 1px solid var(--border2); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 11px; color: var(--muted); flex-shrink: 0; }
.testi-name   { font-size: 0.875rem; font-weight: 600; color: var(--text); }
.testi-role   { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

/* ── FAQ ── */
.faq-list { margin-top: var(--sp-12); display: grid; gap: 1px; }
.faq-item { background: var(--surface); padding: 20px 24px; cursor: pointer; transition: background var(--transition); }
.faq-item:first-child { border-radius: 16px 16px 0 0; }
.faq-item:last-child  { border-radius: 0 0 16px 16px; }
.faq-item:hover { background: var(--surface2); }
.faq-q { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; gap: 16px; color: var(--text); }
.faq-toggle { color: var(--muted); font-size: 18px; flex-shrink: 0; transition: transform .3s; line-height: 1; }
.faq-a { font-size: 0.875rem; color: var(--muted); line-height: 1.75; max-height: 0; overflow: hidden; transition: max-height .4s ease, margin .3s; }
.faq-item.open .faq-a      { max-height: 200px; margin-top: 12px; }
.faq-item.open .faq-toggle { transform: rotate(45deg); color: var(--text); }

/* ── CTA Banner ── */
.cta-banner {
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 20px; padding: var(--section-y) var(--section-x); text-align: center;
}
@media(max-width:640px){ .cta-banner{ padding: var(--sp-10) var(--sp-6); } }
        `}</style>
      </Head>

      <header>
        <nav>
          <Link href="/" className="nav-logo">margen<span>real</span></Link>
          <div className="nav-links">
            <a className="nav-link active" href="/">Inicio</a>
            <a className="nav-link" href="/tool">Herramienta</a>
            <a className="nav-link" href="/pricing">Planes</a>
            <a className="nav-link" href="/about">Nosotros</a>
          </div>
          <a className="btn nav-cta" href="/tool">Diagnosticar mi negocio →</a>
        </nav>
      </header>

      <main className="page-wrap">
        <section className="hero" role="region" aria-label="Hero">
          <div className="hero-bg" />
          <div className="hero-grid" />
          <div className="hero-inner">
            <h1 className="anim-2">
              Para de adivinar.<br />
              <em>Conoce tu negocio</em><br />
              de verdad.
            </h1>
            <p className="hero-sub anim-3">
              En 3 minutos sabes si tu negocio va a sobrevivir, cuánto dinero tienes realmente, y exactamente qué debes cambiar.
            </p>

            <div className="hero-actions anim-4">
              <a className="btn btn-primary btn-lg" href="/tool">Diagnosticar mi negocio →</a>
              <a className="btn btn-outline" href="#como-funciona">¿Cómo funciona?</a>
            </div>

            <div className="hero-stats anim-5">
              <div><div className="hs-val">3 min</div><div className="hs-label">Para completar el análisis</div></div>
              <div><div className="hs-val">7</div><div className="hs-label">Variables. Sin contabilidad</div></div>
              <div><div className="hs-val">100%</div><div className="hs-label">Gratis en fase beta</div></div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Lo que descubrirás</div>
          <h2 className="heading">Las preguntas que te quitan<br />el sueño — respondidas.</h2>
          <div className="hooks-grid">
            <div className="hook-card"><div className="hook-icon">🔋</div><div className="hook-title">¿Cuánto te queda?</div><div className="hook-text">Cuántos meses puede funcionar tu negocio con la caja que tienes hoy. Sin adivinar.</div></div>
            <div className="hook-card"><div className="hook-icon">📉</div><div className="hook-title">¿Y si bajan las ventas?</div><div className="hook-text">Qué pasa si vendes 10% o 20% menos. Tu negocio, con números reales.</div></div>
            <div className="hook-card"><div className="hook-icon">🎯</div><div className="hook-title">¿Cuánto necesitas vender?</div><div className="hook-text">La venta mínima para cubrir todo: costos, deudas y tú.</div></div>
            <div className="hook-card"><div className="hook-icon">💸</div><div className="hook-title">¿Ganas lo que crees?</div><div className="hook-text">El margen real después de todo. Muchos se sorprenden.</div></div>
            <div className="hook-card"><div className="hook-icon">⏳</div><div className="hook-title">¿Te está comiendo la caja?</div><div className="hook-text">Si cobras tarde y pagas rápido, estás financiando a tus clientes.</div></div>
            <div className="hook-card"><div className="hook-icon">🧭</div><div className="hook-title">¿Qué hago primero?</div><div className="hook-text">Diagnóstico con acción concreta. No un informe. Una dirección.</div></div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="como-funciona">
          <div className="label">Cómo funciona</div>
          <h2 className="heading">Simple por diseño.<br />Preciso por necesidad.</h2>
          <div className="hiw-list">
            <div className="hiw-step"><div className="hiw-num">01</div><div><div className="hiw-title">Ingresa tus 7 números clave</div><div className="hiw-text">Ventas, margen, costos fijos, caja, deuda, días de cobro y pago. Sin contabilidad. Si llevas tu negocio, ya los tienes.</div></div></div>
            <div className="hiw-step"><div className="hiw-num">02</div><div><div className="hiw-title">Obtén tu diagnóstico al instante</div><div className="hiw-text">Runway de caja, punto de equilibrio, proyección a 6 meses, sensibilidad ante caídas. Todo calculado automáticamente.</div></div></div>
            <div className="hiw-step"><div className="hiw-num">03</div><div><div className="hiw-title">Lee tu diagnóstico gerencial</div><div className="hiw-text">No solo números. El sistema interpreta tus resultados y te dice qué palanca mover primero: precios, costos, cobranza o volumen.</div></div></div>
            <div className="hiw-step"><div className="hiw-num">04</div><div><div className="hiw-title">Actúa con claridad</div><div className="hiw-text">Deja de operar en modo reacción. Con claridad financiera, las decisiones se vuelven obvias.</div></div></div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Historias reales</div>
          <h2 className="heading">Lo que dicen<br />otros dueños.</h2>
          <div className="testi-grid">
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"Pensaba que mi negocio estaba bien porque vendía. Resulta que tenía 40 días de caja. margenreal me abrió los ojos en 5 minutos."</div>
              <div className="testi-author"><div className="testi-avatar">CR</div><div><div className="testi-name">Carlos R.</div><div className="testi-role">Distribuidora, Santiago</div></div></div>
            </div>
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"El diagnóstico me dijo algo que ningún contador me había dicho: mi margen es demasiado bajo para sobrevivir un 15% de caída."</div>
              <div className="testi-author"><div className="testi-avatar">MV</div><div><div className="testi-name">María V.</div><div className="testi-role">Servicios de diseño, Medellín</div></div></div>
            </div>
            <div className="testi">
              <div className="testi-stars">★★★★★</div>
              <div className="testi-text">"Por fin entendí por qué siempre me falta plata aunque vendo bien. El ciclo de caja era el problema. Nunca lo había visto así."</div>
              <div className="testi-author"><div className="testi-avatar">JP</div><div><div className="testi-name">Javier P.</div><div className="testi-role">Ferretería, Lima</div></div></div>
            </div>
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Preguntas frecuentes</div>
          <h2 className="heading">Dudas comunes.</h2>
          <div className="faq-list">
            {faqItems.map((item, i) => (
              <div key={i} className={`faq-item ${openFaq[i] ? 'open' : ''}`} onClick={() => toggleFaq(i)}>
                <div className="faq-q">
                  {item.q}
                  <span className="faq-toggle">{openFaq[i] ? '−' : '+'}</span>
                </div>
                <div className="faq-a" style={{ maxHeight: openFaq[i] ? 200 : 0, marginTop: openFaq[i] ? 12 : 0 }}>
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="cta-banner">
            <div className="label" style={{ textAlign: 'center' }}>Empieza ahora</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 600 }}>¿Tu negocio va a sobrevivir<br />los próximos 6 meses?</h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7 }}>
              Descúbrelo en 3 minutos. Gratis. Sin registro.
            </p>
            <a className="btn btn-primary btn-lg" href="/tool">Hacer mi diagnóstico →</a>
          </div>
        </section>

        <footer>
          <a className="footer-logo" href="/index.html">margen<span>real</span></a>
          <div className="footer-links">
            <a className="footer-link" href="/tool">Herramienta</a>
            <a className="footer-link" href="/pricing">Planes</a>
            <a className="footer-link" href="/about">Nosotros</a>
            <a className="footer-link" href="/privacy">Privacidad</a>
            <a className="footer-link" href="/terms">Términos</a>
            <a className="footer-link" href="/cdn-cgi/l/email-protection#34575b5a405557405b7459554653515a465155581a5d5b">Contacto</a>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </main>
    </>
  );
}
