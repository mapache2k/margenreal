'use client';
import Head from 'next/head';
import { useState, useRef } from 'react';
import AdminGate from '../../components/AdminGate';
import Layout from '../../components/Layout';

const fmtURL = (q: string) =>
  `https://listado.mercadolibre.cl/${encodeURIComponent(q.trim().replace(/\s+/g, '-'))}`;

export default function AdminMercadoLibre() {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSearch = () => {
    const q = query.trim();
    if (!q) return;
    window.open(fmtURL(q), '_blank', 'noopener,noreferrer');
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSearch();
  };

  return (
    <AdminGate>
      <Layout>
        <Head>
          <title>API Mercado Libre — Margen Real</title>
          <meta name="robots" content="noindex" />
        </Head>

        <style>{`
          .ml-wrap { max-width: 700px; margin: 0 auto; padding: 40px 24px 80px; }
          .ml-title { font-family: var(--font-display); font-size: 1.5rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); margin: 0 0 6px; }
          .ml-sub { font-size: 0.875rem; color: var(--muted); margin: 0 0 32px; line-height: 1.6; }
          .ml-search-input { flex: 1; background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: inherit; font-size: 0.9375rem; padding: 12px 16px; border-radius: 10px; outline: none; transition: border-color 0.2s; }
          .ml-search-input:focus { border-color: var(--accent); }
          .ml-search-btn { background: #FFE600; color: #333; font-weight: 800; font-size: 0.9375rem; padding: 12px 24px; border-radius: 10px; border: none; cursor: pointer; font-family: inherit; transition: opacity 0.15s; white-space: nowrap; flex-shrink: 0; }
          .ml-search-btn:hover { opacity: 0.85; }
          .ml-search-btn:disabled { opacity: 0.4; cursor: not-allowed; }
          .ml-note { font-size: 0.8125rem; color: var(--muted-2); margin-top: 14px; line-height: 1.5; }
        `}</style>

        <div className="ml-wrap">
          <h1 className="ml-title">Buscar en Mercado Libre</h1>
          <p className="ml-sub">Buscá productos en MercadoLibre Chile. Los resultados se abren en una nueva pestaña.</p>

          <div style={{ display: 'flex', gap: 10 }}>
            <input
              ref={inputRef}
              type="text"
              className="ml-search-input"
              placeholder="Ej: pañales, leche, celular..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={handleKey}
              autoFocus
            />
            <button
              className="ml-search-btn"
              onClick={handleSearch}
              disabled={!query.trim()}
            >
              Buscar →
            </button>
          </div>
          <p className="ml-note">Abre mercadolibre.cl con los resultados de tu búsqueda en una pestaña nueva.</p>
        </div>

      </Layout>
    </AdminGate>
  );
}
