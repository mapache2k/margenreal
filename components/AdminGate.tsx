import { ReactNode, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

const SESSION_KEY = 'mr_session';
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'camunozmauricio10@gmail.com';

export default function AdminGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<'loading' | 'authed' | 'unauthed' | 'forbidden'>('loading');

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
        if (!data.valid) { localStorage.removeItem(SESSION_KEY); setState('unauthed'); return; }
        setState(data.email === ADMIN_EMAIL ? 'authed' : 'forbidden');
      })
      .catch(() => setState('unauthed'));
  }, []);

  if (state === 'loading') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0e', color: '#555', fontSize: '0.875rem' }}>
      Verificando acceso…
    </div>
  );

  if (state === 'unauthed') {
    if (typeof window !== 'undefined') router.replace(`/login?next=${encodeURIComponent(router.asPath)}`);
    return null;
  }

  if (state === 'forbidden') return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#0a0a0e', flexDirection: 'column', gap: 12 }}>
      <div style={{ fontSize: '2rem' }}>🔒</div>
      <div style={{ color: '#f0f0f0', fontWeight: 700 }}>Acceso restringido</div>
      <Link href="/" style={{ color: '#555', fontSize: '0.875rem', textDecoration: 'none' }}>← Volver al inicio</Link>
    </div>
  );

  return <>{children}</>;
}
