import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import ReactMarkdown from 'react-markdown';
import { getAllGuias, getGuia, type GuiaFrontmatter, type GuiaItem } from '../lib/guias';

type Props = { guias: (GuiaFrontmatter & { content: string })[] };

export const getStaticProps: GetStaticProps<Props> = async () => {
  const all = getAllGuias(true);
  const guias = all.map(g => {
    const full = getGuia(g.slug);
    return full!;
  });
  return { props: { guias } };
};

export default function Review({ guias }: Props) {
  const drafts = guias.filter(g => g.draft);
  const published = guias.filter(g => !g.draft);

  return (
    <>
      <Head>
        <title>Review interno — Margen Real</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>

      <style>{`
        .review-wrap { max-width: 900px; margin: 0 auto; padding: 40px; }
        @media(max-width:640px){ .review-wrap { padding: 24px 20px; } }
        .review-header { margin-bottom: 40px; }
        .review-header h1 { font-family: var(--font-display); font-size: 1.75rem; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 6px; }
        .review-header p { color: var(--muted); font-size: 0.875rem; }

        .section-label { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; margin-top: 40px; }

        .guia-item { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 12px; overflow: hidden; }
        .guia-item-header { padding: 16px 20px; display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .guia-item-title { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text); }
        .guia-item-meta { display: flex; gap: 8px; align-items: center; flex-shrink: 0; }
        .status-badge { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; padding: 3px 10px; border-radius: 999px; }
        .status-draft { background: rgba(239,68,68,0.1); color: #ef4444; }
        .status-published { background: rgba(34,197,94,0.1); color: #22c55e; }
        .view-link { font-size: 0.8125rem; color: var(--accent); text-decoration: none; font-weight: 600; }
        .view-link:hover { text-decoration: underline; }

        .guia-item-body { border-top: 1px solid var(--border); padding: 20px 24px; }
        .guia-item-desc { font-size: 0.875rem; color: var(--muted); margin-bottom: 16px; line-height: 1.6; }
        .guia-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 16px; }
        .guia-tag { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }

        .md-preview { font-size: 0.875rem; color: var(--muted); line-height: 1.7; }
        .md-preview h2 { font-family: var(--font-display); font-size: 1.125rem; font-weight: 700; color: var(--text); margin: 20px 0 8px; }
        .md-preview h3 { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--text); margin: 16px 0 8px; }
        .md-preview p { margin-bottom: 12px; }
        .md-preview strong { color: var(--text); }
        .md-preview pre { background: var(--bg); border: 1px solid var(--border); border-radius: 8px; padding: 12px 16px; overflow-x: auto; margin-bottom: 12px; }
        .md-preview code { font-size: 0.8125rem; color: var(--accent); }
        .md-preview pre code { color: var(--text); }
        .md-preview table { width: 100%; border-collapse: collapse; margin-bottom: 16px; font-size: 0.8125rem; }
        .md-preview th { background: var(--bg); padding: 8px 12px; text-align: left; font-weight: 700; color: var(--text); border-bottom: 2px solid var(--border); }
        .md-preview td { padding: 8px 12px; border-bottom: 1px solid var(--border); }
        .md-preview a { color: var(--accent); }
        .md-preview ul, .md-preview ol { padding-left: 18px; margin-bottom: 12px; }
        .md-preview li { margin-bottom: 4px; }

        .empty { color: var(--muted); font-size: 0.875rem; padding: 16px 0; }

        footer { max-width: var(--section-max); margin: 40px auto 0; padding: 40px var(--section-x) 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; border-top: 1px solid var(--border); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; color: var(--text); font-size: 18px; text-decoration: none; }
        .footer-logo span { color: var(--accent); }
        .footer-copy { font-size: 0.75rem; color: var(--muted); }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>
        <div className="nav-links">
          <Link href="/guias" className="nav-link" style={{ textDecoration: 'none' }}>Guías públicas</Link>
        </div>
      </nav>

      <div className="review-wrap">
        <div className="review-header">
          <h1>Review interno</h1>
          <p>Vista de todos los contenidos — borradores y publicados. Esta página no está indexada.</p>
        </div>

        <div className="section-label">Borradores ({drafts.length})</div>
        {drafts.length === 0 ? (
          <p className="empty">No hay borradores.</p>
        ) : drafts.map(g => (
          <GuiaCard key={g.slug} guia={g} />
        ))}

        <div className="section-label">Publicados ({published.length})</div>
        {published.length === 0 ? (
          <p className="empty">No hay guías publicadas.</p>
        ) : published.map(g => (
          <GuiaCard key={g.slug} guia={g} />
        ))}
      </div>

      <footer>
        <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
          margen<span>real</span>
        </Link>
        <div className="footer-copy">Review interno — no indexado</div>
      </footer>
    </>
  );
}

function GuiaCard({ guia }: { guia: GuiaItem }) {
  return (
    <div className="guia-item">
      <div className="guia-item-header">
        <div className="guia-item-title">{guia.title}</div>
        <div className="guia-item-meta">
          <span className={`status-badge ${guia.draft ? 'status-draft' : 'status-published'}`}>
            {guia.draft ? 'Borrador' : 'Publicado'}
          </span>
          {!guia.draft && (
            <Link href={`/guias/${guia.slug}`} className="view-link" target="_blank">
              Ver →
            </Link>
          )}
        </div>
      </div>
      <div className="guia-item-body">
        <div className="guia-tags">
          {guia.tags.map(t => <span key={t} className="guia-tag">{t}</span>)}
        </div>
        <div className="guia-item-desc">{guia.description}</div>
        <div className="md-preview">
          <ReactMarkdown>{guia.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
