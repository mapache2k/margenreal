import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Layout from '../components/Layout';
import ProGate from '../components/ProGate';

function CambiarPasswordContent() {
  const [current, setCurrent]   = useState('');
  const [next, setNext]         = useState('');
  const [next2, setNext2]       = useState('');
  const [status, setStatus]     = useState<'idle' | 'loading' | 'ok' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (next !== next2) { setErrorMsg('Las contraseñas no coinciden'); setStatus('error'); return; }
    if (next.length < 8)  { setErrorMsg('Mínimo 8 caracteres'); setStatus('error'); return; }

    setStatus('loading');
    setErrorMsg('');

    const token = localStorage.getItem('mr_session') ?? '';
    const res = await fetch('/api/auth/change-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ currentPassword: current, newPassword: next }),
    });
    const data = await res.json();

    if (res.ok && data.ok) {
      setStatus('ok');
      setCurrent(''); setNext(''); setNext2('');
    } else {
      setErrorMsg(data.error ?? 'Error al cambiar la contraseña');
      setStatus('error');
    }
  };

  return (
    <>
      <style>{`
        .cp-wrap { max-width: 420px; margin: 0 auto; padding: 48px 24px; }
        .cp-back { font-size: 0.8125rem; color: var(--muted); text-decoration: none; display: inline-flex; align-items: center; gap: 6px; margin-bottom: 32px; transition: color 0.15s; }
        .cp-back:hover { color: var(--text); text-decoration: none; }
        .cp-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; color: var(--text); letter-spacing: -0.02em; margin-bottom: 8px; }
        .cp-sub { font-size: 0.875rem; color: var(--muted); margin-bottom: 32px; line-height: 1.6; }
        .cp-field { margin-bottom: 16px; }
        .cp-label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
        .cp-input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; font-family: inherit; box-sizing: border-box; transition: border-color 0.15s; }
        .cp-input:focus { border-color: var(--accent); }
        .cp-btn { width: 100%; margin-top: 8px; background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 14px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; }
        .cp-btn:hover { opacity: 0.9; }
        .cp-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .cp-error { font-size: 0.8125rem; color: #ef4444; margin-top: 12px; }
        .cp-success { text-align: center; padding: 32px 20px; background: rgba(45,212,160,0.07); border: 1.5px solid rgba(45,212,160,0.25); border-radius: 14px; }
        .cp-success-icon { font-size: 2rem; margin-bottom: 12px; }
        .cp-success-title { font-weight: 800; color: var(--text); margin-bottom: 6px; }
        .cp-success-sub { font-size: 0.875rem; color: var(--muted); }
      `}</style>

      <div className="cp-wrap">
        <Link href="/dashboard" className="cp-back">← Volver a mi cuenta</Link>

        <h1 className="cp-title">Cambiar contraseña</h1>
        <p className="cp-sub">Ingresa tu contraseña actual y elige una nueva de al menos 8 caracteres.</p>

        {status === 'ok' ? (
          <div className="cp-success">
            <div className="cp-success-icon">✅</div>
            <div className="cp-success-title">Contraseña actualizada</div>
            <div className="cp-success-sub">Tu contraseña fue cambiada correctamente.</div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="cp-field">
              <label className="cp-label">Contraseña actual</label>
              <input className="cp-input" type="password" placeholder="Tu contraseña actual" value={current} onChange={e => setCurrent(e.target.value)} required />
            </div>
            <div className="cp-field">
              <label className="cp-label">Nueva contraseña</label>
              <input className="cp-input" type="password" placeholder="Mínimo 8 caracteres" value={next} onChange={e => setNext(e.target.value)} required />
            </div>
            <div className="cp-field">
              <label className="cp-label">Repetir nueva contraseña</label>
              <input className="cp-input" type="password" placeholder="Repetí la nueva contraseña" value={next2} onChange={e => setNext2(e.target.value)} required />
            </div>
            <button className="cp-btn" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Guardando...' : 'Guardar nueva contraseña →'}
            </button>
            {errorMsg && <div className="cp-error">{errorMsg}</div>}
          </form>
        )}
      </div>
    </>
  );
}

export default function CambiarPasswordPage() {
  return (
    <Layout>
      <Head>
        <title>Cambiar contraseña — Margen Real</title>
        <meta name="robots" content="noindex" />
      </Head>
      <ProGate>
        {() => <CambiarPasswordContent />}
      </ProGate>
    </Layout>
  );
}
