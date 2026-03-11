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
      <style>{/* tu CSS inline — lo mantuve igual */`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Epilogue:wght@400;500;600&display=swap');
        /* ...resto del CSS... */
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
