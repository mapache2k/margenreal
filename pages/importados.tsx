import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

export default function Importados() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    posthog.capture('landing_visit');
  }, []);

  const faqs = [
    { q: '¿Las comisiones son exactas?', a: 'Sí. Usamos las tarifas vigentes de MercadoLibre Chile por categoría, incluyendo el IVA 19% que ML cobra sobre su comisión. Te recomendamos verificar siempre en el portal oficial de ML ante cambios de tarifas.' },
    { q: '¿Para qué sirve la diferencia entre Clásica y Premium?', a: 'Clásica tiene menor comisión pero el comprador paga el envío. Premium tiene mayor comisión pero el envío es gratis para el comprador — ese costo lo absorbés vos. La calculadora muestra cuál te conviene más según tu margen.' },
    { q: '¿Mis datos son privados?', a: 'Todo se calcula en tu navegador. No guardamos ningún número tuyo en ningún servidor.' },
    { q: '¿Puedo probar antes de pagar?', a: 'Sí. La calculadora de margen ML es completamente gratis. Pagás solo si querés los frameworks y spreadsheets completos.' },
    { q: '¿Se puede comprar una sola vez?', a: 'Exacto. Es un pago único — no hay suscripción. Comprás una vez y el material es tuyo para siempre.' },
  ];

  return (
    <Layout>
      <Head>
        <title>Margen Real para MercadoLibre Chile — Calculá tu margen real</title>
        <meta name="description" content="Calculá exactamente cuánto te queda después de comisiones ML, IVA 19% y envío. La herramienta para vendedores de MercadoLibre Chile." />
        <meta property="og:title" content="Margen Real para MercadoLibre Chile" />
        <meta property="og:description" content="Calculadora de margen real para vendedores ML Chile. Comisiones por categoría, IVA 19%, costo de envío. Sin sorpresas." />
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

        .heading { font-family: var(--font-display); font-size: clamp(1.5rem, 3vw, 2rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.2; color: var(--text); margin-bottom: 0; }      `}</style>

      {/* Nav */}

      <div className="page-wrap">

        {/* Hero */}
        <section className="imp-hero">
          <div className="imp-hero-bg" />
          <div className="imp-hero-inner">
            <div className="imp-eyebrow">
              <span className="dot" />
              Para vendedores de MercadoLibre Chile
            </div>
            <h1>
              ¿Cuánto te queda<br />
              después de que<br />
              <em>ML se cobra todo?</em>
            </h1>
            <p className="imp-hero-sub">
              Comisión por categoría, IVA 19% sobre esa comisión, costo de envío — y recién ahí sabés si ganaste o perdiste. Calculalo en 30 segundos.
            </p>
            <div className="imp-hero-actions">
              <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
                Calcular mi margen gratis →
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
          <h2 className="heading">Lo que ML te cobra<br />y casi nadie calcula bien.</h2>
          <div className="pain-grid">
            {[
              { icon: '📊', title: 'Comisión por categoría', text: 'No es lo mismo vender ropa (17%) que electrónica (13%). La categoría define cuánto te descuenta ML antes de pagarte.' },
              { icon: '🧾', title: 'IVA 19% sobre la comisión', text: 'ML cobra IVA sobre su propia comisión. Si vendés a $20.000 con 15% de comisión, el descuento real es 17,85% — no 15%.' },
              { icon: '📦', title: 'Costo de envío que absorbés', text: 'En publicaciones Premium el envío gratis lo pagás vos. $3.990 a $8.990 por paquete que sale directo de tu margen.' },
              { icon: '🏷️', title: 'Precio copiado de la competencia', text: 'Si el competidor calculó mal, vos también quedás mal. El único precio que importa es el que cubre tus costos reales.' },
              { icon: '📉', title: 'Margen calculado sobre el precio de venta', text: 'El error clásico. El margen real se calcula sobre el costo, no sobre lo que publicás. La diferencia puede ser brutal.' },
              { icon: '🔢', title: 'Precio de lista vs. precio neto', text: 'Lo que ves en tu dashboard de ML no es lo que entra a tu bolsillo. El neto es lo que importa para decidir.' },
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
          <h2 className="heading">Elegí tu nivel<br />de claridad en ML Chile.</h2>
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
              <Link href="/calculadora-ml" className="btn btn-plan btn-plan-outline" style={{ textDecoration: 'none' }}>
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
              <a href="https://margenreal.lemonsqueezy.com/checkout/buy/be78bcd3-c734-4b95-b164-d4996478b598" target="_blank" rel="noopener noreferrer" className="btn btn-plan btn-plan-accent" onClick={() => posthog.capture('checkout_started', { plan: 'starter' })}>
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
              <a href="https://margenreal.lemonsqueezy.com/checkout/buy/535e6adb-a287-4c6c-9f58-d72457f17044" target="_blank" rel="noopener noreferrer" className="btn btn-plan btn-plan-outline" onClick={() => posthog.capture('checkout_started', { plan: 'pro' })}>
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
              { n: '01', title: 'Ingresás tu producto y categoría ML', text: 'Costo del producto, precio de publicación, categoría de MercadoLibre y tipo de publicación (Clásica o Premium).' },
              { n: '02', title: 'Ves tu margen real al instante', text: 'Comisión ML, IVA 19% sobre esa comisión, costo de envío — todo desglosado. Lo que realmente entra a tu bolsillo.' },
              { n: '03', title: 'Calculás el precio para tu margen objetivo', text: '¿Querés 30% de margen? La calculadora te dice exactamente a qué precio publicar para lograrlo después de todos los descuentos ML.' },
              { n: '04', title: 'Publicás con números, no de ojo', text: 'Sabés exactamente cuánto ganás en cada venta. Podés ajustar precio o cambiar de Clásica a Premium con datos reales.' },
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
              ¿Cuánto te queda realmente<br />después de ML?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Calculalo en 30 segundos. Gratis. Sin registro.
            </p>
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Calcular mi margen →
            </Link>
          </div>
        </section>

      </div>

    </Layout>
  );
}
