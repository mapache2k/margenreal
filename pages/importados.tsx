import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function Importados() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: '¿Necesito saber de finanzas para usar esto?', a: 'No. Solo necesitás saber cuánto pagaste por el producto, cuánto cuesta traerlo y a cuánto lo vendés. Nosotros calculamos el resto.' },
    { q: '¿Funciona para cualquier tipo de importado?', a: 'Sí. Ropa, cosméticos, accesorios, gadgets, artículos de hogar. Cualquier producto que comprás en el exterior y vendés en tu país.' },
    { q: '¿Mis datos son privados?', a: 'Todo se calcula en tu navegador. No guardamos ningún número tuyo en ningún servidor.' },
    { q: '¿Puedo probar antes de pagar?', a: 'Sí. La calculadora y el checklist de errores son completamente gratis. Pagás solo si querés los frameworks completos.' },
    { q: '¿Se puede comprar una sola vez?', a: 'Exacto. Es un pago único — no hay suscripción. Comprás una vez y el material es tuyo para siempre.' },
  ];

  return (
    <>
      <Head>
        <title>Margen Real — Deja de vender sin saber cuánto ganás</title>
        <meta name="description" content="La guía práctica para vendedores de importados en Instagram. Calculá tu precio real, cubrí todos tus costos y dejá de regalar ganancia." />
        <meta property="og:title" content="Margen Real — Deja de vender sin saber cuánto ganás" />
        <meta property="og:description" content="Frameworks, calculadora y guías en español para vendedores de importados. Precio real, margen real." />
        <meta property="og:type" content="website" />
      </Head>

      <style>{`
        /* ── Hero ── */
        .imp-hero { position: relative; display: flex; flex-direction: column; justify-content: center; padding: 72px var(--section-x) 80px; max-width: var(--section-max); margin: 0 auto; overflow: hidden; }
        .imp-hero-bg { position: absolute; inset: 0; background: radial-gradient(ellipse 70% 50% at 50% -10%, rgba(249,215,27,.05) 0%, transparent 65%); pointer-events: none; }
        .imp-hero-inner { position: relative; z-index: 1; max-width: 680px; }
        .imp-eyebrow { display: inline-flex; align-items: center; gap: 8px; font-size: 0.8125rem; font-weight: 500; color: var(--muted); margin-bottom: 24px; letter-spacing: 0.01em; }
        .imp-eyebrow .dot { width: 5px; height: 5px; background: var(--accent); border-radius: 50%; flex-shrink: 0; }
        .imp-hero h1 { font-family: var(--font-display); font-size: clamp(2.25rem, 5vw, 3.75rem); font-weight: 700; line-height: 1.1; letter-spacing: -0.02em; margin-bottom: 20px; }
        .imp-hero h1 em { font-style: normal; color: var(--accent); }
        .imp-hero-sub { font-size: 1rem; color: var(--muted); line-height: 1.75; max-width: 480px; margin-bottom: 36px; }
        .imp-hero-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        /* ── Pain section ── */
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border-radius: 16px; overflow: hidden; margin-top: 32px; }
        @media(max-width:700px){ .pain-grid { grid-template-columns: 1fr; } }
        .pain-card { background: var(--surface); padding: 28px 24px; }
        .pain-icon { font-size: 20px; margin-bottom: 12px; }
        .pain-title { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; margin-bottom: 8px; color: var(--text); line-height: 1.3; }
        .pain-text { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }

        /* ── Tiers ── */
        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        @media(max-width:860px){ .tiers-grid { grid-template-columns: 1fr; } }

        /* ── Steps ── */
        .steps-list { margin-top: 32px; display: grid; gap: 1px; }
        .step { display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; background: var(--surface); padding: 24px 28px; transition: background var(--transition); }
        .step:first-child { border-radius: 16px 16px 0 0; }
        .step:last-child { border-radius: 0 0 16px 16px; }
        .step-num { font-size: 0.8125rem; font-weight: 700; color: var(--muted); letter-spacing: 0.05em; padding-top: 3px; }
        .step-title { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 700; margin-bottom: 6px; color: var(--text); line-height: 1.3; }
        .step-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        /* ── FAQ ── */
        .faq-list { margin-top: 32px; display: grid; gap: 1px; }
        .faq-item { background: var(--surface); padding: 20px 24px; cursor: pointer; transition: background var(--transition); }
        .faq-item:first-child { border-radius: 16px 16px 0 0; }
        .faq-item:last-child { border-radius: 0 0 16px 16px; }
        .faq-item:hover { background: var(--surface-2); }
        .faq-q { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; display: flex; justify-content: space-between; align-items: center; gap: 16px; color: var(--text); }
        .faq-toggle { color: var(--muted); font-size: 20px; flex-shrink: 0; transition: transform 0.3s, color 0.2s; line-height: 1; user-select: none; }
        .faq-toggle.open { transform: rotate(45deg); color: var(--text); }
        .faq-a { font-size: 0.875rem; color: var(--muted); line-height: 1.75; overflow: hidden; transition: max-height 0.4s ease, margin 0.3s; max-height: 0; }
        .faq-a.open { max-height: 200px; margin-top: 12px; }

        /* ── CTA banner ── */
        .cta-banner { background: var(--surface); border: 1px solid var(--border); border-radius: 20px; padding: 64px 40px; text-align: center; }
        @media(max-width:640px){ .cta-banner { padding: 40px 24px; } }

        .heading { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: var(--text); margin-bottom: 0; }

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
          <Link href="/importados" className="nav-link active" style={{ textDecoration: 'none' }}>Para Importadores</Link>
          <Link href="/about" className="nav-link" style={{ textDecoration: 'none' }}>Nosotros</Link>
        </div>
        <Link href="/calculadora" className="btn nav-cta" style={{ textDecoration: 'none' }}>
          Calcular mi precio →
        </Link>
      </nav>

      <div className="page-wrap">

        {/* Hero */}
        <section className="imp-hero">
          <div className="imp-hero-bg" />
          <div className="imp-hero-inner">
            <div className="imp-eyebrow">
              <span className="dot" />
              Para vendedores de importados en Instagram
            </div>
            <h1>
              Dejá de vender<br />
              sin saber<br />
              <em>cuánto ganás.</em>
            </h1>
            <p className="imp-hero-sub">
              Comprás en dólares, vendés en pesos, pagás comisiones, flete y aduana — y al final no sabés si ganaste o perdiste. Eso se termina.
            </p>
            <div className="imp-hero-actions">
              <Link href="/calculadora" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Calcular mi precio gratis →
              </Link>
              <Link href="/gratis" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Ver guía gratuita
              </Link>
            </div>
          </div>
        </section>

        <hr className="divider" />

        {/* Dolor */}
        <section className="section">
          <div className="label">El problema</div>
          <h2 className="heading">Los errores que le cuestan<br />plata a casi todos.</h2>
          <div className="pain-grid">
            {[
              { icon: '💱', title: 'Ignorás el tipo de cambio real', text: 'Comprás al dólar de hoy, vendés la semana que viene. Si el cambio se mueve y no lo contemplaste, perdés sin darte cuenta.' },
              { icon: '🚢', title: 'No contás el flete ni la aduana', text: 'El costo del producto es solo parte del costo real. Flete, aduana, gastos de gestión — todo eso baja tu margen sin que lo veas.' },
              { icon: '📱', title: 'Copiás precios de la competencia', text: 'Si ellos están mal, vos también quedás mal. El único precio que importa es el que cubre tus costos y te deja ganancia.' },
              { icon: '💳', title: 'Olvidás la comisión de la plataforma', text: 'Mercado Pago, Shopify, Instagram Shopping — cada uno se lleva su porcentaje. Si no lo sumás, trabajás para ellos.' },
              { icon: '📉', title: 'Calculás margen sobre el precio de venta', text: 'El error clásico. El margen real se calcula sobre el costo, no sobre lo que cobrás. La diferencia puede ser brutal.' },
              { icon: '🤷', title: 'Ponés el precio "de ojo"', text: 'Cuando no tenés un método, confiás en la intuición. Y la intuición no paga el alquiler del depósito.' },
            ].map((p) => (
              <div className="pain-card" key={p.title}>
                <div className="pain-icon">{p.icon}</div>
                <div className="pain-title">{p.title}</div>
                <div className="pain-text">{p.text}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* Planes */}
        <section className="section" id="planes">
          <div className="label">Lo que incluye</div>
          <h2 className="heading">Elegí tu nivel<br />de claridad.</h2>
          <div className="tiers-grid">

            {/* Free */}
            <div className="plan">
              <div className="plan-name">Gratis</div>
              <div className="plan-price">$<span>0</span></div>
              <div className="plan-desc">Para empezar a calcular bien, sin excusas.</div>
              <ul className="plan-features">
                <li>Calculadora de precio mínimo</li>
                <li>Checklist: 5 errores de pricing</li>
                <li>Fórmula base explicada en español</li>
                <li className="off">Frameworks completos</li>
                <li className="off">Ejemplos por rubro</li>
                <li className="off">Spreadsheets descargables</li>
              </ul>
              <Link href="/calculadora" className="btn btn-plan btn-plan-outline" style={{ textDecoration: 'none' }}>
                Empezar gratis →
              </Link>
            </div>

            {/* Starter */}
            <div className="plan featured">
              <div className="plan-tag">Más popular</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price"><sup>US$</sup>19</div>
              <div className="plan-desc">Para el vendedor que quiere dejar de improvisar.</div>
              <ul className="plan-features">
                <li>Todo lo del plan gratis</li>
                <li>Guía táctica completa de pricing</li>
                <li>Framework paso a paso para importados</li>
                <li>Spreadsheet de cálculo básico</li>
                <li>Ejemplos reales: ropa, cosméticos, accesorios</li>
                <li className="off">Modelos de escenarios</li>
              </ul>
              <a href="#" className="btn btn-plan btn-plan-accent">
                Comprar Starter →
              </a>
              <div className="pricing-note" style={{ marginTop: 12 }}>Pago único · Sin suscripción</div>
            </div>

            {/* Pro */}
            <div className="plan">
              <div className="plan-name">Pro</div>
              <div className="plan-price"><sup>US$</sup>49</div>
              <div className="plan-desc">Para el vendedor que quiere el sistema completo.</div>
              <ul className="plan-features">
                <li>Todo lo de Starter</li>
                <li>Spreadsheet pack completo</li>
                <li>Modelos de escenarios (3 rubros)</li>
                <li>Playbook de implementación</li>
                <li>Ejemplos con márgenes reales por categoría</li>
                <li>Cálculo de precio por volumen de compra</li>
              </ul>
              <a href="#" className="btn btn-plan btn-plan-outline">
                Comprar Pro →
              </a>
              <div className="pricing-note" style={{ marginTop: 12 }}>Pago único · Sin suscripción</div>
            </div>

          </div>
        </section>

        <hr className="divider" />

        {/* Cómo funciona */}
        <section className="section">
          <div className="label">Cómo funciona</div>
          <h2 className="heading">Del caos al número<br />en cuatro pasos.</h2>
          <div className="steps-list">
            {[
              { n: '01', title: 'Ingresás tus costos reales', text: 'Costo del producto en USD, tipo de cambio, flete, aduana, comisión de plataforma. Todo lo que realmente pagás.' },
              { n: '02', title: 'La calculadora te da el precio mínimo', text: 'El número por debajo del cual estás perdiendo plata. No es el precio de venta — es el piso desde el que empezás a ganar.' },
              { n: '03', title: 'Aplicás el framework de tu rubro', text: 'Ropa importada, cosméticos, accesorios de celular — cada categoría tiene sus propias variables. Los frameworks te guían paso a paso.' },
              { n: '04', title: 'Fijás precios con lógica, no de ojo', text: 'Sabés exactamente cuánto ganás en cada venta. Podés subir precios con fundamento o hacer descuentos sin perder margen.' },
            ].map((s) => (
              <div className="step" key={s.n}>
                <div className="step-num">{s.n}</div>
                <div>
                  <div className="step-title">{s.title}</div>
                  <div className="step-text">{s.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        {/* FAQ */}
        <section className="section">
          <div className="label">Preguntas frecuentes</div>
          <h2 className="heading">Lo que suelen preguntar.</h2>
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

        {/* CTA final */}
        <section className="section">
          <div className="cta-banner">
            <div className="label" style={{ textAlign: 'center' }}>Empezá ahora</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 600, textAlign: 'center' }}>
              ¿Cuánto ganás realmente<br />en tu próxima venta?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Calculalo en 2 minutos. Gratis. Sin registro.
            </p>
            <Link href="/calculadora" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Calcular mi precio →
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
          <Link href="/importados" className="footer-link">Para Importadores</Link>
          <Link href="/about" className="footer-link">Nosotros</Link>
          <Link href="/privacy" className="footer-link">Privacidad</Link>
          <Link href="/terms" className="footer-link">Términos</Link>
        </div>
        <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
      </footer>
    </>
  );
}
