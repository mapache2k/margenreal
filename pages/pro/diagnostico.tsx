'use client';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import ProLayout from '../../lib/ProLayout';
import { usePro } from '../../lib/ProContext';

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};
const fmt = (n: number, d = 1) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: d }).format(n);
const scoreColor = (s: number) => s >= 70 ? '#2dd4a0' : s >= 40 ? '#f0b429' : '#e85555';
const scoreLabel = (s: number) => s >= 70 ? 'Negocio sólido' : s >= 40 ? 'Zona de riesgo' : 'Alerta crítica';
const runwayLabel = (r: number) => !isFinite(r) || r > 999 ? '∞' : `${fmt(r)} m`;
const sensColor = (v: number) => v > 0 ? '#2dd4a0' : v < 0 ? '#e85555' : '#f0b429';

export default function Diagnostico() {
  const router = useRouter();
  const { data, loading } = usePro();

  useEffect(() => {
    if (!loading && !data) router.replace('/pro');
  }, [data, loading]);

  if (!data) return null;

  const { calc, projection, actions, diagnosis } = data;
  const s = calc.score;
  const color = scoreColor(s);

  const cashValues = projection.months.map(m => m.cash);
  const maxCash = Math.max(...cashValues, 1);
  const minCash = Math.min(...cashValues, 0);
  const range = maxCash - minCash || 1;

  const baseFinal = projection.months[projection.months.length - 1]?.cash ?? 0;
  const optFinal = baseFinal + calc.ebitda * 0.1 * 12;
  const stressFinal = baseFinal - Math.abs(calc.ebitda) * 0.1 * 12;

  const actionColor = (type: string) => {
    if (type === 'urgent') return { bg: 'rgba(232,85,85,.08)', border: 'rgba(232,85,85,.25)', dot: '#e85555', tag: 'URGENTE' };
    if (type === 'near_term') return { bg: 'rgba(240,180,41,.08)', border: 'rgba(240,180,41,.25)', dot: '#f0b429', tag: 'IMPORTANTE' };
    return { bg: 'rgba(45,212,160,.08)', border: 'rgba(45,212,160,.25)', dot: '#2dd4a0', tag: 'OPTIMIZAR' };
  };

  return (
    <ProLayout>
      <style>{`
        .page-content { padding: 32px 40px 80px; max-width: 860px; }
        @media(max-width:640px){ .page-content { padding: 24px 20px 60px; } }

        .score-hero {
          display: flex; align-items: center; gap: 20px;
          padding: 20px 24px; border-radius: 16px;
          border: 1px solid transparent; margin-bottom: 20px;
        }
        .score-num-big {
          font-family: var(--font-display); font-size: clamp(2.5rem, 5vw, 3.5rem);
          font-weight: 900; letter-spacing: -0.04em; line-height: 1;
        }
        .score-info { flex: 1; }
        .score-label-big { font-family: var(--font-display); font-size: 1rem; font-weight: 800; margin-bottom: 8px; }
        .score-track { height: 4px; background: var(--border); border-radius: 999px; overflow: hidden; }
        .score-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.16,1,.3,1); }
        .score-sub { font-size: 0.6875rem; color: var(--muted-2); margin-top: 6px; }

        .ai-card {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 14px; padding: 22px; margin-bottom: 16px;
          position: relative; overflow: hidden;
        }
        .ai-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,215,27,.15), transparent);
        }
        .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 16px; }
        .ai-icon {
          width: 30px; height: 30px; border-radius: 7px;
          background: rgba(249,215,27,.08); border: 1px solid rgba(249,215,27,.15);
          display: flex; align-items: center; justify-content: center; font-size: 0.8125rem;
          color: var(--accent);
        }
        .ai-title { font-family: var(--font-display); font-size: 0.875rem; font-weight: 800; color: var(--text); }
        .ai-sub { font-size: 0.6875rem; color: var(--muted-2); }
        .ai-badge {
          margin-left: auto; font-size: 0.5rem; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          background: rgba(249,215,27,.06); border: 1px solid rgba(249,215,27,.12);
          color: var(--muted); padding: 3px 7px; border-radius: 4px;
        }
        .ai-body { font-size: 0.9375rem; color: var(--muted); line-height: 1.85; }
        .ai-body p { margin-bottom: 14px; }
        .ai-body p:last-child { margin-bottom: 0; }

        .metrics-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 12px;
        }
        @media(max-width:480px){ .metrics-grid { grid-template-columns: 1fr; } }
        .m-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 16px;
        }
        .m-card.g { border-color: rgba(45,212,160,.25); background: rgba(45,212,160,.05); }
        .m-card.r { border-color: rgba(232,85,85,.25); background: rgba(232,85,85,.05); }
        .m-card.y { border-color: rgba(240,180,41,.25); background: rgba(240,180,41,.05); }
        .m-card.h { border-color: var(--border); background: var(--surface); }
        .m-lbl { font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 8px; }
        .m-val { font-family: var(--font-display); font-size: clamp(1.25rem,2vw,1.625rem); font-weight: 800; line-height: 1.1; letter-spacing: -0.02em; }
        .m-card.g .m-val { color: #2dd4a0; }
        .m-card.r .m-val { color: #e85555; }
        .m-card.y .m-val { color: #f0b429; }
        .m-card.h .m-val { color: var(--text); }
        .m-sub { font-size: 0.75rem; color: var(--muted-2); margin-top: 6px; line-height: 1.5; }
        .runway-track { height: 3px; background: var(--border); border-radius: 999px; overflow: hidden; margin-top: 8px; }
        .runway-fill { height: 100%; border-radius: 999px; transition: width 1s cubic-bezier(.16,1,.3,1); }

        .section-lbl { font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 10px; }

        .chart-card {
          background: var(--surface); border: 1px solid var(--border);
          border-radius: 12px; padding: 18px; margin-bottom: 12px;
        }
        .proj-chart { display: flex; align-items: flex-end; gap: 3px; height: 80px; margin-top: 12px; }
        .proj-bar-wrap { flex: 1; display: flex; flex-direction: column; align-items: center; gap: 4px; }
        .proj-bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 3px; }
        .proj-bar-l { font-size: 0.5rem; color: var(--muted-2); line-height: 1; }

        .scenario-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
        @media(max-width:480px){ .scenario-grid { grid-template-columns: 1fr; } }
        .sc-card { background: var(--bg); border: 1px solid var(--border); border-radius: 10px; padding: 14px 12px; text-align: center; }
        .sc-card.up { border-color: rgba(45,212,160,.2); background: rgba(45,212,160,.04); }
        .sc-card.down { border-color: rgba(232,85,85,.2); background: rgba(232,85,85,.04); }
        .sc-tag { font-size: 0.5rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 8px; }
        .sc-card.up .sc-tag { color: #2dd4a0; }
        .sc-card.down .sc-tag { color: #e85555; }
        .sc-val { font-family: var(--font-display); font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; color: var(--text); }
        .sc-card.up .sc-val { color: #2dd4a0; }
        .sc-card.down .sc-val { color: #e85555; }
        .sc-sub { font-size: 0.625rem; color: var(--muted-2); margin-top: 4px; }

        .sens-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 12px; }
        @media(max-width:480px){ .sens-grid { grid-template-columns: 1fr; } }
        .sens-card { background: var(--surface); border: 1px solid var(--border); border-radius: 10px; padding: 14px 12px; text-align: center; }
        .sens-lbl { font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted-2); margin-bottom: 8px; }
        .sens-val { font-family: var(--font-display); font-size: 1rem; font-weight: 800; letter-spacing: -0.02em; }
        .sens-sub { font-size: 0.625rem; color: var(--muted-2); margin-top: 4px; }

        .actions-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 18px; margin-bottom: 12px; }
        .actions-title { font-family: var(--font-display); font-size: 0.875rem; font-weight: 800; color: var(--text); margin-bottom: 14px; letter-spacing: -0.02em; }
        .action-item { display: flex; flex-direction: column; gap: 6px; padding: 12px; border-radius: 8px; border: 1px solid transparent; margin-bottom: 8px; }
        .action-item:last-child { margin-bottom: 0; }
        .action-tag { display: inline-flex; align-items: center; gap: 5px; align-self: flex-start; font-size: 0.5rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; padding: 3px 7px; border-radius: 4px; }
        .action-tag-dot { width: 4px; height: 4px; border-radius: 50%; }
        .action-title-text { font-size: 0.875rem; font-weight: 600; color: var(--text); line-height: 1.5; }
        .action-desc { font-size: 0.8125rem; color: var(--muted); line-height: 1.65; }
        .no-actions { display: flex; align-items: center; gap: 10px; padding: 12px 14px; background: rgba(45,212,160,.06); border: 1px solid rgba(45,212,160,.2); border-radius: 8px; font-size: 0.875rem; color: #2dd4a0; }

        .wc-card { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 16px; margin-bottom: 12px; }
        .wc-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
        .wc-item { text-align: center; flex: 1; }
        .wc-val { font-family: var(--font-display); font-size: 1.375rem; font-weight: 800; letter-spacing: -0.02em; }
        .wc-lbl { font-size: 0.5625rem; color: var(--muted-2); margin-top: 4px; text-transform: uppercase; letter-spacing: 0.08em; }
        .wc-div { color: var(--border); font-size: 1rem; }
        .wc-note { font-size: 0.8125rem; color: var(--muted); line-height: 1.6; margin-top: 12px; padding-top: 10px; border-top: 1px solid var(--border); }
      `}</style>

      <div className="page-content">
        <div className="score-hero" style={{ background: `${color}10`, borderColor: `${color}25` }}>
          <div className="score-num-big" style={{ color }}>{s}</div>
          <div className="score-info">
            <div className="score-label-big" style={{ color }}>{scoreLabel(s)}</div>
            <div className="score-track">
              <div className="score-fill" style={{ width: `${s}%`, background: color }} />
            </div>
            <div className="score-sub">Score de salud financiera · {s}/100</div>
          </div>
        </div>

        <div className="ai-card">
          <div className="ai-header">
            <div className="ai-icon">✦</div>
            <div>
              <div className="ai-title">Diagnóstico por IA</div>
              <div className="ai-sub">Análisis personalizado de tu situación</div>
            </div>
            <div className="ai-badge">Claude AI</div>
          </div>
          {diagnosis ? (
            <div className="ai-body">
              {diagnosis.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
            </div>
          ) : (
            <div style={{ color: 'var(--muted-2)', fontSize: '0.875rem' }}>Cargando análisis...</div>
          )}
        </div>

        <div className="metrics-grid">
          <div className={`m-card ${calc.ebitda >= 0 ? 'g' : 'r'}`}>
            <div className="m-lbl">EBITDA mensual</div>
            <div className="m-val">{fmtCLP(calc.ebitda)}</div>
            <div className="m-sub">{calc.ebitda >= 0 ? 'Operación rentable' : 'Pérdida operacional'}</div>
          </div>
          <div className={`m-card ${calc.runway > 12 || !isFinite(calc.runway) ? 'g' : calc.runway > 3 ? 'y' : 'r'}`}>
            <div className="m-lbl">Runway</div>
            <div className="m-val">{runwayLabel(calc.runway)}</div>
            <div className="m-sub">Con caja ajustada</div>
            <div className="runway-track">
              <div className="runway-fill" style={{
                width: `${Math.min(100, isFinite(calc.runway) ? (calc.runway / 24) * 100 : 100)}%`,
                background: calc.runway > 12 || !isFinite(calc.runway) ? '#2dd4a0' : calc.runway > 3 ? '#f0b429' : '#e85555',
              }} />
            </div>
          </div>
          <div className={`m-card ${calc.grossMarginPct >= 30 ? 'g' : calc.grossMarginPct >= 20 ? 'y' : 'r'}`}>
            <div className="m-lbl">Margen bruto</div>
            <div className="m-val">{calc.grossMarginPct.toFixed(1)}%</div>
            <div className="m-sub">{fmtCLP(calc.grossProfit)} / mes</div>
          </div>
          <div className={`m-card ${calc.monthlyNetCashFlow >= 0 ? 'g' : 'r'}`}>
            <div className="m-lbl">Flujo neto mensual</div>
            <div className="m-val">{fmtCLP(calc.monthlyNetCashFlow)}</div>
            <div className="m-sub">Después de deuda</div>
          </div>
          <div className="m-card h">
            <div className="m-lbl">Punto de equilibrio</div>
            <div className="m-val">{isFinite(calc.breakevenRevenue) ? fmtCLP(calc.breakevenRevenue) : '—'}</div>
            <div className="m-sub">{calc.revenueGap && calc.revenueGap > 0 ? `Faltan ${fmtCLP(calc.revenueGap)}` : 'Ya superaste el umbral'}</div>
          </div>
          <div className={`m-card ${calc.wcGapDays <= 0 ? 'g' : calc.wcGapDays <= 15 ? 'y' : 'r'}`}>
            <div className="m-lbl">Brecha capital trabajo</div>
            <div className="m-val">{calc.wcGapDays} días</div>
            <div className="m-sub">{calc.wcGapDays > 0 ? `${fmtCLP(calc.wcCashTied)} atrapados` : 'Ciclo favorable'}</div>
          </div>
        </div>

        <div className="wc-card">
          <div className="section-lbl">Capital de trabajo</div>
          <div className="wc-row">
            <div className="wc-item">
              <div className="wc-val" style={{ color: '#e85555' }}>{calc.arDays}d</div>
              <div className="wc-lbl">Cobrar</div>
            </div>
            <div className="wc-div">→</div>
            <div className="wc-item">
              <div className="wc-val" style={{ color: '#2dd4a0' }}>{calc.apDays}d</div>
              <div className="wc-lbl">Pagar</div>
            </div>
            <div className="wc-div">=</div>
            <div className="wc-item">
              <div className="wc-val" style={{ color: calc.wcGapDays > 0 ? '#f0b429' : '#2dd4a0' }}>{calc.wcGapDays}d</div>
              <div className="wc-lbl">Brecha</div>
            </div>
          </div>
          {calc.wcGapDays > 0 && (
            <div className="wc-note">
              <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.wcCashTied)}</strong> atrapados en el ciclo.
              Tu caja real es <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.cashAdjustedStart)}</strong>, no {fmtCLP(calc.cashOnHand)}.
            </div>
          )}
        </div>

        <div className="chart-card">
          <div className="section-lbl">Proyección de caja — 12 meses</div>
          <div className="proj-chart">
            {projection.months.map((m, i) => {
              const norm = ((m.cash - minCash) / range) * 100;
              const h = Math.max(4, norm * 0.85);
              return (
                <div key={i} className="proj-bar-wrap" title={`Mes ${m.month}: ${fmtCLP(m.cash)}`}>
                  <div className="proj-bar" style={{ height: `${h}%`, background: m.cash >= 0 ? '#2dd4a0' : '#e85555', opacity: 0.85 }} />
                  {(i === 0 || (i + 1) % 3 === 0) && <div className="proj-bar-l">M{m.month}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--muted-2)' }}>Mes 1: {fmtCLP(projection.months[0]?.cash ?? 0)}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--muted-2)' }}>Mes 12: {fmtCLP(baseFinal)}</span>
          </div>
        </div>

        <div className="chart-card">
          <div className="section-lbl">Escenarios — caja al mes 12</div>
          <div className="scenario-grid">
            <div className="sc-card down">
              <div className="sc-tag">↓ Estrés −10%</div>
              <div className="sc-val">{fmtCLP(stressFinal)}</div>
              <div className="sc-sub">Ventas −10%</div>
            </div>
            <div className="sc-card">
              <div className="sc-tag">Base actual</div>
              <div className="sc-val">{fmtCLP(baseFinal)}</div>
              <div className="sc-sub">Sin cambios</div>
            </div>
            <div className="sc-card up">
              <div className="sc-tag">↑ Optimista +10%</div>
              <div className="sc-val">{fmtCLP(optFinal)}</div>
              <div className="sc-sub">Ventas +10%</div>
            </div>
          </div>
        </div>

        <div className="section-lbl">Sensibilidad del EBITDA</div>
        <div className="sens-grid">
          {[
            { lbl: 'Ventas −20%', val: calc.sensitivities.ebitda_minus20 },
            { lbl: 'Ventas −10%', val: calc.sensitivities.ebitda_minus10 },
            { lbl: 'Ventas +10%', val: calc.sensitivities.ebitda_plus10 },
          ].map((s, i) => (
            <div key={i} className="sens-card">
              <div className="sens-lbl">{s.lbl}</div>
              <div className="sens-val" style={{ color: sensColor(s.val) }}>{fmtCLP(s.val)}</div>
              <div className="sens-sub">EBITDA resultante</div>
            </div>
          ))}
        </div>

        <div className="actions-card">
          <div className="actions-title">Plan de acción</div>
          {actions.length === 0 ? (
            <div className="no-actions">✓ Sin alertas críticas. Enfócate en crecer.</div>
          ) : actions.map((a, i) => {
            const c = actionColor(a.type);
            return (
              <div key={i} className="action-item" style={{ background: c.bg, borderColor: c.border }}>
                <div className="action-tag" style={{ background: `${c.dot}15`, color: c.dot }}>
                  <div className="action-tag-dot" style={{ background: c.dot }} />
                  {c.tag}
                </div>
                <div className="action-title-text">{a.title}</div>
                <div className="action-desc">{a.description}</div>
              </div>
            );
          })}
        </div>
      </div>
    </ProLayout>
  );
}
