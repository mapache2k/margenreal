'use client';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

const SESSION_KEY = 'mr_session';

type Step = 'plan' | 'form';

export default function RegistroPage() {
  const router = useRouter();
  const [step, setStep]           = useState<Step>('plan');
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [password2, setPassword2] = useState('');
  const [status, setStatus]       = useState<'idle' | 'loading' | 'error'>('idle');
  const [errorMsg, setErrorMsg]   = useState('');

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
        .reg-box { width: 100%; max-width: 480px; }
        .reg-logo { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 40px; text-decoration: none; display: block; }
        .reg-logo span { color: var(--accent); }
        .reg-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin: 0 0 8px; }
        .reg-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 28px; line-height: 1.6; }

        /* Plan cards */
        .plan-cards { display: flex; flex-direction: column; gap: 12px; margin-bottom: 8px; }
        .plan-card { border: 1.5px solid var(--border); border-radius: 14px; padding: 20px; cursor: pointer; background: var(--surface); transition: border-color 0.15s; text-align: left; width: 100%; font-family: inherit; }
        .plan-card:hover { border-color: var(--accent); }
        .plan-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px; }
        .plan-card-name { font-size: 1rem; font-weight: 800; color: var(--text); font-family: var(--font-display); }
        .plan-card-badge-free { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(45,212,160,0.12); color: #2dd4a0; border-radius: 4px; padding: 2px 8px; }
        .plan-card-badge-paid { font-size: 0.625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; background: rgba(249,215,27,0.12); color: var(--accent); border-radius: 4px; padding: 2px 8px; }
        .plan-card-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.55; }
        .plan-card-price { font-size: 0.875rem; font-weight: 700; color: var(--muted); margin-top: 10px; }
        .plan-card-cta { margin-top: 14px; display: inline-block; font-size: 0.875rem; font-weight: 800; padding: 10px 18px; border-radius: 9px; transition: opacity 0.15s; text-decoration: none; }
        .plan-card-cta-free { background: var(--surface); border: 1.5px solid var(--border); color: var(--text); }
        .plan-card-cta-paid { background: var(--accent); color: var(--bg); }
        .plan-card:hover .plan-card-cta-free { border-color: var(--accent); color: var(--accent); }

        /* Form */
        .reg-back { background: none; border: none; color: var(--muted); font-size: 0.8125rem; cursor: pointer; font-family: inherit; padding: 0; margin-bottom: 28px; display: flex; align-items: center; gap: 6px; transition: color 0.15s; }
        .reg-back:hover { color: var(--text); }
        .reg-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .reg-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s; }
        .reg-input:focus { border-color: var(--accent); }
        .reg-field { margin-bottom: 16px; }
        .reg-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .reg-btn:hover { opacity: 0.9; }
        .reg-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .reg-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .reg-footer { margin-top: 20px; font-size: 0.8125rem; color: var(--muted); text-align: center; }
        .reg-footer a { color: var(--accent); text-decoration: none; font-weight: 600; }
      `}</style>

      <div className="reg-wrap">
        <div className="reg-box">
          <Link href="/" className="reg-logo">margen<span>real</span></Link>

          {step === 'plan' ? (
            <>
              <h1 className="reg-title">Elegí tu plan</h1>
              <p className="reg-sub">Empezá gratis o comprá un plan pago. Si ya pagaste, revisá tu email para activar tu cuenta.</p>

              <div className="plan-cards">
                {/* Gratis */}
                <button className="plan-card" onClick={() => setStep('form')}>
                  <div className="plan-card-top">
                    <span className="plan-card-name">Plan Gratis</span>
                    <span className="plan-card-badge-free">Sin costo</span>
                  </div>
                  <div className="plan-card-desc">Acceso a la calculadora con hasta 3 productos para comparar. Ideal para empezar.</div>
                  <div className="plan-card-cta plan-card-cta-free">Crear cuenta gratis →</div>
                </button>

                {/* Starter */}
                <Link href="/pricing" className="plan-card" style={{ textDecoration: 'none' }}>
                  <div className="plan-card-top">
                    <span className="plan-card-name">Plan Starter</span>
                    <span className="plan-card-badge-paid">Pago único</span>
                  </div>
                  <div className="plan-card-desc">Sin límite de productos, acceso completo a todas las calculadoras y guías.</div>
                  <div className="plan-card-cta plan-card-cta-paid">Ver precio →</div>
                </Link>

                {/* Pro */}
                <Link href="/pricing" className="plan-card" style={{ textDecoration: 'none' }}>
                  <div className="plan-card-top">
                    <span className="plan-card-name">Plan Pro</span>
                    <span className="plan-card-badge-paid">Pago único</span>
                  </div>
                  <div className="plan-card-desc">Todo lo de Starter más herramientas avanzadas de análisis y comparación.</div>
                  <div className="plan-card-cta plan-card-cta-paid">Ver precio →</div>
                </Link>
              </div>

              <div className="reg-footer" style={{ marginTop: 24 }}>
                ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión →</Link>
              </div>
            </>
          ) : (
            <>
              <button className="reg-back" onClick={() => setStep('plan')}>← Volver a los planes</button>
              <h1 className="reg-title">Crear cuenta gratis</h1>
              <p className="reg-sub">Sin tarjeta de crédito. Podés comprar un plan en cualquier momento.</p>

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

              <div className="reg-footer">
                ¿Ya tenés cuenta? <Link href="/login">Iniciá sesión →</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
