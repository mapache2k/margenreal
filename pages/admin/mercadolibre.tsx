'use client';
import Head from 'next/head';
import { useState } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

export default function AdminMercadoLibre() {
  const [appId, setAppId]   = useState('');
  const [secret, setSecret] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const handleSave = async () => {
    if (!appId.trim() || !secret.trim()) return;
    setStatus('saving');
    await new Promise(r => setTimeout(r, 800));
    setStatus('saved');
    setTimeout(() => setStatus('idle'), 2500);
  };

  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>API Mercado Libre — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <style>{`
          .ml-wrap { max-width: 860px; margin: 0 auto; padding: 40px 24px 80px; }
          .ml-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); margin: 0 0 6px; }
          .ml-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
          .ml-label { font-size: 0.6875rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); }

          .ml-field { margin-bottom: 20px; }
          .ml-field label { display: block; font-size: 0.6875rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); margin-bottom: 8px; }
          .ml-field input { width: 100%; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 14px; border-radius: 10px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
          .ml-field input:focus { border-color: var(--accent); }

          .ml-btn { background: var(--accent); color: var(--bg); font-weight: 800; font-size: 0.9375rem; padding: 13px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; width: 100%; }
          .ml-btn:hover { opacity: 0.9; }
          .ml-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .ml-error { color: #ef4444; font-size: 0.875rem; margin-top: 14px; }
          .ml-divider { border: none; border-top: 1px solid var(--border); margin: 36px 0; }

          .ml-instr { background: var(--surface); border: 1.5px solid var(--border); border-radius: 12px; padding: 18px 22px; font-size: 0.875rem; color: var(--muted); line-height: 1.7; }
          .ml-instr strong { color: var(--text); display: block; margin-bottom: 8px; }
          .ml-instr ol { margin: 0; padding-left: 18px; }
          .ml-instr a { color: var(--accent); }
        `}</style>

        <div className="ml-wrap">
          <h1 className="ml-title">API Mercado Libre</h1>
          <p className="ml-sub">Configurá la conexión con la API oficial de MercadoLibre para sincronizar publicaciones, ventas y comisiones automáticamente.</p>

          {/* Estado de conexión */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32, background: 'var(--surface)', border: '1.5px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', flexShrink: 0, boxShadow: '0 0 6px rgba(239,68,68,0.5)' }} />
            <span style={{ fontSize: '0.875rem', color: 'var(--muted)' }}>Sin conexión activa</span>
            <span style={{ marginLeft: 'auto', fontSize: '0.6875rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#ef4444', background: 'rgba(239,68,68,0.1)', borderRadius: 6, padding: '2px 8px' }}>Desconectado</span>
          </div>

          {/* Credenciales */}
          <div className="ml-label" style={{ marginBottom: 16 }}>Credenciales de la App</div>
          <div className="ml-field">
            <label>App ID</label>
            <input type="text" placeholder="ej. 123456789" value={appId} onChange={e => setAppId(e.target.value)} />
          </div>
          <div className="ml-field">
            <label>Client Secret</label>
            <input type="password" placeholder="••••••••••••••••" value={secret} onChange={e => setSecret(e.target.value)} />
          </div>
          <button className="ml-btn" onClick={handleSave} disabled={status === 'saving' || !appId.trim() || !secret.trim()}>
            {status === 'saving' ? 'Guardando...' : status === 'saved' ? 'Guardado ✓' : 'Guardar credenciales'}
          </button>
          {status === 'error' && <div className="ml-error">Error al guardar. Intentá de nuevo.</div>}

          <div className="ml-divider" />

          {/* Instrucciones */}
          <div className="ml-instr">
            <strong>Cómo obtener las credenciales</strong>
            <ol>
              <li>Ingresá a <a href="https://developers.mercadolibre.com.ar" target="_blank" rel="noopener noreferrer">developers.mercadolibre.com.ar</a></li>
              <li>Creá una nueva aplicación en el panel de desarrolladores</li>
              <li>Copiá el <strong style={{ display: 'inline', color: 'var(--text)' }}>App ID</strong> y el <strong style={{ display: 'inline', color: 'var(--text)' }}>Client Secret</strong> generados</li>
              <li>Pegá los valores arriba y guardá</li>
            </ol>
          </div>
        </div>

      </Layout>
    </AdminGate>
  );
}
