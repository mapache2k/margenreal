import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import posthog from 'posthog-js';

export default function PricingPage() {
  return (
    <Layout>
      <Head>
        <title>Planes — Margen Real</title>
        <meta name="description" content="Elige tu nivel de claridad. Calculadora gratis o frameworks completos con pago único." />
      </Head>

      <style>{`
        .tiers-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-top: 32px; }
        @media(max-width:860px){ .tiers-grid { grid-template-columns: 1fr; } }
        .pricing-note { text-align: center; margin-top: 12px; font-size: 13px; color: var(--muted); }
      `}</style>

      <div className="page-wrap">
        <div className="page-hero">
          <div className="page-eyebrow"><span className="dot" />Planes</div>
          <h1 className="page-h1">Elige tu nivel<br />de claridad en ML Chile.</h1>
          <p className="page-lead">Empieza gratis con la calculadora. Suma frameworks y spreadsheets cuando estés listo — pago único, sin suscripción.</p>
        </div>

        <div className="tiers-grid">

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
            <Link href="/calculadora-ml" className="btn-plan btn-plan-outline" style={{ textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Empezar gratis →
            </Link>
          </div>

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
            <a
              href="https://margenreal.lemonsqueezy.com/checkout/buy/be78bcd3-c734-4b95-b164-d4996478b598"
              target="_blank" rel="noopener noreferrer"
              className="btn-plan btn-plan-accent"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
              onClick={() => posthog.capture('checkout_started', { plan: 'starter' })}
            >
              Comprar Starter →
            </a>
            <div className="pricing-note">Pago único · Sin suscripción</div>
          </div>

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
            <a
              href="https://margenreal.lemonsqueezy.com/checkout/buy/535e6adb-a287-4c6c-9f58-d72457f17044"
              target="_blank" rel="noopener noreferrer"
              className="btn-plan btn-plan-outline"
              style={{ display: 'block', textAlign: 'center', textDecoration: 'none' }}
              onClick={() => posthog.capture('checkout_started', { plan: 'pro' })}
            >
              Comprar Pro →
            </a>
            <div className="pricing-note">Pago único · Sin suscripción</div>
          </div>

        </div>

        <section className="section">
          <div className="cta-banner">
            <div className="label" style={{ textAlign: 'center' }}>¿Dudas?</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 520, textAlign: 'center' }}>
              Empieza con la calculadora gratis.<br />Compra cuando veas el valor.
            </h2>
            <Link href="/calculadora-ml" className="btn btn-primary btn-lg" style={{ textDecoration: 'none' }}>
              Ir a la calculadora →
            </Link>
          </div>
        </section>
      </div>
    </Layout>
  );
}
