// pages/index.tsx
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

export default function Home() {
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
        <style>{`
/* (your inline page CSS unchanged) */
... (omitted here for brevity in the snippet — keep the same styles you already had) ...
        `}</style>
      </Head>

      <header>
        <nav>
          <Link href="/" className="nav-logo">margen<span>real</span></Link>
          <div className="nav-links">
            <Link href="/" className="nav-link active">Inicio</Link>
            <Link href="/tool" className="nav-link">Herramienta</Link>
            <Link href="/pricing" className="nav-link">Planes</Link>
            <Link href="/about" className="nav-link">Nosotros</Link>
          </div>
          <Link href="/tool" className="btn nav-cta">Diagnosticar mi negocio →</Link>
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
              <Link href="/tool" className="btn btn-primary btn-lg">Diagnosticar mi negocio →</Link>
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
            <Link href="/tool" className="btn btn-primary btn-lg">Hacer mi diagnóstico →</Link>
          </div>
        </section>

        <footer>
          <Link href="/" className="footer-logo">margen<span>real</span></Link>
          <div className="footer-links">
            <Link href="/tool" className="footer-link">Herramienta</Link>
            <Link href="/pricing" className="footer-link">Planes</Link>
            <Link href="/about" className="footer-link">Nosotros</Link>
            <Link href="/privacy" className="footer-link">Privacidad</Link>
            <Link href="/terms" className="footer-link">Términos</Link>
            <a className="footer-link" href="mailto:contacto@margenreal.io">Contacto</a>
          </div>
          <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
        </footer>
      </main>
    </>
  );
}
