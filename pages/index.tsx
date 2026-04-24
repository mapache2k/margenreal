import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useState } from 'react';
import posthog from 'posthog-js';

export default function Home() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    { q: '¿Las comisiones ML son exactas?', a: 'Sí. Usamos las tarifas vigentes de MercadoLibre Chile por categoría, incluyendo el IVA 19% que ML cobra sobre su comisión. Te recomendamos verificar siempre ante actualizaciones en el portal oficial de ML.' },
    { q: '¿Cuál es la diferencia entre Clásica y Premium?', a: 'Clásica tiene menor comisión pero el comprador paga el envío. Premium tiene mayor comisión pero el envío es gratis para el comprador — ese costo lo absorbes tú. La calculadora muestra cuál te conviene más.' },
    { q: '¿Mis datos son privados?', a: 'Todo se calcula en tu navegador. No guardamos ningún número tuyo en ningún servidor.' },
    { q: '¿Puedo usar esto sin registrarme?', a: 'Sí. La calculadora de margen ML es completamente gratis y sin registro. Solo abres y calculas.' },
    { q: '¿Funciona para otras categorías además de ropa?', a: 'Sí. Tenemos 12 categorías de MercadoLibre Chile con sus comisiones exactas: electrónica, celulares, herramientas, hogar, bebés, deportes y más.' },
  ];

  return (
    <Layout>
      <Head>
        <title>Margen Real — Calculadora de margen para MercadoLibre Chile</title>
        <meta name="description" content="Calculá exactamente cuánto te queda después de comisiones ML, IVA 19% y envío. La herramienta gratuita para vendedores de MercadoLibre Chile." />
        <meta property="og:title" content="Margen Real — Calculadora ML Chile" />
        <meta property="og:description" content="Comisión por categoría + IVA 19% + envío = tu margen real. Gratis, al instante, sin registro." />
        <meta property="og:type" content="website" />
      </Head>

      <style>{`
        .hero-stats { display: flex; gap: 40px; margin-top: 48px; flex-wrap: wrap; padding-top: 32px; border-top: 1px solid var(--border); }
        .hs-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .hs-label { font-size: 0.8125rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }

        .feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 1px; background: var(--border); border-radius: 16px; overflow: hidden; margin-top: 32px; }
        @media(max-width:700px){ .feat-grid{ grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px){ .feat-grid{ grid-template-columns: 1fr; } }
        .feat-card { background: var(--surface); padding: 28px 24px; transition: background var(--transition); }
        .feat-card:hover { background: var(--surface-2); }
        .feat-icon { font-size: 22px; margin-bottom: 12px; line-height: 1; }
        .feat-title { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; margin-bottom: 8px; color: var(--text); line-height: 1.3; }
        .feat-text { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }

        .hiw-list { margin-top: 32px; display: grid; gap: 1px; }
        .hiw-step { display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; background: var(--surface); padding: 24px 28px; transition: background var(--transition); }
        .hiw-step:first-child { border-radius: 16px 16px 0 0; }
        .hiw-step:last-child  { border-radius: 0 0 16px 16px; }
        .hiw-step:hover { background: var(--surface-2); }
        .hiw-num { font-size: 0.8125rem; font-weight: 700; color: var(--muted); letter-spacing: 0.05em; padding-top: 3px; }
        .hiw-title { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 700; margin-bottom: 6px; color: var(--text); line-height: 1.3; }
        .hiw-text  { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }
      `}</style>

      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Para vendedores de MercadoLibre Chile
          </div>
          <h1 className="page-h1">
            Conoce exactamente<br />
            <em>cuánto te queda</em><br />
            después de ML.
          </h1>
          <p className="page-lead">
            Comisión por categoría + IVA 19% + costo de envío = tu margen real. Calcúlalo en 30 segundos, sin sorpresas al cobrar.
          </p>
          <div className="page-actions">
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }} onClick={() => posthog.capture('cta_click', { location: 'hero' })}>
              Calcular mi margen gratis →
            </Link>
            <Link href="/importados#planes" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Ver planes
            </Link>
          </div>
          <div className="hero-stats">
            <div><div className="hs-val">12</div><div className="hs-label">Categorías ML Chile con tarifas exactas</div></div>
            <div><div className="hs-val">19%</div><div className="hs-label">IVA sobre comisión que casi nadie calcula</div></div>
            <div><div className="hs-val">30 seg</div><div className="hs-label">Para saber tu margen real</div></div>
          </div>
        </div>

        <hr className="divider" />

        <section className="section">
          <div className="label">Lo que calculamos</div>
          <h2 className="heading">Todo lo que ML te descuenta<br />antes de pagarte.</h2>
          <div className="feat-grid">
            {[
              { icon: '📊', title: 'Comisión por categoría', text: 'De 3% (automotor) a 20% (ropa Premium). Cada categoría tiene su tarifa — la calculamos automáticamente.' },
              { icon: '🧾', title: 'IVA 19% sobre la comisión', text: 'ML cobra IVA sobre su comisión. Un 15% de comisión se convierte en 17,85% de descuento real sobre tu venta.' },
              { icon: '📦', title: 'Costo de envío real', text: 'En Premium el envío "gratis" lo pagas tú. Desde $2.990 (paquete chico) hasta $8.990 (más de 10 kg).' },
              { icon: '🎯', title: 'Precio mínimo rentable', text: 'El número por debajo del cual pierdes dinero en cada venta. Lo calculamos con todos los costos incluidos.' },
              { icon: '📈', title: 'Precio para margen objetivo', text: '¿Quieres 30% de margen? Te decimos exactamente a qué precio publicar para lograrlo después de ML.' },
              { icon: '⚖️', title: 'Clásica vs. Premium', text: 'Comparás el impacto de cada tipo de publicación en tu margen real. No siempre Premium sale más caro.' },
            ].map((h) => (
              <div className="feat-card" key={h.title}>
                <div className="feat-icon">{h.icon}</div>
                <div className="feat-title">{h.title}</div>
                <div className="feat-text">{h.text}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section" id="como-funciona">
          <div className="label">Cómo funciona</div>
          <h2 className="heading">Del precio de publicación<br />al margen real en 4 pasos.</h2>
          <div className="hiw-list">
            {[
              { n: '01', title: 'Ingresas tu producto', text: 'Costo del producto, precio de publicación en ML, categoría y tipo de publicación (Clásica o Premium).' },
              { n: '02', title: 'Eliges el costo de envío', text: 'Seleccionas el tamaño del paquete y la calculadora usa el estimado real de ML Chile.' },
              { n: '03', title: 'Ves el desglose completo', text: 'Comisión ML, IVA sobre comisión, envío, costo del producto — todo desglosado. Lo que realmente entra a tu bolsillo.' },
              { n: '04', title: 'Ajustas el precio con datos', text: 'Sabes el precio mínimo para no perder y el precio ideal para tu margen objetivo. Publicas con lógica, no de ojo.' },
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
              ¿Cuánto te queda realmente<br />en tu próxima venta en ML?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Calcúlalo en 30 segundos. Gratis. Sin registro.
            </p>
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }} onClick={() => posthog.capture('cta_click', { location: 'bottom' })}>
              Calcular mi margen →
            </Link>
          </div>
        </section>

      </div>

    </Layout>
  );
}
