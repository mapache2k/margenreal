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
          background: var(--bg);
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }
        .pro-subnav-inner {
          display: flex; gap: 4px;
          max-width: 960px;
          padding: 0 40px;
          margin-left: max(0px, calc((100% - var(--section-max)) / 2));
        }
        @media(max-width:640px){ .pro-subnav-inner { padding: 0 20px; margin-left: 0; } }

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
          border-bottom: 1px solid var(--border);
          background: var(--bg);
          overflow-x: auto; -webkit-overflow-scrolling: touch;
          scrollbar-width: none;
        }
        .pro-metrics-bar::-webkit-scrollbar { display: none; }
        .pro-metrics-inner {
          display: flex; align-items: center; gap: 6px;
          max-width: 960px;
          padding: 10px 40px;
          margin-left: max(0px, calc((100% - var(--section-max)) / 2));
        }
        @media(max-width:640px){ .pro-metrics-inner { padding: 10px 20px; margin-left: 0; } }

        .pm-card {
          position: relative; overflow: hidden;
          border-radius: 10px; border: 1px solid var(--border);
          background: var(--surface);
          padding: 9px 14px 9px 18px;
          flex-shrink: 0; min-width: 80px;
        }
        .pm-card::before {
          content: ''; position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 3px; border-radius: 0 2px 2px 0;
          background: var(--border);
        }
        .pm-card.c-highlight { border-color: rgba(249,215,27,.22); background: linear-gradient(135deg,rgba(249,215,27,.06) 0%,var(--surface) 60%); }
        .pm-card.c-highlight::before { background: var(--accent); }
        .pm-card.c-danger { border-color: rgba(239,68,68,.28); background: linear-gradient(135deg,rgba(239,68,68,.07) 0%,var(--surface) 60%); }
        .pm-card.c-danger::before { background: var(--danger); }
        .pm-card.c-warning { border-color: rgba(245,158,11,.22); background: linear-gradient(135deg,rgba(245,158,11,.06) 0%,var(--surface) 60%); }
        .pm-card.c-warning::before { background: var(--warning); }

        .pm-lbl { font-size: 0.4375rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.13em; color: var(--muted-2); margin-bottom: 4px; display: block; }
        .pm-val { font-family: var(--font-display); font-size: 1.0625rem; font-weight: 900; letter-spacing: -0.03em; line-height: 1; display: block; }
        .pm-sub { font-size: 0.5rem; color: var(--muted-2); margin-top: 3px; display: block; }

        .pro-content { padding: 0; }
      `}</style>

      {/* Step tabs */}
      <div className="pro-subnav"><div className="pro-subnav-inner">
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
      </div></div>

      {/* Metrics bar — only when data exists */}
      {calc && (() => {
        const col = scoreColor(calc.score);
        const scoreVariant = calc.score >= 70 ? 'c-highlight' : calc.score >= 40 ? 'c-warning' : 'c-danger';
        const ebitdaV  = calc.ebitda >= 0 ? 'c-highlight' : 'c-danger';
        const runwayV  = !isFinite(calc.runway) || calc.runway > 12 ? 'c-highlight' : calc.runway > 3 ? 'c-warning' : 'c-danger';
        const margenV  = calc.grossMarginPct >= 30 ? 'c-highlight' : calc.grossMarginPct >= 20 ? 'c-warning' : 'c-danger';
        const flujoV   = calc.monthlyNetCashFlow >= 0 ? 'c-highlight' : 'c-danger';
        const colVal   = (v: string) => v === 'c-highlight' ? 'var(--accent)' : v === 'c-danger' ? 'var(--danger)' : 'var(--warning)';
        return (
          <div className="pro-metrics-bar"><div className="pro-metrics-inner">
            {/* Score */}
            <div className={`pm-card ${scoreVariant}`} style={{ minWidth: 110 }}>
              <span className="pm-lbl">Score de salud</span>
              <span className="pm-val" style={{ color: col }}>{scoreLabel(calc.score)}</span>
              <span className="pm-sub">{calc.score}/100</span>
            </div>
            {/* EBITDA */}
            <div className={`pm-card ${ebitdaV}`}>
              <span className="pm-lbl">EBITDA</span>
              <span className="pm-val" style={{ color: colVal(ebitdaV) }}>{fmtCLP(calc.ebitda)}</span>
              <span className="pm-sub">{calc.ebitda >= 0 ? 'Rentable' : 'Pérdida'}</span>
            </div>
            {/* Runway */}
            <div className={`pm-card ${runwayV}`}>
              <span className="pm-lbl">Runway</span>
              <span className="pm-val" style={{ color: colVal(runwayV) }}>{isFinite(calc.runway) ? `${calc.runway.toFixed(1)}m` : '∞'}</span>
              <span className="pm-sub">Meses de caja</span>
            </div>
            {/* Margen */}
            <div className={`pm-card ${margenV}`}>
              <span className="pm-lbl">Margen bruto</span>
              <span className="pm-val" style={{ color: colVal(margenV) }}>{calc.grossMarginPct.toFixed(1)}%</span>
              <span className="pm-sub">{fmtCLP(calc.grossProfit)}/mes</span>
            </div>
            {/* Caja */}
            <div className="pm-card">
              <span className="pm-lbl">Caja</span>
              <span className="pm-val" style={{ color: 'var(--text)' }}>{fmtCLP(calc.cashAdjustedStart)}</span>
              <span className="pm-sub">Ajustada por ciclo</span>
            </div>
            {/* Flujo neto */}
            <div className={`pm-card ${flujoV}`}>
              <span className="pm-lbl">Flujo neto</span>
              <span className="pm-val" style={{ color: colVal(flujoV) }}>{fmtCLP(calc.monthlyNetCashFlow)}</span>
              <span className="pm-sub">Después de deuda</span>
            </div>
          </div></div>
        );
      })()}

      <div className="pro-content">
        {children}
      </div>
    </Layout>
  );
}
