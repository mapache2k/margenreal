'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SESSION_KEY = 'mr_session';

export default function RegistroPage() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem(SESSION_KEY)) {
      router.replace('/dashboard');
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== password2) { setErrorMsg('Las contraseñas no coinciden'); setStatus('error'); return; }
    if (password.length < 8)    { setErrorMsg('Mínimo 8 caracteres'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');

    const res  = await fetch('/api/auth/registro', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      localStorage.setItem(SESSION_KEY, data.accessToken);
      localStorage.setItem('mr_user_email', data.email);
      localStorage.setItem('mr_user_plan', data.plan);
      router.replace('/dashboard');
    } else {
      setErrorMsg(data.error ?? 'Error al crear la cuenta');
      setStatus('error');
    }
  };

  return (
    <>
      <Head>
        <title>Crear cuenta — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <style>{`
        .reg-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--bg); padding: 24px; }
        .reg-box { width: 100%; max-width: 400px; }
        .reg-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .reg-logo span { color: var(--accent); }
        .reg-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .reg-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
        .reg-free-badge { display: inline-block; margin-bottom: 24px; font-size: 0.75rem; font-weight: 700; background: rgba(249,215,27,0.1); color: var(--accent); border: 1px solid rgba(249,215,27,0.25); border-radius: 6px; padding: 5px 12px; }
        .reg-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .reg-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s; }
        .reg-input:focus { border-color: var(--accent); }
        .reg-field { margin-bottom: 16px; }
        .reg-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .reg-btn:hover { opacity: 0.9; }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .reg-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .reg-footer { margin-top: 24px; font-size: 0.8125rem; color: var(--muted); text-align: center; }
        .reg-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
        .reg-divider { margin: 20px 0; border: none; border-top: 1px solid var(--border); }
        .reg-plan-note { font-size: 0.8125rem; color: var(--muted); text-align: center; line-height: 1.6; }
        .reg-plan-note a { color: var(--accent); font-weight: 600; text-decoration: none; }
      `}</style>

      <div className="reg-wrap">
        <div className="reg-box">
          <Link href="/" className="reg-logo">margen<span>real</span></Link>

          <div className="reg-free-badge">Gratis — sin tarjeta de crédito</div>

          <h1 className="reg-title">Creá tu cuenta</h1>
          <p className="reg-sub">Empezá gratis. Si después querés más funciones, podés comprar un plan cuando quieras.</p>

          <form onSubmit={handleSubmit}>
            <div className="reg-field">
              <label className="reg-label">Email</label>
              <input className="reg-input" type="email" placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="reg-field">
              <label className="reg-label">Contraseña</label>
              <input className="reg-input" type="password" placeholder="Mínimo 8 caracteres" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <div className="reg-field">
              <label className="reg-label">Repetir contraseña</label>
              <input className="reg-input" type="password" placeholder="Repetí la contraseña" value={password2} onChange={e => setPassword2(e.target.value)} required />
            </div>
            <button className="reg-btn" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Creando cuenta...' : 'Crear cuenta gratis →'}
            </button>
            {errorMsg && <div className="reg-error">{errorMsg}</div>}
          </form>

          <hr className="reg-divider" />
          <p className="reg-plan-note">
            ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión →</Link><br />
            ¿Querés ver los planes? <Link href="/pricing">Ver planes →</Link>
          </p>
        </div>
      </div>
    </>
  );
}
