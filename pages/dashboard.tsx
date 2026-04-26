import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import ProGate, { ProSession } from '../components/ProGate';

const SESSION_KEY = 'mr_session';

function DashboardContent({ session }: { session: ProSession }) {
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem('mr_user_email');
    localStorage.removeItem('mr_user_plan');
    router.replace('/');
  };

  const planLabel = session.plan === 'pro' ? 'Pro' : 'Starter';
  const initial = session.email.charAt(0).toUpperCase();

  return (
    <>
      <style>{`
        .dash-wrap { max-width: 640px; margin: 0 auto; padding: 48px 24px; }
        .dash-header { display: flex; align-items: center; gap: 16px; margin-bottom: 40px; }
        .dash-avatar { width: 52px; height: 52px; border-radius: 14px; background: var(--accent); color: var(--bg); display: flex; align-items: center; justify-content: center; font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; flex-shrink: 0; }
        .dash-meta { min-width: 0; }
        .dash-email { font-size: 0.9375rem; font-weight: 700; color: var(--text); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .dash-plan-badge { display: inline-block; margin-top: 4px; font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; background: rgba(249,215,27,0.12); color: var(--accent); border-radius: 4px; padding: 2px 8px; }
        .dash-cards { display: grid; gap: 12px; }
        .dash-card { background: var(--surface); border: 1.5px solid var(--border); border-radius: 14px; padding: 20px 22px; display: flex; align-items: center; justify-content: space-between; gap: 16px; text-decoration: none; transition: border-color 0.15s; }
        .dash-card:hover { border-color: var(--accent); text-decoration: none; }
        .dash-card-info {}
        .dash-card-title { font-size: 0.9375rem; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .dash-card-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.5; }
        .dash-card-arrow { font-size: 1.125rem; color: var(--muted); flex-shrink: 0; }
        .dash-logout { margin-top: 32px; padding-top: 24px; border-top: 1px solid var(--border); }
        .dash-logout-btn { background: none; border: 1.5px solid var(--border); color: var(--muted); font-size: 0.875rem; font-weight: 600; padding: 10px 18px; border-radius: 9px; cursor: pointer; font-family: inherit; transition: color 0.15s, border-color 0.15s; }
        .dash-logout-btn:hover { color: #ef4444; border-color: #ef4444; }
      `}</style>

      <div className="dash-wrap">
        <div className="dash-header">
          <div className="dash-avatar">{initial}</div>
          <div className="dash-meta">
            <div className="dash-email">{session.email}</div>
            <span className="dash-plan-badge">Plan {planLabel}</span>
          </div>
        </div>

        <div className="dash-cards">
          <Link href="/calculadora-ml" className="dash-card">
            <div className="dash-card-info">
              <div className="dash-card-title">Calculadora MercadoLibre</div>
              <div className="dash-card-desc">Calculá tu margen real sin límite de productos.</div>
            </div>
            <span className="dash-card-arrow">→</span>
          </Link>

          <Link href="/guias" className="dash-card">
            <div className="dash-card-info">
              <div className="dash-card-title">Guías y playbooks</div>
              <div className="dash-card-desc">Estrategias de pricing para vendedores en ML Chile.</div>
            </div>
            <span className="dash-card-arrow">→</span>
          </Link>

          {session.plan === 'pro' && (
            <Link href="/pro" className="dash-card" style={{ borderColor: 'rgba(249,215,27,0.3)' }}>
              <div className="dash-card-info">
                <div className="dash-card-title" style={{ color: 'var(--accent)' }}>Herramientas Pro</div>
                <div className="dash-card-desc">Acceso completo a todas las calculadoras avanzadas.</div>
              </div>
              <span className="dash-card-arrow">→</span>
            </Link>
          )}
        </div>

        <div className="dash-logout">
          <button className="dash-logout-btn" onClick={handleLogout}>Cerrar sesión</button>
        </div>
      </div>
    </>
  );
}

export default function DashboardPage() {
  return (
    <Layout>
      <Head>
        <title>Mi cuenta — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ProGate>
        {session => <DashboardContent session={session} />}
      </ProGate>
    </Layout>
  );
}
