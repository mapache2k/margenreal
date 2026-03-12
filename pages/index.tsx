// pages/index.tsx
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: '¿Necesito saber contabilidad?', a: 'No. Solo necesitas saber cuánto vendes, cuánto gastas y cuánta caja tienes. No hay balances ni cuentas contables.' },
    { q: '¿Mis datos son privados?', a: 'Sí. Todo se calcula en tu navegador. No almacenamos ningún número de tu negocio en ningún servidor.' },
    { q: '¿Para qué tipo de negocio sirve?', a: 'Para cualquier PyME con ingresos recurrentes: comercio, servicios, manufactura ligera, distribución.' },
    { q: '¿Reemplaza a mi contador?', a: 'No. margenreal es una capa de decisión, no de contabilidad. Tu contador maneja el cumplimiento tributario. Nosotros te ayudamos a entender si tu negocio es viable.' },
    { q: '¿Cuánto cuesta?', a: 'Completamente gratuito en la fase beta. En el futuro habrá funciones avanzadas de pago: escenarios múltiples, benchmarks sectoriales, reportes exportables.' },
  ];

  return (
    <>
      <Head>
        <title>margenreal — Conoce si tu negocio va a sobrevivir</title>
        <meta name="description" content="En 3 minutos sabes si tu negocio va a sobrevivir, cuánto dinero tienes realmente, y exactamente qué debes cambiar." />
      </Head>

      <style>{`
        .hero { position: relative; display: flex; flex-direction: column; justify-content: center; padding: var(--hero-pt) var(--section-x) var(--hero-pb); max-width: var(--section-max); margin: 0 auto; overflow: hidden; }
        .hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(249,215,27,.04) 0%, transparent 65%); pointer-events: none; }
        .hero-inner { position: relative; z-index: 1; max-width: 1100px; margin: 0 auto; width: 100%; }
        .hero-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: var(--muted); margin-bottom: 24px; letter-spacing: 0.01em; }
        .hero-eyebrow .dot { width: 5px; height: 5px; background: var(--success); border-radius: 50%; animation: pulse-dot 2.5s infinite; flex-shrink: 0; }
        @keyframes pulse-dot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.8)} }
        .hero h1 { font-family: var(--font-display); font-size: clamp(2.5rem, 5.5vw, 4rem); font-weight: 700; line-height: 1.12; letter-spacing: -0.02em; margin-bottom: 20px; }
        .hero h1 em { font-style: normal; color: var(--accent); }
        .hero-sub { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 480px; margin-bottom: 36px; }
        .hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }
        .hero-stats { display: flex; gap: 40px; margin-top: 48px; flex-wrap: wrap; padding-top: 32px; border-top: 1px solid var(--border); }
        .hs-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .hs-label { font-size: 0.8125rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }

        .hooks-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border-radius: 16px; overflow: hidden; margin-top: 32px; }
        @media(max-width:700px){ .hooks-grid{ grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px){ .hooks-grid{ grid-template-columns: 1fr; } }
        .hook-card { background: var(--surface); padding: 28px 24px; transition: background var(--transition); }
        .hook-card:hover { background: var(--surface-2); }
        .hook-icon { font-size: 22px; margin-bottom: 12px; line-height: 1; }
        .hook-title { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; margin-bottom: 8px; color: var(--text); line-height: 1.3; }
        .hook-text { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }

        .hiw-list { margin-top: 32px; display: grid; gap: 1px; }
        .hiw-step { display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; background: var(--surface); padding: 24px 28px; transition: background var(--transition); }
        .hiw-step:first-child { border-radius: 16px 16px 0 0; }
        .hiw-step:last-child  { border-radius: 0 0 16px 16px; }
        .hiw-step:hover { background: var(--surface-2); }
        .hiw-num { font-size: 0.8125rem; font-weight: 700; color: var(--muted); letter-spacing: 0.05em; padding-top: 3px; }
        .hiw-title { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 700; margin-bottom: 6px; color: var(--text); line-height: 1.3; }
        .hiw-text  { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        .testi-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px,1fr)); gap: 16px; margin-top: 32px; }
        .testi { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
        .testi-stars { color: var(--warning); font-size: 11px; margin-bottom: 14px; letter-spacing: 3px; }
        .testi-text { font-size: 0.9375rem; line-height: 1.75; color: var(--text-2); margin-bottom: 20px; }
        .testi-author { display: flex; align-items: center; gap: 12px; }
        .testi-avatar { width: 34px; height: 34px; border-radius: 50%; background: var(--surface-2); border: 1px solid var(--border); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-weight: 700; font-size: 11px; color: var(--muted); flex-shrink: 0; }
        .testi-name { font-size: 0.875rem; font-weight: 600; color: var(--text); }
        .testi-role { font-size: 0.75rem; color: var(--muted); margin-top: 2px; }

        .faq-list { margin-top: 32px; display: grid; gap: 1px; }
        .faq-item { background: var(--surface); padding: 20px 24px; cursor: pointer; transition: background var(--transition); }
        .faq-item:first-child { border-radius: 16px 16px 0 0; }
        .faq-item:last-child  { border-radius: 0 0 16px 16px; }
        .faq-item:hover { background: var(--surface-2); }
        .faq-q { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; gap: 16px; color: var(--text); }
        .faq-toggle { color: var(--muted); font-size: 20px; flex-shrink: 0; transition: transform 0.3s, color 0.2s; line-height: 1; user-select: none; }
        .faq-toggle.open { transform: rotate(45deg); color: var(--text); }
        .faq-a { font-size: 0.875rem; color: var(--muted); line-height: 1.75; overflow: hidden; transition: max-height 0.4s ease, margin 0.3s; max-height: 0; }
        .faq-a.open { max-height: 200px; margin-top: 12px; }

        .cta-banner { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 64px 40px; text-align: center; }
        @media(max-width:640px){ .cta-banner{ padding: 40px 24px; } }

        .heading { font-family: var(--font-display); font-size: clamp(1.5rem,3vw,2rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: var(--text); margin-bottom: 0; }

        footer { max-width: var(--section-max); margin: 40px auto 0; padding: 40px var(--section-x) 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; border-top: 1px solid var(--border); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; color: var(--text); font-size: 18px; text-decoration: none; }
        .footer-logo span { color: var(--accent); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .footer-link { font-size: 0.8125rem; color: var(--muted); text-decoration: none; }
        .footer-link:hover { color: var(--text); }
        .footer-copy { font-size: 0.75rem; color: var(--muted); }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link active" style={{ textDecoration: 'none' }}>Inicio</Link>
          <Link href="/tool" className="nav-link" style={{ textDecoration: 'none' }}>Herramienta Gratis</Link>
          <Link href="/pro" className="nav-link" style={{ textDecoration: 'none' }}>Herramienta Pro</Link>
          <Link href="/pricing" className="nav-link" style={{ textDecoration: 'none' }}>Planes</Link>
          <Link href="/about" className="nav-link" style={{ textDecoration: 'none' }}>Nosotros</Link>
        </div>
        <Link href="/tool" className="btn nav-cta" style={{ textDecoration: 'none' }}>
          Diagnosticar mi negocio →
        </Link>
      </nav>

      <div className="page-wrap">

        <section className="hero">
          <div className="hero-bg" />
          <div className="hero-inner">
            <div className="hero-eyebrow">
              <span className="dot" />
              Beta pública — gratis
            </div>
            <h1>
              Para de adivinar.<br />
              <em>Conoce tu negocio</em><br />
              de verdad.
            </h1>
            <p className="hero-sub">
              En 3 minutos sabes si tu negocio va a sobrevivir, cuánto dinero tienes realmente, y exactamente qué debes cambiar.
            </p>
            <div className="hero-actions">
              <Link href="/tool" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Diagnosticar mi negocio →
              </Link>
              <a href="#como-funciona" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                ¿Cómo funciona?
              </a>
            </div>
            <div className="hero-stats">
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
            {[
              { icon: '🔋', title: '¿Cuánto te queda?', text: 'Cuántos meses puede funcionar tu negocio con la caja que tienes hoy. Sin adivinar.' },
              { icon: '📉', title: '¿Y si bajan las ventas?', text: 'Qué pasa si vendes 10% o 20% menos. Tu negocio, con números reales.' },
              { icon: '🎯', title: '¿Cuánto necesitas vender?', text: 'La venta mínima para cubrir todo: costos, deudas y tú.' },
              { icon: '💸', title: '¿Ganas lo que crees?', text: 'El margen real después de todo. Muchos se sorprenden.' },
              { icon: '⏳', title: '¿Te está comiendo la caja?', text: 'Si cobras tarde y pagas rápido, estás financiando a tus clientes.' },
              { icon: '🧭', title: '¿Qué hago primero?', text: 'Diagnóstico con acción concreta. No un informe. Una dirección.' },
            ].map((h) => (
              <div className="hook-card" key={h.title}>
                <div className="hook-icon">{h.icon}</div>
                <div className="hook-title">{h.title}</div>
                <div className="hook-text">{h.text}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="como-funciona">
          <div className="label">Cómo funciona</div>
          <h2 className="heading">Simple por diseño.<br />Preciso por necesidad.</h2>
          <div className="hiw-list">
            {[
              { n: '01', title: 'Ingresa tus 7 números clave', text: 'Ventas, margen, costos fijos, caja, deuda, días de cobro y pago. Sin contabilidad. Si llevas tu negocio, ya los tienes.' },
              { n: '02', title: 'Obtén tu diagnóstico al instante', text: 'Runway de caja, punto de equilibrio, proyección a 12 meses, sensibilidad ante caídas. Todo calculado automáticamente.' },
              { n: '03', title: 'Lee tu diagnóstico gerencial', text: 'No solo números. El sistema interpreta tus resultados y te dice qué palanca mover primero: precios, costos, cobranza o volumen.' },
              { n: '04', title: 'Actúa con claridad', text: 'Deja de operar en modo reacción. Con claridad financiera, las decisiones se vuelven obvias.' },
            ].map((s) => (
              <div className="hiw-step" key={s.n}>
                <div className="hiw-num">{s.n}</div>
                <div>
                  <div className="hiw-title">{s.title}</div>
                  <div className="hiw-text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Historias reales</div>
          <h2 className="heading">Lo que dicen<br />otros dueños.</h2>
          <div className="testi-grid">
            {[
              { i: 'CR', q: '"Pensaba que mi negocio estaba bien porque vendía. Resulta que tenía 40 días de caja. margenreal me abrió los ojos en 5 minutos."', name: 'Carlos R.', role: 'Distribuidora, Santiago' },
              { i: 'MV', q: '"El diagnóstico me dijo algo que ningún contador me había dicho: mi margen es demasiado bajo para sobrevivir un 15% de caída."', name: 'María V.', role: 'Servicios de diseño, Medellín' },
              { i: 'JP', q: '"Por fin entendí por qué siempre me falta plata aunque vendo bien. El ciclo de caja era el problema. Nunca lo había visto así."', name: 'Javier P.', role: 'Ferretería, Lima' },
            ].map((t) => (
              <div className="testi" key={t.i}>
                <div className="testi-stars">★★★★★</div>
                <div className="testi-text">{t.q}</div>
                <div className="testi-author">
                  <div className="testi-avatar">{t.i}</div>
                  <div>
                    <div className="testi-name">{t.name}</div>
                    <div className="testi-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Preguntas frecuentes</div>
          <h2 className="heading">Dudas comunes.</h2>
          <div className="faq-list">
            {faqs.map((faq, i) => (
              <div className="faq-item" key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <div className="faq-q">
                  {faq.q}
                  <span className={`faq-toggle${openFaq === i ? ' open' : ''}`}>+</span>
                </div>
                <div className={`faq-a${openFaq === i ? ' open' : ''}`}>{faq.a}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section">
          <div className="cta-banner">
            <div className="label" style={{ textAlign: 'center' }}>Empieza ahora</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 600, textAlign: 'center' }}>
              ¿Tu negocio va a sobrevivir<br />los próximos 6 meses?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Descúbrelo en 3 minutos. Gratis. Sin registro.
            </p>
            <Link href="/tool" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Hacer mi diagnóstico →
            </Link>
          </div>
        </section>

      </div>

      <footer>
        <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
          margen<span>real</span>
        </Link>
        <div className="footer-links">
          <Link href="/tool" className="footer-link">Herramienta</Link>
          <Link href="/pricing" className="footer-link">Planes</Link>
          <Link href="/about" className="footer-link">Nosotros</Link>
          <Link href="/privacy" className="footer-link">Privacidad</Link>
          <Link href="/terms" className="footer-link">Términos</Link>
        </div>
        <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
      </footer>
    </>
  );
}
