import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import posthog from 'posthog-js';

const STARTER_URL = 'https://margenreal.lemonsqueezy.com/checkout/buy/be78bcd3-c734-4b95-b164-d4996478b598';
const PRO_URL = 'https://margenreal.lemonsqueezy.com/checkout/buy/535e6adb-a287-4c6c-9f58-d72457f17044';

export default function CheckoutPage() {
  return (
    <Layout>
      <Head>
        <title>Desbloquea el análisis completo — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        .co-wrap { max-width: 560px; margin: 0 auto; padding: 40px 20px 80px; }
        .co-eyebrow { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-2); margin-bottom: 12px; }
        .co-title { font-family: var(--font-display); font-size: 2rem; font-weight: 900; color: var(--text); line-height: 1.15; margin-bottom: 12px; }
        @media (max-width: 480px) { .co-title { font-size: 1.625rem; } }
        .co-context { font-size: 0.9375rem; color: var(--muted); line-height: 1.65; margin-bottom: 32px; }
        .co-outcomes { background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; margin-bottom: 24px; }
        .co-outcomes-title { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 14px; }
        .co-outcome { display: flex; align-items: flex-start; gap: 10px; margin-bottom: 10px; font-size: 0.875rem; color: var(--text); line-height: 1.5; }
        .co-outcome:last-child { margin-bottom: 0; }
        .co-outcome-icon { color: #2dd4a0; font-weight: 800; flex-shrink: 0; margin-top: 1px; }
        .co-includes { border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; margin-bottom: 28px; }
        .co-includes-title { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 14px; }
        .co-include { display: flex; align-items: center; gap: 10px; margin-bottom: 9px; font-size: 0.875rem; color: var(--muted); }
        .co-include:last-child { margin-bottom: 0; }
        .co-plans { display: flex; flex-direction: column; gap: 12px; margin-bottom: 20px; }
        .co-plan { border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; cursor: pointer; transition: border-color 0.15s; }
        .co-plan.featured { border-color: var(--accent); background: rgba(249,215,27,0.04); }
        .co-plan-tag { display: inline-block; font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: var(--accent); color: var(--bg); padding: 2px 8px; border-radius: 4px; margin-bottom: 10px; }
        .co-plan-header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 8px; }
        .co-plan-name { font-size: 1.0625rem; font-weight: 800; color: var(--text); font-family: var(--font-display); }
        .co-plan-price { font-size: 1.5rem; font-weight: 900; color: var(--text); font-family: var(--font-display); }
        .co-plan-price sup { font-size: 0.875rem; font-weight: 700; }
        .co-plan-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.5; margin-bottom: 14px; }
        .co-plan-cta { display: block; width: 100%; text-align: center; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 13px; border-radius: 10px; text-decoration: none; transition: opacity 0.15s; font-family: inherit; border: none; cursor: pointer; }
        .co-plan-cta:hover { opacity: 0.85; text-decoration: none; }
        .co-plan-cta-outline { background: transparent; border: 1.5px solid var(--border); color: var(--text); }
        .co-plan-cta-outline:hover { border-color: var(--accent); color: var(--accent); opacity: 1; }
        .co-risk { font-size: 0.8125rem; color: var(--muted); text-align: center; line-height: 1.6; margin-bottom: 20px; }
        .co-back { display: block; text-align: center; font-size: 0.8125rem; color: var(--muted); text-decoration: none; }
        .co-back:hover { color: var(--text); }
      `}</style>

      <div className="co-wrap">
        <div className="co-eyebrow">Análisis completo</div>
        <h1 className="co-title">Desbloquea el análisis<br />de todos tus productos</h1>
        <p className="co-context">
          La calculadora te muestra un producto a la vez. Pero tu margen real depende del conjunto. Un solo producto en pérdida puede estar destruyendo la rentabilidad de toda tu operación sin que lo sepas.
        </p>

        <div className="co-outcomes">
          <div className="co-outcomes-title">Con esto podés</div>
          <div className="co-outcome"><span className="co-outcome-icon">→</span> Ver el margen real de cada producto en tu catálogo</div>
          <div className="co-outcome"><span className="co-outcome-icon">→</span> Identificar qué productos están en pérdida, cuáles son frágiles y cuáles están bien</div>
          <div className="co-outcome"><span className="co-outcome-icon">→</span> Saber exactamente cuánto estás perdiendo por mes y en qué productos</div>
          <div className="co-outcome"><span className="co-outcome-icon">→</span> Simular qué pasa si subís el precio o bajás el costo de cada producto</div>
          <div className="co-outcome"><span className="co-outcome-icon">→</span> Priorizar dónde actuar primero para mejorar tu rentabilidad</div>
        </div>

        <div className="co-includes">
          <div className="co-includes-title">Incluye</div>
          <div className="co-include">📊 Tabla de análisis multi-producto con Estado y Prioridad</div>
          <div className="co-include">✏️ Edición inline de precio y costo por producto</div>
          <div className="co-include">💡 Guía de precio mínimo y precio objetivo por producto</div>
          <div className="co-include">📈 Simulador de impacto mensual (unidades × ganancia)</div>
          <div className="co-include">📚 Frameworks completos y playbooks de implementación</div>
          <div className="co-include">📋 Ejemplos reales por categoría ML Chile</div>
        </div>

        <div className="co-plans">
          <div className="co-plan featured">
            <div className="co-plan-tag">Más popular</div>
            <div className="co-plan-header">
              <div className="co-plan-name">Starter</div>
              <div className="co-plan-price"><sup>US$</sup>19</div>
            </div>
            <div className="co-plan-desc">Para el vendedor que quiere dejar de improvisar. Análisis completo + frameworks paso a paso.</div>
            <a
              href={STARTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="co-plan-cta"
              onClick={() => posthog.capture('checkout_started', { plan: 'starter', source: 'checkout_page' })}
            >
              Acceder ahora — US$19 →
            </a>
          </div>

          <div className="co-plan">
            <div className="co-plan-header">
              <div className="co-plan-name">Pro</div>
              <div className="co-plan-price"><sup>US$</sup>49</div>
            </div>
            <div className="co-plan-desc">El sistema completo. Starter + modelos de escenarios, spreadsheet pack y playbook de implementación por rubro.</div>
            <a
              href={PRO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="co-plan-cta co-plan-cta-outline"
              onClick={() => posthog.capture('checkout_started', { plan: 'pro', source: 'checkout_page' })}
            >
              Acceder ahora — US$49 →
            </a>
          </div>
        </div>

        <p className="co-risk">
          Pago único · Sin suscripción · Sin renovaciones automáticas.<br />
          Si no ves valor en las primeras 48 horas, te devolvemos el dinero sin preguntas.
        </p>

        <Link href="/calculadora-ml" className="co-back">
          ← Volver al cálculo
        </Link>
      </div>
    </Layout>
  );
}
