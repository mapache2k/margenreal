'use client';
import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import posthog from 'posthog-js';

export default function Importados() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    posthog.capture('importados_page_view');
  }, []);

  const faqs = [
    { q: '¿El tipo de cambio afecta tanto el margen?', a: 'Mucho más de lo que parece. Un dólar que sube $50 CLP en un producto de US$30 son $1.500 CLP menos de margen por unidad. Si vendes 50 unidades al mes, son $75.000 CLP que desaparecen sin que cambies nada.' },
    { q: '¿Cómo calculo el arancel correcto para mi producto?', a: 'El arancel depende del código arancelario (partida). En Chile el arancel general es 6%, pero hay excepciones por tratados comerciales (TLC con China, EE.UU., etc.). La calculadora usa el 6% base — verifica la partida exacta en el Servicio Nacional de Aduanas.' },
    { q: '¿Qué pasa si compro en cantidad y baja el costo unitario?', a: 'Es el escenario ideal. La calculadora te permite simular distintos costos de compra para ver desde qué volumen el margen es rentable en ML después de todos los costos de importación.' },
    { q: '¿Las comisiones ML aplican igual que en productos nacionales?', a: 'Exactamente igual. ML cobra por categoría más IVA 19% sobre esa comisión, independientemente de dónde venga el producto. La diferencia está en que el costo real del producto importado incluye flete, arancel y bodegaje.' },
    { q: '¿Puedo probar la calculadora antes de comprar?', a: 'Sí. La calculadora base es gratis. Los frameworks de importación, planillas de escenarios y playbook de implementación están en los planes pagados.' },
  ];

  return (
    <Layout>
      <Head>
        <title>Calculadora de margen para importados en MercadoLibre Chile — Margen Real</title>
        <meta name="description" content="Calcula el margen real de tus productos importados en ML Chile: flete, arancel, bodegaje, tipo de cambio y comisiones ML en un solo número." />
        <meta property="og:title" content="Calculadora margen importados MercadoLibre Chile" />
        <meta property="og:description" content="Flete + arancel + bodegaje + tipo de cambio + comisión ML = tu margen real. Calcúlalo antes de importar." />
        <meta property="og:type" content="website" />
      </Head>

      <style>{`
        .pain-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px; background: var(--border); border-radius: 16px; overflow: hidden; margin-top: 32px; }
        @media(max-width:700px){ .pain-grid { grid-template-columns: 1fr; } }
        .pain-card { background: var(--surface); padding: 28px 24px; }
        .pain-icon { font-size: 20px; margin-bottom: 12px; }
        .pain-title { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; margin-bottom: 8px; color: var(--text); line-height: 1.3; }
        .pain-text { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }

        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        @media(max-width:860px){ .tiers-grid { grid-template-columns: 1fr; } }
        .pricing-note { text-align: center; margin-top: 12px; font-size: 13px; color: var(--muted); }

        .steps-list { margin-top: 32px; display: grid; gap: 1px; }
        .step { display: grid; grid-template-columns: 48px 1fr; gap: 20px; align-items: start; background: var(--surface); padding: 24px 28px; transition: background var(--transition); }
        .step:first-child { border-radius: 16px 16px 0 0; }
        .step:last-child { border-radius: 0 0 16px 16px; }
        .step:hover { background: var(--surface-2); }
        .step-num { font-size: 0.8125rem; font-weight: 700; color: var(--muted); letter-spacing: 0.05em; padding-top: 3px; }
        .step-title { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 700; margin-bottom: 6px; color: var(--text); line-height: 1.3; }
        .step-text { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }

        .cost-breakdown {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 1px;
          background: var(--border); border-radius: 16px; overflow: hidden; margin-top: 32px;
        }
        @media(max-width:700px){ .cost-breakdown { grid-template-columns: repeat(2, 1fr); } }
        @media(max-width:400px){ .cost-breakdown { grid-template-columns: 1fr; } }
        .cost-item { background: var(--surface); padding: 24px 20px; display: flex; flex-direction: column; gap: 8px; }
        .cost-item-icon { font-size: 22px; }
        .cost-item-label { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); }
        .cost-item-name { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; color: var(--text); line-height: 1.3; }
        .cost-item-desc { font-size: 0.75rem; color: var(--muted); line-height: 1.55; }
        .cost-arrow {
          display: flex; align-items: center; justify-content: center;
          font-size: 1.25rem; color: var(--muted-2); padding: 8px 0;
        }
      `}</style>

      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Para importadores que venden en MercadoLibre Chile
          </div>
          <h1 className="page-h1">
            Importar barato<br />
            no garantiza<br />
            <em>vender con margen.</em>
          </h1>
          <p className="page-lead">
            Flete, arancel, bodegaje, tipo de cambio — y recién después las comisiones ML. Calcula todos los costos en un número antes de hacer el pedido.
          </p>
          <div className="page-actions">
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Calcular mi margen →
            </Link>
            <Link href="/pricing" className="btn btn-outline" style={{ textDecoration: 'none' }}>
              Ver frameworks completos
            </Link>
          </div>
        </div>

        <hr className="divider" />

        <section className="section">
          <div className="label">El problema</div>
          <h2 className="heading">Cuatro costos que destruyen<br />el margen antes de llegar a ML.</h2>
          <div className="cost-breakdown">
            {[
              { icon: '🚢', label: 'Costo 1', name: 'Flete internacional', desc: 'Marítimo o aéreo. El precio por kilo varía brutalmente según temporada y ruta. Muchos lo subestiman un 30%.' },
              { icon: '🏛️', label: 'Costo 2', name: 'Arancel aduanero', desc: 'En Chile el arancel base es 6% sobre el valor CIF. Varía según partida arancelaria y tratado de libre comercio aplicable.' },
              { icon: '🏭', label: 'Costo 3', name: 'Bodegaje y preparación', desc: 'Recepción, control de calidad, etiquetado y fulfillment. Entre $300 y $800 CLP por unidad según el servicio.' },
              { icon: '💱', label: 'Costo 4', name: 'Tipo de cambio', desc: 'Compras en USD, vendes en CLP. Una variación de $50 en el dólar sobre un producto de US$30 son $1.500 menos por unidad.' },
            ].map(c => (
              <div className="cost-item" key={c.name}>
                <span className="cost-item-icon">{c.icon}</span>
                <span className="cost-item-label">{c.label}</span>
                <span className="cost-item-name">{c.name}</span>
                <span className="cost-item-desc">{c.desc}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Y encima de eso</div>
          <h2 className="heading">Lo que ML te descuenta<br />sobre el precio ya ajustado.</h2>
          <div className="pain-grid">
            {[
              { icon: '📊', title: 'Comisión por categoría', text: 'Entre 8% y 17% según la categoría ML. Sobre el precio de publicación, no sobre tu costo. Y la cobran antes de IVA.' },
              { icon: '🧾', title: 'IVA 19% sobre la comisión', text: 'ML cobra IVA sobre su propia comisión. Si la comisión es 15%, el descuento real es 17,85%. No 15%.' },
              { icon: '📦', title: 'Envío gratis que pagas tú', text: 'En publicaciones Premium el envío lo absorbes tú. Entre $3.990 y $8.990 por paquete que sale de tu margen final.' },
            ].map(p => (
              <div className="pain-card" key={p.title}>
                <div className="pain-icon">{p.icon}</div>
                <div className="pain-title">{p.title}</div>
                <div className="pain-text">{p.text}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Cómo funciona</div>
          <h2 className="heading">Del precio FOB al margen real<br />en cuatro pasos.</h2>
          <div className="steps-list">
            {[
              { n: '01', title: 'Ingresas el costo FOB y los costos de importación', text: 'Precio de compra en origen, tipo de cambio, flete estimado, arancel y bodegaje. Todo en CLP para tener el costo real del producto en Chile.' },
              { n: '02', title: 'Defines el precio de publicación en ML', text: 'Ingresas la categoría, tipo de publicación (Clásica o Premium) y el precio al que quieres publicar.' },
              { n: '03', title: 'Ves el margen real después de todo', text: 'Costo total importado + comisión ML + IVA + envío = lo que realmente te queda. En pesos, en porcentaje, sin sorpresas.' },
              { n: '04', title: 'Simulás el precio mínimo para tu margen objetivo', text: '¿Quieres 25%? La calculadora te dice el precio exacto de publicación para lograrlo después de importación y comisiones ML.' },
            ].map(s => (
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

        <section className="section" id="planes">
          <div className="label">Planes</div>
          <h2 className="heading">Elige tu nivel<br />de claridad.</h2>
          <div className="tiers-grid">

            <div className="plan">
              <div className="plan-name">Gratis</div>
              <div className="plan-price">$<span>0</span></div>
              <div className="plan-desc">Para empezar a calcular bien, sin excusas.</div>
              <ul className="plan-features">
                <li>Calculadora de precio mínimo</li>
                <li>Checklist: 5 errores de pricing</li>
                <li>Fórmula base explicada en español</li>
                <li className="off">Frameworks de importación</li>
                <li className="off">Planillas por rubro</li>
                <li className="off">Modelos de escenarios</li>
              </ul>
              <Link href="/calculadora-ml" className="btn-plan btn-plan-outline" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
                Empezar gratis →
              </Link>
            </div>

            <div className="plan featured">
              <div className="plan-tag">Más popular</div>
              <div className="plan-name">Starter</div>
              <div className="plan-price"><sup>US$</sup>19</div>
              <div className="plan-desc">Para el importador que quiere dejar de adivinar.</div>
              <ul className="plan-features">
                <li>Todo lo del plan gratis</li>
                <li>Framework paso a paso para importados</li>
                <li>Guía táctica completa de pricing</li>
                <li>Spreadsheet de cálculo básico</li>
                <li>Ejemplos reales: ropa, cosméticos, accesorios</li>
                <li className="off">Modelos de escenarios</li>
              </ul>
              <a
                href="https://margenreal.lemonsqueezy.com/checkout/buy/be78bcd3-c734-4b95-b164-d4996478b598"
                target="_blank" rel="noopener noreferrer"
                className="btn-plan btn-plan-accent"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onClick={() => posthog.capture('checkout_started', { plan: 'starter', source: 'importados' })}
              >
                Comprar Starter →
              </a>
              <div className="pricing-note">Pago único · Sin suscripción</div>
            </div>

            <div className="plan">
              <div className="plan-name">Pro</div>
              <div className="plan-price"><sup>US$</sup>49</div>
              <div className="plan-desc">Para el importador que quiere el sistema completo.</div>
              <ul className="plan-features">
                <li>Todo lo de Starter</li>
                <li>Spreadsheet pack completo</li>
                <li>Modelos de escenarios (3 rubros)</li>
                <li>Playbook de implementación</li>
                <li>Márgenes reales por categoría ML</li>
                <li>Cálculo de precio por volumen de compra</li>
              </ul>
              <a
                href="https://margenreal.lemonsqueezy.com/checkout/buy/535e6adb-a287-4c6c-9f58-d72457f17044"
                target="_blank" rel="noopener noreferrer"
                className="btn-plan btn-plan-outline"
                style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
                onClick={() => posthog.capture('checkout_started', { plan: 'pro', source: 'importados' })}
              >
                Comprar Pro →
              </a>
              <div className="pricing-note">Pago único · Sin suscripción</div>
            </div>

          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Preguntas frecuentes</div>
          <h2 className="heading">Lo que suelen preguntar<br />los importadores.</h2>
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
            <div className="label" style={{ textAlign: 'center' }}>Calcula antes de importar</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 600, textAlign: 'center' }}>
              ¿El precio que estás pagando<br />deja margen después de ML?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 440, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Calcúlalo en 30 segundos. Gratis. Sin registro.
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
