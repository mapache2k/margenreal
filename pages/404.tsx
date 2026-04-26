import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';

export default function NotFoundPage() {
  return (
    <Layout>
      <Head>
        <title>Página no encontrada — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        .nf-wrap { max-width: 480px; margin: 0 auto; padding: 80px 24px; text-align: center; }
        .nf-code { font-family: var(--font-display); font-size: 5rem; font-weight: 900; color: var(--accent); line-height: 1; margin-bottom: 16px; }
        .nf-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); margin-bottom: 12px; }
        .nf-sub { font-size: 0.9375rem; color: var(--muted); line-height: 1.7; margin-bottom: 36px; }
        .nf-links { display: flex; gap: 12px; justify-content: center; flex-wrap: wrap; }
        .nf-link-primary { background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 12px 24px; border-radius: 10px; text-decoration: none; transition: opacity 0.15s; }
        .nf-link-primary:hover { opacity: 0.85; text-decoration: none; }
        .nf-link-secondary { background: transparent; border: 1.5px solid var(--border); color: var(--text); font-weight: 700; font-size: 0.9375rem; padding: 12px 24px; border-radius: 10px; text-decoration: none; transition: border-color 0.15s; }
        .nf-link-secondary:hover { border-color: var(--accent); color: var(--accent); text-decoration: none; }
      `}</style>

      <div className="nf-wrap">
        <div className="nf-code">404</div>
        <h1 className="nf-title">Página no encontrada</h1>
        <p className="nf-sub">
          La página que buscas no existe o fue movida.<br />
          Vuelve a la calculadora o revisa las guías.
        </p>
        <div className="nf-links">
          <Link href="/calculadora-ml" className="nf-link-primary">
            Ir a la calculadora →
          </Link>
          <Link href="/guias" className="nf-link-secondary">
            Ver guías
          </Link>
        </div>
      </div>
    </Layout>
  );
}
