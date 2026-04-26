'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SESSION_KEY = 'mr_session';

export default function ActivarPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [status, setStatus]       = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY)) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setErrorMsg('Las contraseñas no coinciden'); return; }
    if (password.length < 8)    { setErrorMsg('Mínimo 8 caracteres'); return; }

    setStatus('loading');
    setErrorMsg('');

    const res  = await fetch('/api/activar', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      localStorage.setItem(SESSION_KEY, data.accessToken);
      localStorage.setItem('mr_user_email', data.email);
      localStorage.setItem('mr_user_plan', data.plan);
      setStatus('done');
    } else {
      setErrorMsg(data.error ?? 'Error al activar. Intentá de nuevo.');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Activar cuenta — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        .act-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
        .act-box { width: 100%; max-width: 400px; }
        .act-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .act-logo span { color: var(--accent); }
        .act-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .act-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
        .act-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .act-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color var(--transition); }
        .act-input:focus { border-color: var(--accent); }
        .act-field { margin-bottom: 16px; }
        .act-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .act-btn:hover { opacity: 0.9; }
        .act-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .act-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .act-success { text-align: center; padding: 40px 0; }
        .act-success-icon { font-size: 48px; margin-bottom: 16px; }
        .act-success-title { font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .act-success-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 28px; line-height: 1.6; }
        .act-cta { display: inline-block; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px 28px; border-radius: 10px; text-decoration: none; transition: opacity 0.15s; }
        .act-cta:hover { opacity: 0.9; text-decoration: none; }
      `}</style>

      <div className="act-wrap">
        <div className="act-box">
          <Link href="/" className="act-logo">margen<span>real</span></Link>

          {status === 'done' ? (
            <div className="act-success">
              <div className="act-success-icon">✅</div>
              <div className="act-success-title">¡Cuenta activada!</div>
              <div className="act-success-sub">Ya tienes acceso completo a tu plan. Empieza a calcular sin límites.</div>
              <Link href="/dashboard" className="act-cta">Ir a mi cuenta →</Link>
            </div>
          ) : (
            <>
              <h1 className="act-title">Activa tu cuenta</h1>
              <p className="act-sub">Elige una contraseña para acceder a tu plan desde cualquier dispositivo.</p>

              {!token ? (
                <p className="act-error">Enlace inválido. Revisa el email de activación o <Link href="/login" style={{ color: 'var(--accent)' }}>inicia sesión</Link>.</p>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="act-field">
                    <label className="act-label">Contraseña</label>
                    <input className="act-input" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <div className="act-field">
                    <label className="act-label">Repetir contraseña</label>
                    <input className="act-input" type="password" placeholder="Repite la contraseña" value={password2} onChange={e => setPassword2(e.target.value)} required />
                  </div>
                  <button className="act-btn" type="submit" disabled={status === 'loading'}>
                    {status === 'loading' ? 'Activando...' : 'Activar cuenta →'}
                  </button>
                  {errorMsg && <div className="act-error">{errorMsg}</div>}
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
