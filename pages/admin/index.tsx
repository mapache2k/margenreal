import Head from 'next/head';
import Link from 'next/link';
import Layout from '../../components/Layout';
import AdminGate from '../../components/AdminGate';

export default function AdminIndex() {
  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>Admin — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 24px' }}>
          <div style={{ fontSize: '0.625rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--muted-2)', marginBottom: 10 }}>
            Panel de administración
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--text)', marginBottom: 8 }}>
            Bienvenido, Admin
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: '0.9375rem', lineHeight: 1.7, marginBottom: 40 }}>
            Usá el menú lateral para acceder a las herramientas de administración.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { href: '/admin/pipeline', icon: '✏️', label: 'Pipeline de contenido', desc: 'Generá borradores con Claude API' },
              { href: '/admin/emails',   icon: '📧', label: 'Templates de email',    desc: 'Secuencia nurture' },
              { href: '/review',         icon: '📖', label: 'Review de guías',       desc: 'Borradores y publicadas' },
            ].map(t => (
              <Link key={t.href} href={t.href} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 14, textDecoration: 'none', transition: 'border-color 0.15s' }}>
                <span style={{ fontSize: '1.375rem' }}>{t.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text)', fontSize: '0.9375rem' }}>{t.label}</div>
                  <div style={{ color: 'var(--muted)', fontSize: '0.8125rem', marginTop: 2 }}>{t.desc}</div>
                </div>
                <span style={{ marginLeft: 'auto', color: 'var(--muted-2)' }}>→</span>
              </Link>
            ))}
          </div>
        </div>
      </Layout>
    </AdminGate>
  );
}
