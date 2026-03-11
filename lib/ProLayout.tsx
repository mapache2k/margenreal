'use client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePro } from '../lib/ProContext';
import { ReactNode } from 'react';

const scoreColor = (s: number) => s >= 70 ? '#2dd4a0' : s >= 40 ? '#f0b429' : '#e85555';
const scoreLabel = (s: number) => s >= 70 ? 'Sólido' : s >= 40 ? 'En riesgo' : 'Crítico';

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};

const NAV_ITEMS = [
  { href: '/pro', label: 'Inicio', icon: '⬡', exact: true },
  { href: '/pro/diagnostico', label: 'Diagnóstico', icon: '📊' },
  { href: '/pro/simuladores', label: 'Simuladores', icon: '⚡' },
  { href: '/pro/forecast', label: 'Forecast', icon: '🔭' },
];

export default function ProLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { data, inputs } = usePro();
  const calc = data?.calc;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { font-size: 16px; }
        body {
          background: #161614;
          color: #f0f0f0;
          font-family: 'Epilogue', sans-serif;
          -webkit-font-smoothing: antialiased;
        }

        .pro-shell {
          display: flex;
          min-height: 100vh;
        }

        /* ── Sidebar ── */
        .pro-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: #1a1a18;
          border-right: 1px solid #2a2a28;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0; left: 0; bottom: 0;
          overflow-y: auto;
          z-index: 50;
        }

        .sidebar-logo {
          padding: 24px 20px 20px;
          border-bottom: 1px solid #2a2a28;
        }
        .sidebar-logo-text {
          font-family: 'Syne', sans-serif;
          font-weight: 800; font-size: 1rem;
          text-decoration: none; color: #f0f0f0;
          letter-spacing: -0.01em;
          display: block; margin-bottom: 4px;
        }
        .sidebar-logo-text span { color: #f0ebe0; }
        .sidebar-pro-badge {
          font-size: 0.5rem; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase;
          background: rgba(240,235,224,.08);
          border: 1px solid rgba(240,235,224,.15);
          color: #888; padding: 3px 7px; border-radius: 4px;
          display: inline-block;
        }

        /* Business snapshot in sidebar */
        .sidebar-snapshot {
          padding: 16px 20px;
          border-bottom: 1px solid #2a2a28;
        }
        .sidebar-business-name {
          font-family: 'Syne', sans-serif;
          font-size: 0.8125rem; font-weight: 800;
          color: #f0f0f0; margin-bottom: 10px;
          letter-spacing: -0.01em;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-score {
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 10px;
        }
        .sidebar-score-dot {
          width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0;
        }
        .sidebar-score-text {
          font-size: 0.75rem; font-weight: 700; color: #f0f0f0;
        }
        .sidebar-score-num { font-size: 0.6875rem; color: #555; margin-left: auto; }
        .sidebar-metrics {
          display: flex; flex-direction: column; gap: 6px;
        }
        .sidebar-metric {
          display: flex; justify-content: space-between; align-items: center;
        }
        .sidebar-metric-lbl { font-size: 0.6875rem; color: #555; }
        .sidebar-metric-val { font-size: 0.6875rem; font-weight: 600; color: #f0f0f0; }
        .sidebar-empty {
          font-size: 0.75rem; color: #444; line-height: 1.6;
          font-style: italic;
        }

        /* Nav */
        .sidebar-nav {
          padding: 12px 12px;
          flex: 1;
        }
        .sidebar-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          text-decoration: none; color: #555;
          font-size: 0.875rem; font-weight: 500;
          transition: all 0.18s; margin-bottom: 2px;
          cursor: pointer; border: none; background: none;
          width: 100%; text-align: left;
        }
        .sidebar-nav-item:hover { background: rgba(240,235,224,.05); color: #f0f0f0; }
        .sidebar-nav-item.active {
          background: rgba(240,235,224,.08);
          color: #f0f0f0;
          font-weight: 600;
        }
        .sidebar-nav-icon { font-size: 0.875rem; flex-shrink: 0; opacity: 0.7; }
        .sidebar-nav-item.active .sidebar-nav-icon { opacity: 1; }

        .sidebar-nav-locked {
          display: flex; align-items: center; gap: 10px;
          padding: 10px 12px; border-radius: 8px;
          color: #333; font-size: 0.875rem; font-weight: 500;
          cursor: not-allowed;
        }
        .sidebar-lock { font-size: 0.625rem; margin-left: auto; color: #333; }

        .sidebar-footer {
          padding: 16px 20px;
          border-top: 1px solid #2a2a28;
        }
        .sidebar-footer-link {
          font-size: 0.75rem; color: #444;
          text-decoration: none; display: block; margin-bottom: 4px;
          transition: color 0.18s;
        }
        .sidebar-footer-link:hover { color: #888; }

        /* ── Main content ── */
        .pro-main {
          margin-left: 240px;
          flex: 1;
          min-height: 100vh;
        }

        .pro-topbar {
          height: 56px;
          border-bottom: 1px solid #2a2a28;
          display: flex; align-items: center;
          padding: 0 40px;
          background: #161614;
          position: sticky; top: 0; z-index: 40;
        }
        .pro-topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.9375rem; font-weight: 800;
          color: #f0f0f0; letter-spacing: -0.02em;
        }
        .pro-topbar-sub { font-size: 0.8125rem; color: #555; margin-left: 12px; }

        .pro-content {
          padding: 40px;
          max-width: 900px;
        }

        @media (max-width: 768px) {
          .pro-sidebar { display: none; }
          .pro-main { margin-left: 0; }
          .pro-content { padding: 24px 20px; }
          .pro-topbar { padding: 0 20px; }
        }
      `}</style>

      <div className="pro-shell">
        {/* Sidebar */}
        <aside className="pro-sidebar">
          <div className="sidebar-logo">
            <a className="sidebar-logo-text" href="/index.html">margen<span>real</span></a>
            <span className="sidebar-pro-badge">PRO</span>
          </div>

          {/* Business snapshot */}
          <div className="sidebar-snapshot">
            {calc ? (
              <>
                <div className="sidebar-business-name">
                  {inputs.businessName || 'Mi negocio'}
                </div>
                <div className="sidebar-score">
                  <div className="sidebar-score-dot" style={{ background: scoreColor(calc.score) }} />
                  <div className="sidebar-score-text" style={{ color: scoreColor(calc.score) }}>
                    {scoreLabel(calc.score)}
                  </div>
                  <div className="sidebar-score-num">{calc.score}/100</div>
                </div>
                <div className="sidebar-metrics">
                  <div className="sidebar-metric">
                    <span className="sidebar-metric-lbl">EBITDA</span>
                    <span className="sidebar-metric-val" style={{ color: calc.ebitda >= 0 ? '#2dd4a0' : '#e85555' }}>
                      {fmtCLP(calc.ebitda)}
                    </span>
                  </div>
                  <div className="sidebar-metric">
                    <span className="sidebar-metric-lbl">Runway</span>
                    <span className="sidebar-metric-val">
                      {isFinite(calc.runway) ? `${calc.runway.toFixed(1)}m` : '∞'}
                    </span>
                  </div>
                  <div className="sidebar-metric">
                    <span className="sidebar-metric-lbl">Margen</span>
                    <span className="sidebar-metric-val">{calc.grossMarginPct.toFixed(1)}%</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="sidebar-empty">Ingresa tus datos en Inicio para ver el diagnóstico</div>
            )}
          </div>

          {/* Navigation */}
          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => {
              const isActive = item.exact
                ? router.pathname === item.href
                : router.pathname.startsWith(item.href);
              const isLocked = !calc && item.href !== '/pro';
              if (isLocked) {
                return (
                  <div key={item.href} className="sidebar-nav-locked">
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {item.label}
                    <span className="sidebar-lock">🔒</span>
                  </div>
                );
              }
              return (
                <Link key={item.href} href={item.href} legacyBehavior>
                  <a className={`sidebar-nav-item ${isActive ? 'active' : ''}`}>
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {item.label}
                  </a>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <a className="sidebar-footer-link" href="/tool.html">← Herramienta gratuita</a>
            <a className="sidebar-footer-link" href="/pricing.html">Planes</a>
          </div>
        </aside>

        {/* Main */}
        <main className="pro-main">
          {children}
        </main>
      </div>
    </>
  );
}
