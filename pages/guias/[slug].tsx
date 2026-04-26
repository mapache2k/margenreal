import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import { getAllGuias, getGuia, type GuiaItem } from '../../lib/guias';
import posthog from 'posthog-js';

type Props = { guia: GuiaItem };

export const getStaticPaths: GetStaticPaths = async () => {
  const guias = getAllGuias(true);
  return {
    paths: guias.map(g => ({ params: { slug: g.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const guia = await getGuia(params!.slug as string);
  if (!guia) return { notFound: true };
  return { props: { guia } };
};

export default function GuiaPage({ guia }: Props) {
  useEffect(() => {
    posthog.capture('guide_view', { slug: guia.slug, tags: guia.tags });
  }, [guia.slug]);

  return (
    <Layout>
      <Head>
        <title>{guia.title} — Margen Real</title>
        <meta name="description" content={guia.description} />
      </Head>

      <style>{`
        .guia-wrap { max-width: 720px; margin: 0 auto; padding: 56px 40px 80px; }
        @media(max-width:640px){ .guia-wrap { padding: 32px 20px 60px; } }

        .guia-back { display: inline-flex; align-items: center; gap: 6px; font-size: 0.875rem; color: var(--muted); text-decoration: none; margin-bottom: 32px; transition: color 0.15s; }
        .guia-back:hover { color: var(--text); }

        .guia-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .guia-tag { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }

        .guia-title { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; line-height: 1.15; margin-bottom: 12px; }
        .guia-desc { font-size: 1rem; color: var(--muted); line-height: 1.7; margin-bottom: 40px; padding-bottom: 32px; border-bottom: 1px solid var(--border); }

        .guia-body h2 { font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; letter-spacing: -0.02em; margin: 40px 0 16px; color: var(--text); }
        .guia-body h3 { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; margin: 28px 0 12px; color: var(--text); }
        .guia-body p { font-size: 0.9375rem; color: var(--text-2, var(--muted)); line-height: 1.8; margin-bottom: 16px; }
        .guia-body strong { color: var(--text); font-weight: 700; }
        .guia-body ul, .guia-body ol { padding-left: 20px; margin-bottom: 16px; }
        .guia-body li { font-size: 0.9375rem; color: var(--text-2, var(--muted)); line-height: 1.8; margin-bottom: 6px; }
        .guia-body pre { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 16px 20px; overflow-x: auto; margin-bottom: 20px; }
        .guia-body code { font-family: 'SF Mono', 'Fira Code', monospace; font-size: 0.875rem; color: var(--accent); }
        .guia-body pre code { color: var(--text); }
        .guia-body blockquote { border-left: 3px solid var(--accent); padding: 12px 20px; background: rgba(249,215,27,0.04); border-radius: 0 8px 8px 0; margin-bottom: 20px; }
        .guia-body blockquote p { margin-bottom: 0; }
        .guia-body table { width: 100%; border-collapse: collapse; margin-bottom: 24px; font-size: 0.875rem; }
        .guia-body th { background: var(--surface); padding: 10px 14px; text-align: left; font-weight: 700; color: var(--text); border-bottom: 2px solid var(--border); }
        .guia-body td { padding: 10px 14px; border-bottom: 1px solid var(--border); color: var(--muted); }
        .guia-body tr:last-child td { border-bottom: none; }
        .guia-body a { color: var(--accent); text-decoration: none; font-weight: 600; }
        .guia-body a:hover { text-decoration: underline; }

        .guia-cta { background: rgba(249,215,27,0.04); border: 1px solid rgba(249,215,27,0.2); border-radius: 16px; padding: 28px; margin-top: 48px; text-align: center; }
        .guia-cta p { color: var(--muted); font-size: 0.9375rem; margin-bottom: 16px; }

        ${guia.draft ? `.draft-banner { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.2); border-radius: 10px; padding: 12px 20px; font-size: 0.875rem; color: #ef4444; font-weight: 600; margin-bottom: 24px; }` : ''}      `}</style>


      <div className="guia-wrap">
        <Link href="/guias" className="guia-back">← Volver a guías</Link>

        {guia.draft && (
          <div className="draft-banner">Borrador — no publicado</div>
        )}

        <div className="guia-tags">
          {guia.tags.map(t => <span key={t} className="guia-tag">{t}</span>)}
        </div>

        <h1 className="guia-title">{guia.title}</h1>
        <p className="guia-desc">{guia.description}</p>

        <div className="guia-body" dangerouslySetInnerHTML={{ __html: guia.contentHtml }} />

        {guia.type === 'playbook' ? (
          <div className="guia-cta">
            <p>Calculá el margen de cada producto de tu catálogo y encontrá cuáles están en pérdida.</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/calculadora-ml" className="btn btn-outline" style={{ textDecoration: 'none' }}>
                Calculadora gratuita →
              </Link>
              <Link href="/checkout" className="btn btn-primary" style={{ textDecoration: 'none' }}>
                Analizar todos mis productos →
              </Link>
            </div>
          </div>
        ) : (
          <div className="guia-cta">
            <p>¿Querés ver estos números para tu producto específico?</p>
            <Link href="/calculadora-ml" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              Calcular mi margen en ML Chile →
            </Link>
          </div>
        )}
      </div>

    </Layout>
  );
}
