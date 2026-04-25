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
          display: flex; gap: 32px; align-items: center; flex-wrap: wrap;
          padding: 12px 40px;
          border-bottom: 1px solid var(--border);
          background: var(--surface);
        }
        @media(max-width:640px){ .pro-metrics-bar { padding: 12px 20px; gap: 20px; } }
        .pro-metric-item { display: flex; flex-direction: column; gap: 2px; }
        .pro-metric-lbl { font-size: 0.5625rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted-2); }
        .pro-metric-val { font-family: var(--font-display); font-size: 0.9375rem; font-weight: 800; color: var(--text); }
        .pro-score-pill {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 0.75rem; font-weight: 700;
          padding: 3px 10px; border-radius: 99px;
          background: rgba(255,255,255,0.05);
        }
        .pro-score-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }

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
          <div className="pro-score-pill" style={{ color: scoreColor(calc.score), background: `${scoreColor(calc.score)}18` }}>
            <span className="pro-score-dot" style={{ background: scoreColor(calc.score) }} />
            {scoreLabel(calc.score)} · {calc.score}/100
          </div>
          <div className="pro-metric-item">
            <span className="pro-metric-lbl">EBITDA</span>
            <span className="pro-metric-val" style={{ color: calc.ebitda >= 0 ? '#2dd4a0' : '#e85555' }}>{fmtCLP(calc.ebitda)}</span>
          </div>
          <div className="pro-metric-item">
            <span className="pro-metric-lbl">Runway</span>
            <span className="pro-metric-val">{isFinite(calc.runway) ? `${calc.runway.toFixed(1)}m` : '∞'}</span>
          </div>
          <div className="pro-metric-item">
            <span className="pro-metric-lbl">Margen</span>
            <span className="pro-metric-val">{calc.grossMarginPct.toFixed(1)}%</span>
          </div>
        </div>
      )}

      <div className="pro-content">
        {children}
      </div>
    </Layout>
  );
}
