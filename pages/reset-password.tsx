'use client';
import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;

  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [status, setStatus]       = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setErrorMsg('Las contraseñas no coinciden'); return; }
    if (password.length < 8)    { setErrorMsg('Mínimo 8 caracteres'); return; }

    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      setStatus('done');
    } else {
      setErrorMsg(data.error ?? 'Error al restablecer la contraseña');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Nueva contraseña — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        .rp-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
        .rp-box { width: 100%; max-width: 380px; }
        .rp-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .rp-logo span { color: var(--accent); }
        .rp-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .rp-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
        .rp-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .rp-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color var(--transition); }
        .rp-input:focus { border-color: var(--accent); }
        .rp-field { margin-bottom: 16px; }
        .rp-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .rp-btn:hover { opacity: 0.9; }
        .rp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .rp-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .rp-success { text-align: center; padding: 20px 0; }
        .rp-success-icon { font-size: 44px; margin-bottom: 16px; }
        .rp-success-title { font-family: var(--font-display); font-size: 1.25rem; font-weight: 800; color: var(--text); margin-bottom: 8px; }
        .rp-success-sub { font-size: 0.875rem; color: var(--muted); line-height: 1.6; margin-bottom: 24px; }
        .rp-cta { display: inline-block; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 13px 28px; border-radius: 10px; text-decoration: none; }
        .rp-cta:hover { opacity: 0.9; text-decoration: none; }
      `}</style>

      <div className="rp-wrap">
        <div className="rp-box">
          <Link href="/" className="rp-logo">margen<span>real</span></Link>

          {status === 'done' ? (
            <div className="rp-success">
              <div className="rp-success-icon">✅</div>
              <div className="rp-success-title">Contraseña actualizada</div>
              <div className="rp-success-sub">Tu contraseña fue restablecida. Ya puedes iniciar sesión con la nueva contraseña.</div>
              <Link href="/login" className="rp-cta">Iniciar sesión →</Link>
            </div>
          ) : !token ? (
            <p style={{ fontSize: '0.875rem', color: '#ef4444' }}>
              Enlace inválido. <Link href="/olvide-contrasena" style={{ color: 'var(--accent)' }}>Solicitar uno nuevo</Link>
            </p>
          ) : (
            <>
              <h1 className="rp-title">Nueva contraseña</h1>
              <p className="rp-sub">Elige una contraseña segura para tu cuenta.</p>

              <form onSubmit={handleSubmit}>
                <div className="rp-field">
                  <label className="rp-label">Contraseña</label>
                  <input className="rp-input" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
                </div>
                <div className="rp-field">
                  <label className="rp-label">Repetir contraseña</label>
                  <input className="rp-input" type="password" placeholder="Repite la contraseña" value={password2} onChange={e => setPassword2(e.target.value)} required />
                </div>
                <button className="rp-btn" type="submit" disabled={status === 'loading'}>
                  {status === 'loading' ? 'Guardando...' : 'Guardar contraseña →'}
                </button>
                {errorMsg && <div className="rp-error">{errorMsg}</div>}
              </form>
            </>
          )}
        </div>
      </div>
    </>
  );
}
