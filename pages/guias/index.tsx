import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import { getAllGuias, type GuiaFrontmatter } from '../../lib/guias';

type Props = { guias: GuiaFrontmatter[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const guias = getAllGuias();
  return { props: { guias } };
};

export default function GuiasIndex({ guias }: Props) {
  const articles  = guias.filter(g => !g.type || g.type === 'article');
  const playbooks = guias.filter(g => g.type === 'playbook');

  return (
    <Layout>
      <Head>
        <title>Errores de pricing en MercadoLibre (y cómo evitarlos) — Margen Real</title>
        <meta name="description" content="Respuestas rápidas para calcular precios, comisiones y márgenes en MercadoLibre Chile. Guías prácticas con ejemplos reales." />
      </Head>

      <style>{`
        .guias-list { max-width: var(--content-max); display: grid; gap: 1px; }
        .guia-card {
          background: var(--surface); padding: 28px;
          transition: background var(--transition); text-decoration: none; display: block;
        }
        .guia-card:first-child { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .guia-card:last-child  { border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
        .guia-card:only-child  { border-radius: var(--radius-lg); }
        .guia-card:hover { background: var(--surface-2); }
        .guia-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .guia-tag {
          font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em;
          text-transform: uppercase; color: var(--accent);
          background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px;
        }
        .guia-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.3; }
        .guia-desc  { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }
        .guia-footer { display: flex; align-items: center; justify-content: space-between; margin-top: 14px; flex-wrap: wrap; gap: 8px; }
        .guia-arrow { font-size: 0.875rem; color: var(--accent); font-weight: 600; }
        .guia-cta-mini {
          font-size: 0.75rem; font-weight: 700; color: var(--text);
          background: var(--surface-2); border: 1px solid var(--border);
          border-radius: 6px; padding: 4px 10px; text-decoration: none;
          transition: background var(--transition);
        }
        .guia-cta-mini:hover { background: var(--surface); text-decoration: none; }
        .empty-section { padding: 24px 28px; background: var(--surface); border-radius: var(--radius-lg); color: var(--muted); font-size: 0.875rem; }
        .section-label { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 12px; }
      `}</style>

      <div className="page-wrap">
        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Guías ML Chile
          </div>
          <h1 className="page-h1">Errores de pricing en MercadoLibre<br /><em>(y cómo evitarlos)</em></h1>
          <p className="page-lead">Respuestas rápidas para calcular precios, comisiones y márgenes en MercadoLibre Chile.</p>
        </div>

        <hr className="divider" />

        <section className="section">
          <div className="label">Guías de referencia</div>
          <h2 className="heading">Conceptos clave explicados<br />con ejemplos reales.</h2>
          <div style={{ marginTop: 24 }}>
            {articles.length === 0 ? (
              <div className="empty-section">Próximamente — las primeras guías están en camino.</div>
            ) : (
              <div className="guias-list">
                {articles.map(g => (
                  <Link key={g.slug} href={`/guias/${g.slug}`} className="guia-card">
                    <div className="guia-tags">
                      {g.tags.map(t => <span key={t} className="guia-tag">{t}</span>)}
                    </div>
                    <div className="guia-title">{g.title}</div>
                    <div className="guia-desc">{g.description}</div>
                    <div className="guia-footer">
                      <span className="guia-arrow">Leer guía →</span>
                      <Link
                        href="/calculadora-ml"
                        className="guia-cta-mini"
                        onClick={e => e.stopPropagation()}
                      >
                        🧮 Probar con mis números →
                      </Link>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <hr className="divider" />

        <section className="section">
          <div className="label">Playbooks tácticos</div>
          <h2 className="heading">Frameworks completos para<br />implementar desde hoy.</h2>
          <div style={{ marginTop: 24 }}>
            {playbooks.length === 0 ? (
              <div className="empty-section">
                Los playbooks completos están en los planes pagados.{' '}
                <Link href="/pricing" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Ver planes →</Link>
              </div>
            ) : (
              <div className="guias-list">
                {playbooks.map(g => (
                  <Link key={g.slug} href={`/guias/${g.slug}`} className="guia-card">
                    <div className="guia-tags">
                      {g.tags.map(t => <span key={t} className="guia-tag">{t}</span>)}
                    </div>
                    <div className="guia-title">{g.title}</div>
                    <div className="guia-desc">{g.description}</div>
                    <div className="guia-footer">
                      <span className="guia-arrow">Ver playbook →</span>
                      <Link
                        href="/calculadora-ml"
                        className="guia-cta-mini"
                        onClick={e => e.stopPropagation()}
                      >
                        🧮 Probar con mis números →
                      </Link>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="cta-banner">
            <div className="label" style={{ textAlign: 'center' }}>Calcula ahora</div>
            <h2 className="heading" style={{ margin: '0 auto 16px', maxWidth: 560, textAlign: 'center' }}>
              ¿Cuánto te queda realmente<br />después de comisiones ML?
            </h2>
            <p style={{ color: 'var(--muted)', margin: '0 auto 32px', maxWidth: 400, fontSize: 15, lineHeight: 1.7, textAlign: 'center' }}>
              Probalo en 30 segundos. Gratis. Sin registro.
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
