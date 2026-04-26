'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SESSION_KEY = 'mr_session';

export default function LoginPage() {
  const router = useRouter();
  const { next } = router.query;

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY)) {
      router.replace(typeof next === 'string' ? next : '/calculadora-ml');
    }
  }, [router, next]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMsg('');

    const res  = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      localStorage.setItem(SESSION_KEY, data.session);
      localStorage.setItem('mr_user_email', data.email);
      localStorage.setItem('mr_user_plan', data.plan);
      router.replace(typeof next === 'string' ? next : '/calculadora-ml');
    } else {
      setErrorMsg(data.error ?? 'Error al iniciar sesión');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Iniciar sesión — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
        .login-box { width: 100%; max-width: 380px; }
        .login-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .login-logo span { color: var(--accent); }
        .login-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .login-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; }
        .login-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .login-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color var(--transition); }
        .login-input:focus { border-color: var(--accent); }
        .login-field { margin-bottom: 16px; }
        .login-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .login-btn:hover { opacity: 0.9; }
        .login-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .login-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .login-footer { margin-top: 24px; font-size: 0.8125rem; color: var(--muted); text-align: center; }
        .login-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="login-wrap">
        <div className="login-box">
          <Link href="/" className="login-logo">margen<span>real</span></Link>
          <h1 className="login-title">Iniciá sesión</h1>
          <p className="login-sub">Accedé a tu plan con tu email y contraseña.</p>

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label">Email</label>
              <input className="login-input" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="login-field">
              <label className="login-label">Contraseña</label>
              <input className="login-input" type="password" placeholder="Tu contraseña" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <button className="login-btn" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Iniciando sesión...' : 'Iniciar sesión →'}
            </button>
            {errorMsg && <div className="login-error">{errorMsg}</div>}
          </form>

          <div className="login-footer">
            ¿No tenés cuenta? <Link href="/pricing">Ver planes →</Link>
          </div>
        </div>
      </div>
    </>
  );
}
