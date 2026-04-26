'use client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { usePro } from '../lib/ProContext';
import { ReactNode } from 'react';
import Layout from '../components/Layout';

const scoreColor = (s: number) => s >= 70 ? '#2dd4a0' : s >= 40 ? '#f0b429' : '#e85555';
const scoreLabel = (s: number) => s >= 70 ? 'Sólido' : s >= 40 ? 'En riesgo' : 'Crítico';

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};

const STEPS = [
  { href: '/pro',              label: 'Inicio',      icon: '⬡', exact: true },
  { href: '/pro/diagnostico',  label: 'Diagnóstico', icon: '📊' },
  { href: '/pro/forecast',     label: 'Forecast',    icon: '🔭' },
  { href: '/pro/simuladores',  label: 'Simuladores', icon: '⚡' },
];

export default function ProLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const prov = usePro() || ({} as { data?: any; inputs?: any });
  const { data } = prov;
  const calc = data?.calc;

  return (
    <Layout>
      <style>{`
        .pro-subnav {
          border-bottom: 1px solid var(--border);
          padding: 0 40px;
          display: flex;
          gap: 4px;
          background: var(--bg);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        @media(max-width:640px){ .pro-subnav { padding: 0 20px; } }

        .pro-tab {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 14px 16px;
          font-size: 0.875rem; font-weight: 500; color: var(--muted);
          text-decoration: none; white-space: nowrap;
          border-bottom: 2px solid transparent;
          transition: color var(--transition), border-color var(--transition);
        }
        .pro-tab:hover { color: var(--text); text-decoration: none; }
        .pro-tab.active { color: var(--text); border-bottom-color: var(--accent); font-weight: 700; }
        .pro-tab.locked { color: var(--muted-2); cursor: not-allowed; pointer-events: none; }
        .pro-tab-icon { font-size: 1rem; }
        .pro-tab-lock { font-size: 0.625rem; opacity: 0.5; }

        .pro-metrics-bar {
          display: flex; align-items: center; gap: 0;
          height: 52px; padding: 0 40px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pro-metrics-bar::-webkit-scrollbar { display: none; }
        @media(max-width:640px){ .pro-metrics-bar { padding: 0 20px; } }

        .pm-score {
          display: flex; align-items: center; gap: 10px;
          padding-right: 24px; margin-right: 24px;
          border-right: 1px solid var(--border);
          flex-shrink: 0;
        }
        .pm-score-ring {
          width: 36px; height: 36px; border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: var(--font-display); font-size: 0.6875rem; font-weight: 900;
          flex-shrink: 0; border: 2px solid;
        }
        .pm-score-text {}
        .pm-score-label { font-family: var(--font-display); font-size: 0.875rem; font-weight: 800; letter-spacing: -0.02em; line-height: 1.1; }
        .pm-score-sub { font-size: 0.5625rem; color: var(--muted-2); margin-top: 1px; letter-spacing: 0.04em; }

        .pm-divider { width: 1px; height: 28px; background: var(--border); flex-shrink: 0; margin: 0 20px; }

        .pm-stat { display: flex; flex-direction: column; gap: 1px; flex-shrink: 0; min-width: 54px; }
        .pm-stat-lbl { font-size: 0.4375rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.14em; color: var(--muted-2); }
        .pm-stat-val { font-family: var(--font-display); font-size: 1rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; }

        .pro-content { padding: 0; }
      `}</style>

      {/* Step tabs */}
      <div className="pro-subnav">
        {STEPS.map(step => {
          const isActive = step.exact
            ? router.pathname === step.href
            : router.pathname.startsWith(step.href);
          const isLocked = !calc && step.href !== '/pro';
          return (
            <Link
              key={step.href}
              href={isLocked ? '#' : step.href}
              className={`pro-tab${isActive ? ' active' : ''}${isLocked ? ' locked' : ''}`}
            >
              <span className="pro-tab-icon">{step.icon}</span>
              {step.label}
              {isLocked && <span className="pro-tab-lock">🔒</span>}
            </Link>
          );
        })}
      </div>

      {/* Metrics bar — only when data exists */}
      {calc && (() => {
        const col = scoreColor(calc.score);
        const ebitdaCol = calc.ebitda >= 0 ? 'var(--accent)' : 'var(--danger)';
        const runwayCol = !isFinite(calc.runway) || calc.runway > 12 ? 'var(--accent)' : calc.runway > 3 ? 'var(--warning)' : 'var(--danger)';
        const margenCol = calc.grossMarginPct >= 30 ? 'var(--accent)' : calc.grossMarginPct >= 20 ? 'var(--warning)' : 'var(--danger)';
        return (
          <div className="pro-metrics-bar">
            {/* Score — ring + label */}
            <div className="pm-score">
              <div className="pm-score-ring" style={{ color: col, borderColor: `${col}40`, background: `${col}10` }}>
                {calc.score}
              </div>
              <div className="pm-score-text">
                <div className="pm-score-label" style={{ color: col }}>{scoreLabel(calc.score)}</div>
                <div className="pm-score-sub">Salud financiera</div>
              </div>
            </div>

            <div className="pm-stat">
              <span className="pm-stat-lbl">EBITDA</span>
              <span className="pm-stat-val" style={{ color: ebitdaCol }}>{fmtCLP(calc.ebitda)}</span>
            </div>
            <div className="pm-divider" />
            <div className="pm-stat">
              <span className="pm-stat-lbl">Runway</span>
              <span className="pm-stat-val" style={{ color: runwayCol }}>{isFinite(calc.runway) ? `${calc.runway.toFixed(1)}m` : '∞'}</span>
            </div>
            <div className="pm-divider" />
            <div className="pm-stat">
              <span className="pm-stat-lbl">Margen</span>
              <span className="pm-stat-val" style={{ color: margenCol }}>{calc.grossMarginPct.toFixed(1)}%</span>
            </div>
            <div className="pm-divider" />
            <div className="pm-stat">
              <span className="pm-stat-lbl">Caja</span>
              <span className="pm-stat-val" style={{ color: 'var(--text)' }}>{fmtCLP(calc.cashAdjustedStart)}</span>
            </div>
            <div className="pm-divider" />
            <div className="pm-stat">
              <span className="pm-stat-lbl">Flujo neto</span>
              <span className="pm-stat-val" style={{ color: calc.monthlyNetCashFlow >= 0 ? 'var(--accent)' : 'var(--danger)' }}>{fmtCLP(calc.monthlyNetCashFlow)}</span>
            </div>
          </div>
        );
      })()}

      <div className="pro-content">
        {children}
      </div>
    </Layout>
  );
}
