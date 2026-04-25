import Head from 'next/head';
import Layout from '../components/Layout';
import Link from 'next/link';
import posthog from 'posthog-js';

const TOOLS = [
  {
    href: '/calculadora-ml',
    tag: 'Gratis',
    icon: '🧮',
    title: 'Calculadora MercadoLibre',
    desc: 'Comisión por categoría + IVA 19% + envío = tu margen real. En 30 segundos, sin sorpresas.',
    cta: 'Calcular mi margen →',
  },
  {
    href: '/importados',
    tag: 'Gratis',
    icon: '📦',
    title: 'Calculadora para importados',
    desc: 'Flete, arancel, bodegaje, tipo de cambio. Todos los costos de importación en un solo cálculo.',
    cta: 'Calcular margen importado →',
  },
  {
    href: '/guias',
    tag: 'Gratis',
    icon: '📖',
    title: 'Guías ML Chile',
    desc: 'Comisiones por categoría, estrategias de precio y márgenes explicados con ejemplos reales.',
    cta: 'Ver guías →',
  },
  {
    href: '/blog',
    tag: 'Gratis',
    icon: '✏️',
    title: 'Blog de pricing',
    desc: 'Frameworks y estrategias para vender con margen. Sin teoría — solo lo que funciona.',
    cta: 'Leer artículos →',
  },
  {
    href: '/pro',
    tag: 'Pro',
    icon: '📊',
    title: 'Dashboard Pro',
    desc: 'Diagnóstico de tu negocio con IA, forecast de caja a 6 meses y simuladores de decisión.',
    cta: 'Ver Dashboard Pro →',
  },
  {
    href: '/pricing',
    tag: 'Desde US$19',
    icon: '💎',
    title: 'Frameworks y spreadsheets',
    desc: 'Guía táctica completa, spreadsheets descargables y modelos de escenarios. Pago único.',
    cta: 'Ver planes →',
  },
];

export default function Home() {
  return (
    <Layout>
      <Head>
        <title>Margen Real — Calculadora de margen para MercadoLibre Chile</title>
        <meta name="description" content="Calculá exactamente cuánto te queda después de comisiones ML, IVA 19% y envío. Herramientas gratuitas para vendedores de MercadoLibre Chile." />
        <meta property="og:title" content="Margen Real — Calculadora ML Chile" />
        <meta property="og:description" content="Comisión por categoría + IVA 19% + envío = tu margen real. Gratis, al instante, sin registro." />
        <meta property="og:type" content="website" />
      </Head>

      <style>{`
        .tools-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1px;
          background: var(--border);
          border-radius: 16px;
          overflow: hidden;
          margin-top: 32px;
        }
        @media(max-width:860px){ .tools-grid { grid-template-columns: repeat(2,1fr); } }
        @media(max-width:540px){ .tools-grid { grid-template-columns: 1fr; } }

        .tool-card {
          background: var(--surface);
          padding: 28px 24px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          text-decoration: none;
          transition: background var(--transition);
        }
        .tool-card:hover { background: var(--surface-2); text-decoration: none; }
        .tool-card-top { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; }
        .tool-icon { font-size: 22px; line-height: 1; }
        .tool-tag {
          font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          padding: 2px 8px; border-radius: 4px; white-space: nowrap;
          background: rgba(249,215,27,0.1); color: var(--accent);
        }
        .tool-tag.pro { background: rgba(120,216,155,0.1); color: var(--success); }
        .tool-tag.paid { background: rgba(249,215,27,0.1); color: var(--accent); }
        .tool-title { font-family: var(--font-display); font-size: 1rem; font-weight: 800; color: var(--text); line-height: 1.3; margin: 0; }
        .tool-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; flex: 1; }
        .tool-cta { font-size: 0.8125rem; font-weight: 700; color: var(--accent); margin-top: 4px; }

        .hero-stats { display: flex; gap: 40px; margin-top: 48px; flex-wrap: wrap; padding-top: 32px; border-top: 1px solid var(--border); }
        .hs-val { font-family: var(--font-display); font-size: 1.75rem; font-weight: 700; color: var(--text); letter-spacing: -0.02em; }
        .hs-label { font-size: 0.8125rem; color: var(--muted); margin-top: 4px; line-height: 1.4; }
      `}</style>

      <div className="page-wrap">

        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Para vendedores de MercadoLibre Chile
          </div>
          <h1 className="page-h1">
            Tus números,<br />
            <em>sin adivinar.</em>
          </h1>
          <p className="page-lead">
            Herramientas gratuitas para calcular tu margen real en MercadoLibre Chile — comisiones, IVA, envío y costos de importación.
          </p>
          <div className="page-actions">
            <Link
              href="/calculadora-ml"
              className="btn btn-primary btn-lg"
              style={{ textDecoration: 'none' }}
              onClick={() => posthog.capture('cta_click', { location: 'hero' })}
            >
              Calcular mi margen gratis →
            </Link>
            <Link href="/pricing" className="btn btn-outline" style={{ textDecoration: 'none' }}>
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
          <div className="label">Herramientas</div>
          <h2 className="heading">Todo lo que necesitás<br />para vender con margen.</h2>
          <div className="tools-grid">
            {TOOLS.map(tool => (
              <Link key={tool.href} href={tool.href} className="tool-card">
                <div className="tool-card-top">
                  <span className="tool-icon">{tool.icon}</span>
                  <span className={`tool-tag${tool.tag === 'Pro' ? ' pro' : tool.tag.startsWith('Desde') ? ' paid' : ''}`}>
                    {tool.tag}
                  </span>
                </div>
                <div className="tool-title">{tool.title}</div>
                <div className="tool-desc">{tool.desc}</div>
                <div className="tool-cta">{tool.cta}</div>
              </Link>
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
            <Link
              href="/calculadora-ml"
              className="btn btn-primary btn-lg"
              style={{ textDecoration: 'none' }}
              onClick={() => posthog.capture('cta_click', { location: 'bottom' })}
            >
              Calcular mi margen →
            </Link>
          </div>
        </section>

      </div>
    </Layout>
  );
}
