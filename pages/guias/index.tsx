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
  return (
    <Layout>
      <Head>
        <title>Guías para vendedores de MercadoLibre Chile — Margen Real</title>
        <meta name="description" content="Guías prácticas sobre comisiones ML, precios, márgenes y estrategias para vendedores de MercadoLibre Chile." />
      </Head>

      <style>{`
        .guias-list { max-width: var(--content-max); padding: 0 0 80px; display: grid; gap: 1px; }
        @media(max-width:640px){ .guias-list { padding: 0 0 60px; } }
        .guia-card { background: var(--surface); padding: 28px; transition: background var(--transition); text-decoration: none; display: block; }
        .guia-card:first-child { border-radius: var(--radius-lg) var(--radius-lg) 0 0; }
        .guia-card:last-child { border-radius: 0 0 var(--radius-lg) var(--radius-lg); }
        .guia-card:only-child { border-radius: var(--radius-lg); }
        .guia-card:hover { background: var(--surface-2); }
        .guia-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .guia-tag { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }
        .guia-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.3; }
        .guia-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }
        .guia-arrow { font-size: 0.875rem; color: var(--accent); margin-top: 12px; font-weight: 600; }
        .empty { padding: 0 0 80px; text-align: center; color: var(--muted); }
      `}</style>

      <div className="page-wrap">
        <div className="page-hero">
          <div className="page-eyebrow">
            <span className="dot" />
            Guías ML Chile
          </div>
          <h1 className="page-h1">Guías para vender mejor<br />en MercadoLibre Chile</h1>
          <p className="page-lead">Comisiones, precios, márgenes y estrategias. Todo en español, con ejemplos reales.</p>
        </div>

        {guias.length === 0 ? (
          <div className="empty"><p>No hay guías publicadas todavía.</p></div>
        ) : (
          <div className="guias-list">
            {guias.map(g => (
              <Link key={g.slug} href={`/guias/${g.slug}`} className="guia-card">
                <div className="guia-tags">
                  {g.tags.map(t => <span key={t} className="guia-tag">{t}</span>)}
                </div>
                <div className="guia-title">{g.title}</div>
                <div className="guia-desc">{g.description}</div>
                <div className="guia-arrow">Leer guía →</div>
              </Link>
            ))}
          </div>
        )}
      </div>

    </Layout>
  );
}
