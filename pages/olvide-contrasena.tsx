'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';

export default function OlvideContrasenaPage() {
  const [email, setEmail]   = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    if (res.ok) {
      setStatus('done');
    } else {
      const data = await res.json();
      setErrorMsg(data.error ?? 'Error al enviar el email');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Recuperar contraseña — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        .fp-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
        .fp-box { width: 100%; max-width: 380px; }
        .fp-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .fp-logo span { color: var(--accent); }
        .fp-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .fp-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
        .fp-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .fp-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color var(--transition); }
        .fp-input:focus { border-color: var(--accent); }
        .fp-btn { width: 100%; margin-top: 12px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .fp-btn:hover { opacity: 0.9; }
        .fp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .fp-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .fp-footer { margin-top: 24px; font-size: 0.8125rem; color: var(--muted); text-align: center; }
        .fp-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
        .fp-success { text-align: center; padding: 20px 0; }
        .fp-success-icon { font-size: 44px; margin-bottom: 16px; }
        .fp-success-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .fp-success-sub { font-size: 0.875rem; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }
      `}</style>

      <div className="fp-wrap">
        <div className="fp-box">
          <Link href="/" className="fp-logo">margen<span>real</span></Link>

          {status === 'done' ? (
            <div className="fp-success">
              <div className="fp-success-icon">📬</div>
              <div className="fp-success-title">Revisa tu email</div>
              <div className="fp-success-sub">
                Si existe una cuenta con ese email, recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </div>
              <Link href="/login" style={{ fontSize: '0.875rem', color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
                ← Volver a iniciar sesión
              </Link>
            </div>
          ) : (
            <>
              <h1 className="fp-title">Recuperar contraseña</h1>
              <p className="fp-sub">Ingresa tu email y te enviamos un enlace para restablecer tu contraseña.</p>

              <form onSubmit={handleSubmit}>
                <label className="fp-label">Email</label>
                <input
                  className="fp-input"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
                <button className="fp-btn" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Enviando...' : 'Enviar enlace →'}
                </button>
                {errorMsg && <div className="fp-error">{errorMsg}</div>}
              </form>

              <div className="fp-footer">
                <Link href="/login">← Volver a iniciar sesión</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
