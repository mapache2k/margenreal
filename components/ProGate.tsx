import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SESSION_KEY = 'mr_session';

export type ProSession = { email: string; plan: string };

interface Props {
  children: (session: ProSession) => ReactNode;
  planRequired?: 'starter' | 'pro';
}

export default function ProGate({ children, planRequired = 'starter' }: Props) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'authed' | 'unauthed'>('loading');
  const [session, setSession] = useState<ProSession | null>(null);

  useEffect(() => {
    const token = localStorage.getItem(SESSION_KEY);
    if (!token) { setState('unauthed'); return; }

    fetch('/api/auth/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ session: token }),
    })
      .then(r => r.json())
      .then(data => {
        if (data.valid) {
          setSession({ email: data.email, plan: data.plan });
          setState('authed');
        } else {
          localStorage.removeItem(SESSION_KEY);
          setState('unauthed');
        }
      })
      .catch(() => setState('unauthed'));
  }, []);

  if (state === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, color: 'var(--muted)', fontSize: '0.875rem' }}>
      Verificando acceso…
    </div>
  );

  if (state === 'unauthed') return (
    <>
      <style>{`
        .pro-gate { border: 1.5px solid var(--border); border-radius: 16px; padding: 40px 32px; text-align: center; background: var(--surface); max-width: 480px; margin: 40px auto; }
        .pro-gate-icon { font-size: 32px; margin-bottom: 16px; }
        .pro-gate-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .pro-gate-desc { font-size: 0.875rem; color: var(--muted); line-height: 1.65; margin-bottom: 28px; }
        .pro-gate-actions { display: flex; gap: 10px; justify-content: center; flex-wrap: wrap; }
        .pro-gate-btn { font-size: 0.875rem; font-weight: 700; padding: 11px 20px; border-radius: 9px; text-decoration: none; transition: opacity 0.15s; }
        .pro-gate-btn:hover { opacity: 0.85; text-decoration: none; }
        .pro-gate-primary { background: var(--accent); color: var(--bg); }
        .pro-gate-outline { border: 1.5px solid var(--border); color: var(--text); }
      `}</style>
      <div className="pro-gate">
        <div className="pro-gate-icon">🔒</div>
        <div className="pro-gate-title">Función exclusiva para miembros</div>
        <div className="pro-gate-desc">
          Esta herramienta está disponible en los planes Starter y Pro. Comprá tu plan una vez y accedé para siempre.
        </div>
        <div className="pro-gate-actions">
          <Link href="/pricing" className="pro-gate-btn pro-gate-primary">Ver planes →</Link>
          <Link href={`/login?next=${encodeURIComponent(router.asPath)}`} className="pro-gate-btn pro-gate-outline">Ya tengo cuenta</Link>
        </div>
      </div>
    </>
  );

  return <>{children(session!)}</>;
}
