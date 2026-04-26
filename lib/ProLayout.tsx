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
          display: flex; gap: 6px; align-items: center;
          padding: 10px 40px;
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
        }
        @media(max-width:640px){ .pro-metrics-bar { padding: 10px 20px; } }

        .pm-score {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 14px; border-radius: 10px; border: 1px solid;
          white-space: nowrap; flex-shrink: 0; margin-right: 4px;
        }
        .pm-score-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }
        .pm-score-label { font-family: var(--font-display); font-size: 0.8125rem; font-weight: 800; letter-spacing: -0.01em; }
        .pm-score-num { font-size: 0.6875rem; font-weight: 600; opacity: 0.75; }

        .pm-chip {
          display: inline-flex; flex-direction: column; gap: 2px;
          padding: 7px 13px; border-radius: 10px;
          border: 1px solid var(--border); background: var(--surface);
          white-space: nowrap; flex-shrink: 0;
        }
        .pm-chip-lbl { font-size: 0.45rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted-2); }
        .pm-chip-val { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; }

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
      {calc && (
        <div className="pro-metrics-bar">
          {/* Score chip */}
          <div
            className="pm-score"
            style={{
              color: scoreColor(calc.score),
              borderColor: `${scoreColor(calc.score)}30`,
              background: `${scoreColor(calc.score)}0e`,
            }}
          >
            <span className="pm-score-dot" style={{ background: scoreColor(calc.score) }} />
            <span className="pm-score-label">{scoreLabel(calc.score)}</span>
            <span className="pm-score-num">{calc.score}/100</span>
          </div>

          {/* EBITDA */}
          <div className="pm-chip">
            <span className="pm-chip-lbl">EBITDA</span>
            <span className="pm-chip-val" style={{ color: calc.ebitda >= 0 ? 'var(--accent)' : 'var(--danger)' }}>
              {fmtCLP(calc.ebitda)}
            </span>
          </div>

          {/* Runway */}
          <div className="pm-chip">
            <span className="pm-chip-lbl">Runway</span>
            <span className="pm-chip-val" style={{ color: !isFinite(calc.runway) || calc.runway > 12 ? 'var(--accent)' : calc.runway > 3 ? 'var(--warning)' : 'var(--danger)' }}>
              {isFinite(calc.runway) ? `${calc.runway.toFixed(1)}m` : '∞'}
            </span>
          </div>

          {/* Margen bruto */}
          <div className="pm-chip">
            <span className="pm-chip-lbl">Margen bruto</span>
            <span className="pm-chip-val" style={{ color: calc.grossMarginPct >= 30 ? 'var(--accent)' : calc.grossMarginPct >= 20 ? 'var(--warning)' : 'var(--danger)' }}>
              {calc.grossMarginPct.toFixed(1)}%
            </span>
          </div>

          {/* Caja */}
          <div className="pm-chip">
            <span className="pm-chip-lbl">Caja</span>
            <span className="pm-chip-val" style={{ color: 'var(--text)' }}>
              {fmtCLP(calc.cashAdjustedStart)}
            </span>
          </div>
        </div>
      )}

      <div className="pro-content">
        {children}
      </div>
    </Layout>
  );
}
