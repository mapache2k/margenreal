// components/ProLayout.tsx (o lib/ProLayout.tsx)
// 'use client' ya estaba presente en tu archivo original
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
  // Protegemos por si usePro() devuelve undefined en SSR o durante build
  const prov = usePro() || ({} as { data?: any; inputs?: any });
  const { data, inputs } = prov;
  const calc = data?.calc;

  // valor seguro para el nombre del negocio
  const businessName = inputs?.businessName ?? 'Mi negocio';

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Epilogue', sans-serif; background: #0a0a0e; color: #e8e8ea; }

        .pro-shell { display: flex; min-height: 100vh; }

        /* ── Sidebar ── */
        .pro-sidebar {
          width: 220px; flex-shrink: 0;
          background: #0d0d10; border-right: 1px solid #1f2125;
          display: flex; flex-direction: column;
          position: sticky; top: 0; height: 100vh; overflow-y: auto;
        }
        .sidebar-logo {
          display: flex; align-items: center; gap: 8px;
          padding: 24px 20px 20px;
          border-bottom: 1px solid #1f2125;
        }
        .sidebar-logo-text {
          font-family: 'Syne', sans-serif; font-size: 1rem; font-weight: 800;
          color: #e8e8ea; text-decoration: none; letter-spacing: -0.02em;
        }
        .sidebar-logo-text span { color: #f9d71b; }
        .sidebar-pro-badge {
          font-family: 'Syne', sans-serif; font-size: 9px; font-weight: 800;
          background: #f9d71b; color: #0a0a0e;
          padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em;
        }
        .sidebar-snapshot {
          padding: 16px 20px;
          border-bottom: 1px solid #1f2125;
        }
        .sidebar-business-name {
          font-family: 'Syne', sans-serif; font-size: 0.875rem; font-weight: 700;
          color: #e8e8ea; margin-bottom: 10px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .sidebar-score { display: flex; align-items: center; gap: 7px; margin-bottom: 12px; }
        .sidebar-score-dot { width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }
        .sidebar-score-text { font-size: 0.75rem; font-weight: 600; flex: 1; }
        .sidebar-score-num { font-family: 'Syne', sans-serif; font-size: 0.75rem; font-weight: 800; color: #9aa0b2; }
        .sidebar-metrics { display: grid; gap: 8px; }
        .sidebar-metric { display: flex; justify-content: space-between; align-items: center; }
        .sidebar-metric-lbl { font-size: 0.625rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; color: #6f7480; }
        .sidebar-metric-val { font-family: 'Syne', sans-serif; font-size: 0.8125rem; font-weight: 800; color: #e8e8ea; }
        .sidebar-empty { font-size: 0.75rem; color: #6f7480; line-height: 1.6; }
        .sidebar-nav { flex: 1; padding: 12px 10px; display: flex; flex-direction: column; gap: 2px; }
        .sidebar-nav-item {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 9px;
          font-size: 0.875rem; font-weight: 500; color: #9aa0b2;
          text-decoration: none; transition: background 0.15s, color 0.15s;
        }
        .sidebar-nav-item:hover { background: #1a1a1f; color: #e8e8ea; }
        .sidebar-nav-item.active { background: #1f2125; color: #f9d71b; font-weight: 700; }
        .sidebar-nav-locked {
          display: flex; align-items: center; gap: 10px;
          padding: 9px 12px; border-radius: 9px;
          font-size: 0.875rem; color: #3a3a45; cursor: not-allowed;
        }
        .sidebar-nav-icon { font-size: 1rem; width: 20px; text-align: center; flex-shrink: 0; }
        .sidebar-lock { margin-left: auto; font-size: 0.75rem; }
        .sidebar-footer {
          padding: 16px 10px;
          border-top: 1px solid #1f2125;
          display: flex; flex-direction: column; gap: 2px;
        }
        .sidebar-footer-link {
          font-size: 0.8125rem; color: #6f7480;
          text-decoration: none; padding: 7px 12px; border-radius: 8px;
          transition: color 0.15s, background 0.15s;
        }
        .sidebar-footer-link:hover { color: #e8e8ea; background: #1a1a1f; }

        /* ── Main content area ── */
        .pro-main { flex: 1; min-width: 0; overflow-x: hidden; }

        @media (max-width: 768px) {
          .pro-sidebar { display: none; }
        }
      `}</style>

      <div className="pro-shell">
        <aside className="pro-sidebar">
          <div className="sidebar-logo">
            <Link href="/" className="sidebar-logo-text">margen<span>real</span></Link>
            <span className="sidebar-pro-badge">PRO</span>
          </div>

          <div className="sidebar-snapshot">
            {calc ? (
              <>
                <div className="sidebar-business-name">
                  {businessName}
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

          <nav className="sidebar-nav">
            {NAV_ITEMS.map(item => {
              const isActive = item.exact ? router.pathname === item.href : router.pathname.startsWith(item.href);
              const isLocked = !calc && item.href !== '/pro';
              if (isLocked) {
                return (
                  <div key={item.href} className="sidebar-nav-locked" aria-hidden>
                    <span className="sidebar-nav-icon">{item.icon}</span>
                    {item.label}
                    <span className="sidebar-lock">🔒</span>
                  </div>
                );
              }
              return (
                <Link key={item.href} href={item.href} className={`sidebar-nav-item ${isActive ? 'active' : ''}`} aria-current={isActive ? 'page' : undefined}>
                  <span className="sidebar-nav-icon" aria-hidden>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="sidebar-footer">
            <Link href="/tool" className="sidebar-footer-link">← Herramienta gratuita</Link>
            <Link href="/pricing" className="sidebar-footer-link">Planes</Link>
          </div>
        </aside>

        <main className="pro-main">{children}</main>
      </div>
    </>
  );
}
