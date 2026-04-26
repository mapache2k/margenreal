'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePro } from '../../lib/ProContext';

const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

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

const cardColor = (variant: 'g' | 'r' | 'y' | 'n') => {
  if (variant === 'g') return { border: 'rgba(45,212,160,.3)', bg: 'rgba(45,212,160,.05)', val: '#2dd4a0' };
  if (variant === 'r') return { border: 'rgba(232,85,85,.3)', bg: 'rgba(232,85,85,.05)', val: '#e85555' };
  if (variant === 'y') return { border: 'rgba(240,180,41,.3)', bg: 'rgba(240,180,41,.05)', val: '#f0b429' };
  return { border: 'var(--border)', bg: 'var(--surface)', val: 'var(--text)' };
};

export default function Diagnostico() {
  const router = useRouter();
  const { data, loading } = usePro();

  useEffect(() => {
    if (!loading && !data) router.replace('/pro');
  }, [data, loading]);

  if (!data) return null;

  const { calc, projection, actions, diagnosis } = data;
  const s = calc.score;
  const col = scoreColor(s);

  const cashValues = projection.months.map(m => m.cash);
  const maxCash = Math.max(...cashValues, 1);
  const minCash = Math.min(...cashValues, 0);
  const range = maxCash - minCash || 1;

  const baseFinal = projection.months[projection.months.length - 1]?.cash ?? 0;
  const optFinal = baseFinal + calc.ebitda * 0.1 * 12;
  const stressFinal = baseFinal - Math.abs(calc.ebitda) * 0.1 * 12;

  const actionColor = (type: string) => {
    if (type === 'urgent')    return { bg: 'rgba(232,85,85,.08)', border: 'rgba(232,85,85,.25)', dot: '#e85555', tag: 'URGENTE' };
    if (type === 'near_term') return { bg: 'rgba(240,180,41,.08)', border: 'rgba(240,180,41,.25)', dot: '#f0b429', tag: 'IMPORTANTE' };
    return { bg: 'rgba(45,212,160,.08)', border: 'rgba(45,212,160,.25)', dot: '#2dd4a0', tag: 'OPTIMIZAR' };
  };

  const MetricCard = ({ label, value, sub, variant, extra }: { label: string; value: string; sub?: string; variant: 'g'|'r'|'y'|'n'; extra?: React.ReactNode }) => {
    const c = cardColor(variant);
    return (
      <div className="metric-card" style={{ borderColor: c.border, background: c.bg }}>
        <div className="metric-lbl">{label}</div>
        <span className="metric-val" style={{ color: c.val }}>{value}</span>
        {sub && <div className="metric-sub">{sub}</div>}
        {extra}
      </div>
    );
  };

  return (
    <ProLayout>
      <style>{`
        .score-hero { display:flex; align-items:center; gap:20px; padding:20px 24px; border-radius:16px; border:1px solid transparent; margin-bottom:20px; }
        .score-num-big { font-family:var(--font-display); font-size:clamp(2.5rem,5vw,3.5rem); font-weight:900; letter-spacing:-0.04em; line-height:1; }
        .score-info { flex:1; }
        .score-lbl { font-family:var(--font-display); font-size:1rem; font-weight:800; margin-bottom:8px; }
        .score-track { height:4px; background:var(--border); border-radius:999px; overflow:hidden; }
        .score-fill { height:100%; border-radius:999px; transition:width 1s cubic-bezier(.16,1,.3,1); }
        .score-sub { font-size:0.6875rem; color:var(--muted-2); margin-top:6px; }
        .proj-chart { display:flex; align-items:flex-end; gap:3px; height:80px; margin-top:12px; }
        .proj-col { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .proj-bar { width:100%; border-radius:2px 2px 0 0; min-height:3px; }
        .proj-lbl { font-size:0.5rem; color:var(--muted-2); line-height:1; }
        .sc-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
        @media(max-width:480px){ .sc-grid { grid-template-columns:1fr; } }
        .sc-card { background:var(--bg); border:1px solid var(--border); border-radius:10px; padding:14px 12px; text-align:center; }
        .sc-tag { font-size:0.5rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:var(--muted-2); margin-bottom:8px; }
        .sc-val { font-family:var(--font-display); font-size:1rem; font-weight:800; letter-spacing:-0.02em; color:var(--text); }
        .sc-sub { font-size:0.625rem; color:var(--muted-2); margin-top:4px; }
        .sens-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; }
        @media(max-width:480px){ .sens-grid { grid-template-columns:1fr; } }
        .action-item { display:flex; flex-direction:column; gap:6px; padding:12px; border-radius:8px; border:1px solid transparent; margin-bottom:8px; }
        .action-item:last-child { margin-bottom:0; }
        .action-tag { display:inline-flex; align-items:center; gap:5px; align-self:flex-start; font-size:0.5rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; padding:3px 7px; border-radius:4px; }
        .action-dot { width:4px; height:4px; border-radius:50%; }
        .action-title { font-size:0.875rem; font-weight:600; color:var(--text); line-height:1.5; }
        .action-desc { font-size:0.8125rem; color:var(--muted); line-height:1.65; }
        .wc-row { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-top:12px; }
        .wc-item { text-align:center; flex:1; }
        .wc-val { font-family:var(--font-display); font-size:1.375rem; font-weight:800; letter-spacing:-0.02em; }
        .wc-lbl { font-size:0.5625rem; color:var(--muted-2); margin-top:4px; text-transform:uppercase; letter-spacing:0.08em; }
        .wc-div { color:var(--border); font-size:1rem; }
        .runway-track { height:3px; background:var(--border); border-radius:999px; overflow:hidden; margin-top:8px; }
        .runway-fill { height:100%; border-radius:999px; transition:width 1s cubic-bezier(.16,1,.3,1); }
      `}</style>

      <div className="home-content">

        {/* Score hero */}
        <div className="score-hero" style={{ background: `${col}10`, borderColor: `${col}25` }}>
          <div className="score-num-big" style={{ color: col }}>{s}</div>
          <div className="score-info">
            <div className="score-lbl" style={{ color: col }}>{scoreLabel(s)}</div>
            <div className="score-track">
              <div className="score-fill" style={{ width: `${s}%`, background: col }} />
            </div>
            <div className="score-sub">Score de salud financiera · {s}/100</div>
          </div>
        </div>

        {/* AI diagnosis */}
        <div className="diag-card" style={{ position: 'relative', overflow: 'hidden', marginBottom: 16 }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,215,27,.2),transparent)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'rgba(249,215,27,.08)', border: '1px solid rgba(249,215,27,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '0.8125rem' }}>✦</div>
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)' }}>Diagnóstico por IA</div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-2)' }}>Análisis personalizado de tu situación</div>
            </div>
            <div style={{ marginLeft: 'auto', fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', background: 'rgba(249,215,27,.06)', border: '1px solid rgba(249,215,27,.12)', color: 'var(--muted)', padding: '3px 7px', borderRadius: 4 }}>Claude AI</div>
          </div>
          {diagnosis ? (
            <div style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.85 }}>
              {diagnosis.split('\n\n').map((p, i) => <p key={i} style={{ margin: '0 0 14px' }}>{p}</p>)}
            </div>
          ) : (
            <div style={{ color: 'var(--muted-2)', fontSize: '0.875rem' }}>Cargando análisis...</div>
          )}
        </div>

        {/* Metric cards */}
        <div className="metrics-grid">
          <MetricCard label="EBITDA mensual" value={fmtCLP(calc.ebitda)} sub={calc.ebitda >= 0 ? 'Operación rentable' : 'Pérdida operacional'} variant={calc.ebitda >= 0 ? 'g' : 'r'} />
          <MetricCard
            label="Runway" value={runwayLabel(calc.runway)} sub="Con caja ajustada" variant={calc.runway > 12 || !isFinite(calc.runway) ? 'g' : calc.runway > 3 ? 'y' : 'r'}
            extra={
              <div className="runway-track">
                <div className="runway-fill" style={{ width: `${Math.min(100, isFinite(calc.runway) ? (calc.runway/24)*100 : 100)}%`, background: calc.runway > 12 || !isFinite(calc.runway) ? '#2dd4a0' : calc.runway > 3 ? '#f0b429' : '#e85555' }} />
              </div>
            }
          />
          <MetricCard label="Margen bruto" value={`${calc.grossMarginPct.toFixed(1)}%`} sub={`${fmtCLP(calc.grossProfit)} / mes`} variant={calc.grossMarginPct >= 30 ? 'g' : calc.grossMarginPct >= 20 ? 'y' : 'r'} />
          <MetricCard label="Flujo neto mensual" value={fmtCLP(calc.monthlyNetCashFlow)} sub="Después de deuda" variant={calc.monthlyNetCashFlow >= 0 ? 'g' : 'r'} />
          <MetricCard label="Punto de equilibrio" value={isFinite(calc.breakevenRevenue) ? fmtCLP(calc.breakevenRevenue) : '—'} sub={calc.revenueGap && calc.revenueGap > 0 ? `Faltan ${fmtCLP(calc.revenueGap)}` : 'Ya superaste el umbral'} variant="n" />
          <MetricCard label="Brecha capital trabajo" value={`${calc.wcGapDays} días`} sub={calc.wcGapDays > 0 ? `${fmtCLP(calc.wcCashTied)} atrapados` : 'Ciclo favorable'} variant={calc.wcGapDays <= 0 ? 'g' : calc.wcGapDays <= 15 ? 'y' : 'r'} />
        </div>

        {/* Working capital */}
        <div className="chart-card">
          <div className="chart-lbl">Capital de trabajo</div>
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
            <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.6, marginTop: 12, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
              <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.wcCashTied)}</strong> atrapados en el ciclo.
              Tu caja real es <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.cashAdjustedStart)}</strong>, no {fmtCLP(calc.cashOnHand)}.
            </div>
          )}
        </div>

        {/* Cash projection chart */}
        <div className="chart-card">
          <div className="chart-lbl">Proyección de caja — 12 meses</div>
          <div className="proj-chart">
            {projection.months.map((m, i) => {
              const norm = ((m.cash - minCash) / range) * 100;
              const h = Math.max(4, norm * 0.85);
              return (
                <div key={i} className="proj-col" title={`Mes ${m.month}: ${fmtCLP(m.cash)}`}>
                  <div className="proj-bar" style={{ height: `${h}%`, background: m.cash >= 0 ? '#2dd4a0' : '#e85555', opacity: 0.85 }} />
                  {(i === 0 || (i + 1) % 3 === 0) && <div className="proj-lbl">M{m.month}</div>}
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--muted-2)' }}>Mes 1: {fmtCLP(projection.months[0]?.cash ?? 0)}</span>
            <span style={{ fontSize: '0.625rem', color: 'var(--muted-2)' }}>Mes 12: {fmtCLP(baseFinal)}</span>
          </div>
        </div>

        {/* Scenarios */}
        <div className="chart-card">
          <div className="chart-lbl">Escenarios — caja al mes 12</div>
          <div className="sc-grid">
            <div className="sc-card" style={{ borderColor: 'rgba(232,85,85,.2)', background: 'rgba(232,85,85,.04)' }}>
              <div className="sc-tag" style={{ color: '#e85555' }}>↓ Estrés −10%</div>
              <div className="sc-val" style={{ color: '#e85555' }}>{fmtCLP(stressFinal)}</div>
              <div className="sc-sub">Ventas −10%</div>
            </div>
            <div className="sc-card">
              <div className="sc-tag">Base actual</div>
              <div className="sc-val">{fmtCLP(baseFinal)}</div>
              <div className="sc-sub">Sin cambios</div>
            </div>
            <div className="sc-card" style={{ borderColor: 'rgba(45,212,160,.2)', background: 'rgba(45,212,160,.04)' }}>
              <div className="sc-tag" style={{ color: '#2dd4a0' }}>↑ Optimista +10%</div>
              <div className="sc-val" style={{ color: '#2dd4a0' }}>{fmtCLP(optFinal)}</div>
              <div className="sc-sub">Ventas +10%</div>
            </div>
          </div>
        </div>

        {/* Sensitivity */}
        <div className="chart-lbl" style={{ marginBottom: 10 }}>Sensibilidad del EBITDA</div>
        <div className="sens-grid">
          {[
            { lbl: 'Ventas −20%', val: calc.sensitivities.ebitda_minus20 },
            { lbl: 'Ventas −10%', val: calc.sensitivities.ebitda_minus10 },
            { lbl: 'Ventas +10%', val: calc.sensitivities.ebitda_plus10 },
          ].map((item, i) => (
            <div key={i} className="metric-card" style={{ textAlign: 'center' }}>
              <div className="metric-lbl">{item.lbl}</div>
              <span className="metric-val" style={{ color: sensColor(item.val) }}>{fmtCLP(item.val)}</span>
              <div className="metric-sub">EBITDA resultante</div>
            </div>
          ))}
        </div>

        {/* Action plan */}
        <div className="form-card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>Plan de acción</div>
          {actions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(45,212,160,.06)', border: '1px solid rgba(45,212,160,.2)', borderRadius: 8, fontSize: '0.875rem', color: '#2dd4a0' }}>✓ Sin alertas críticas. Enfócate en crecer.</div>
          ) : actions.map((a, i) => {
            const c = actionColor(a.type);
            return (
              <div key={i} className="action-item" style={{ background: c.bg, borderColor: c.border }}>
                <div className="action-tag" style={{ background: `${c.dot}15`, color: c.dot }}>
                  <div className="action-dot" style={{ background: c.dot }} />{c.tag}
                </div>
                <div className="action-title">{a.title}</div>
                <div className="action-desc">{a.description}</div>
              </div>
            );
          })}
        </div>

      </div>
    </ProLayout>
  );
}
