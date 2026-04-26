import Head from 'next/head';
import Link from 'next/link';
import AdminGate from '../../components/AdminGate';

const TOOLS = [
  { href: '/admin/pipeline', icon: '✏️', title: 'Pipeline de contenido', desc: 'Generá borradores de blog y guías con Claude API.' },
  { href: '/admin/emails', icon: '📧', title: 'Templates de email', desc: 'Revisá y editá los emails de la secuencia nurture.' },
  { href: '/review', icon: '📖', title: 'Review de guías', desc: 'Revisión interna de guías publicadas y borradores.' },
];

export default function AdminIndex() {
  return (
    <AdminGate>
      <Head>
        <title>Admin — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>

      <style>{`
        .admin-wrap { min-height: 100vh; background: #0a0a0e; padding: 48px 24px; }
        .admin-inner { max-width: 600px; margin: 0 auto; }
        .admin-eyebrow { font-size: 0.625rem; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; color: #555; margin-bottom: 10px; }
        .admin-title { font-size: 1.5rem; font-weight: 800; color: #f0f0f0; letter-spacing: -0.02em; margin-bottom: 40px; }
        .admin-grid { display: flex; flex-direction: column; gap: 1px; background: #1a1a18; border-radius: 14px; overflow: hidden; }
        .admin-card { display: flex; align-items: center; gap: 18px; padding: 22px 24px; background: #111; text-decoration: none; transition: background 0.15s; }
        .admin-card:hover { background: #161614; }
        .admin-icon { font-size: 1.5rem; flex-shrink: 0; }
        .admin-card-title { font-size: 0.9375rem; font-weight: 700; color: #f0f0f0; margin-bottom: 3px; }
        .admin-card-desc { font-size: 0.8125rem; color: #555; line-height: 1.5; }
        .admin-arrow { margin-left: auto; color: #333; font-size: 1rem; flex-shrink: 0; }
      `}</style>

      <div className="admin-wrap">
        <div className="admin-inner">
          <div className="admin-eyebrow">Margen Real</div>
          <div className="admin-title">Panel de administración</div>

          <div className="admin-grid">
            {TOOLS.map(t => (
              <Link key={t.href} href={t.href} className="admin-card">
                <span className="admin-icon">{t.icon}</span>
                <div>
                  <div className="admin-card-title">{t.title}</div>
                  <div className="admin-card-desc">{t.desc}</div>
                </div>
                <span className="admin-arrow">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminGate>
  );
}
