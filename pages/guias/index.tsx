import Head from 'next/head';
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
    <>
      <Head>
        <title>Guías para vendedores de MercadoLibre Chile — Margen Real</title>
        <meta name="description" content="Guías prácticas sobre comisiones ML, precios, márgenes y estrategias para vendedores de MercadoLibre Chile." />
      </Head>

      <style>{`
        .guias-hero { padding: 64px 40px 40px; max-width: 760px; margin: 0 auto; }
        @media(max-width:640px){ .guias-hero { padding: 40px 20px 24px; } }
        .guias-hero .badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(249,215,27,0.1); border: 1px solid rgba(249,215,27,0.25); border-radius: 999px; padding: 5px 14px; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); margin-bottom: 20px; }
        .guias-hero h1 { font-family: var(--font-display); font-size: clamp(1.75rem, 4vw, 2.5rem); font-weight: 800; letter-spacing: -0.02em; margin-bottom: 12px; }
        .guias-hero p { color: var(--muted); font-size: 1rem; line-height: 1.7; }

        .guias-list { max-width: 760px; margin: 0 auto; padding: 0 40px 80px; display: grid; gap: 1px; }
        @media(max-width:640px){ .guias-list { padding: 0 20px 60px; } }
        .guia-card { background: var(--surface); padding: 28px; transition: background var(--transition); text-decoration: none; display: block; }
        .guia-card:first-child { border-radius: 16px 16px 0 0; }
        .guia-card:last-child { border-radius: 0 0 16px 16px; }
        .guia-card:only-child { border-radius: 16px; }
        .guia-card:hover { background: var(--surface-2); }
        .guia-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
        .guia-tag { font-size: 0.6875rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--accent); background: rgba(249,215,27,0.08); border-radius: 4px; padding: 2px 8px; }
        .guia-title { font-family: var(--font-display); font-size: 1.125rem; font-weight: 800; color: var(--text); margin-bottom: 8px; line-height: 1.3; }
        .guia-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.65; }
        .guia-arrow { font-size: 0.875rem; color: var(--accent); margin-top: 12px; font-weight: 600; }

        .empty { max-width: 760px; margin: 0 auto; padding: 0 40px 80px; text-align: center; color: var(--muted); }

        footer { max-width: var(--section-max); margin: 40px auto 0; padding: 40px var(--section-x) 48px; display: flex; flex-direction: column; align-items: center; gap: 16px; border-top: 1px solid var(--border); }
        .footer-logo { font-family: var(--font-display); font-weight: 800; color: var(--text); font-size: 18px; text-decoration: none; }
        .footer-logo span { color: var(--accent); }
        .footer-links { display: flex; gap: 20px; flex-wrap: wrap; justify-content: center; }
        .footer-link { font-size: 0.8125rem; color: var(--muted); text-decoration: none; }
        .footer-link:hover { color: var(--text); }
        .footer-copy { font-size: 0.75rem; color: var(--muted); }
      `}</style>

      <nav>
        <Link href="/" className="nav-logo" style={{ textDecoration: 'none' }}>
          margen<span style={{ color: 'var(--accent)' }}>real</span>
        </Link>
        <div className="nav-links">
          <Link href="/" className="nav-link" style={{ textDecoration: 'none' }}>Inicio</Link>
          <Link href="/calculadora-ml" className="nav-link" style={{ textDecoration: 'none' }}>Calculadora ML</Link>
          <Link href="/guias" className="nav-link active" style={{ textDecoration: 'none' }}>Guías</Link>
          <Link href="/importados" className="nav-link" style={{ textDecoration: 'none' }}>Para vendedores ML</Link>
        </div>
        <Link href="/calculadora-ml" className="btn nav-cta" style={{ textDecoration: 'none' }}>
          Calcular mi margen →
        </Link>
      </nav>

      <div className="guias-hero">
        <div className="badge">Guías ML Chile</div>
        <h1>Guías para vender mejor<br />en MercadoLibre Chile</h1>
        <p>Comisiones, precios, márgenes y estrategias. Todo en español, con ejemplos reales.</p>
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

      <footer>
        <Link href="/" className="footer-logo" style={{ textDecoration: 'none' }}>
          margen<span>real</span>
        </Link>
        <div className="footer-links">
          <Link href="/calculadora-ml" className="footer-link">Calculadora ML</Link>
          <Link href="/importados" className="footer-link">Para vendedores ML</Link>
          <Link href="/gratis" className="footer-link">Guía gratuita</Link>
          <Link href="/privacy" className="footer-link">Privacidad</Link>
        </div>
        <div className="footer-copy">© 2025 margenreal · Hecho en LatAm</div>
      </footer>
    </>
  );
}
