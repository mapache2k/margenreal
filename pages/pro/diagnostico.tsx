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
const scoreColor = (s: number) => s >= 70 ? '#f9d71b' : s >= 40 ? '#f0b429' : '#ef4444';
const scoreLabel = (s: number) => s >= 70 ? 'Negocio sólido' : s >= 40 ? 'Zona de riesgo' : 'Alerta crítica';
const runwayLabel = (r: number) => !isFinite(r) || r > 999 ? '∞' : `${fmt(r)} m`;

type KpiVariant = 'highlight' | 'danger' | 'warning' | 'neutral';

const badgeText: Record<KpiVariant, string> = {
  highlight: '● Saludable',
  danger:    '● Crítico',
  warning:   '● Riesgo',
  neutral:   '— Neutro',
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

  const baseFinal   = projection.months[projection.months.length - 1]?.cash ?? 0;
  const optFinal    = baseFinal + calc.ebitda * 0.1 * 12;
  const stressFinal = baseFinal - Math.abs(calc.ebitda) * 0.1 * 12;

  const actionColor = (type: string) => {
    if (type === 'urgent')    return { bg: 'rgba(239,68,68,.07)',  border: 'rgba(239,68,68,.22)',  dot: '#ef4444', tag: 'URGENTE' };
    if (type === 'near_term') return { bg: 'rgba(245,158,11,.07)', border: 'rgba(245,158,11,.22)', dot: '#f0b429', tag: 'IMPORTANTE' };
    return                           { bg: 'rgba(249,215,27,.05)', border: 'rgba(249,215,27,.18)', dot: '#f9d71b', tag: 'OPTIMIZAR' };
  };

  const MetricCard = ({ label, value, sub, variant, extra }: {
    label: string; value: string; sub?: string; variant: KpiVariant; extra?: React.ReactNode;
  }) => (
    <div className={`pro-kpi kpi-${variant}`}>
      <div className="kpi-head">
        <div className="kpi-label">{label}</div>
        <span className={`kpi-badge kpi-badge-${variant}`}>{badgeText[variant]}</span>
      </div>
      <div className={`kpi-val kpi-val-${variant}`}>{value}</div>
      {sub && <div className="kpi-sub">{sub}</div>}
      {extra && <div style={{ marginTop: 10 }}>{extra}</div>}
    </div>
  );

  return (
    <ProLayout>
      <style>{`
        /* ── Pro KPI card system ─────────────────────────────── */
        .pro-kpi {
          position:relative; overflow:hidden;
          border-radius:14px; border:1px solid var(--border);
          background:var(--surface);
          padding:16px 18px 16px 22px;
          transition:border-color .2s,box-shadow .2s;
        }
        .pro-kpi::before {
          content:''; position:absolute;
          left:0; top:14px; bottom:14px;
          width:3px; border-radius:0 2px 2px 0;
          background:var(--border);
        }
        .kpi-highlight { border-color:rgba(249,215,27,.22); background:linear-gradient(135deg,rgba(249,215,27,.06) 0%,var(--surface) 55%); }
        .kpi-highlight::before { background:var(--accent); }
        .kpi-danger    { border-color:rgba(239,68,68,.28); background:linear-gradient(135deg,rgba(239,68,68,.07) 0%,var(--surface) 55%); }
        .kpi-danger::before    { background:var(--danger); }
        .kpi-warning   { border-color:rgba(245,158,11,.22); background:linear-gradient(135deg,rgba(245,158,11,.06) 0%,var(--surface) 55%); }
        .kpi-warning::before   { background:var(--warning); }
        .kpi-neutral::before   { background:var(--border); }

        .kpi-head  { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
        .kpi-label { font-size:.5625rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted-2); }
        .kpi-badge { font-size:.45rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:2px 7px; border-radius:4px; white-space:nowrap; }
        .kpi-badge-highlight { color:var(--accent);   background:rgba(249,215,27,.08); border:1px solid rgba(249,215,27,.2); }
        .kpi-badge-danger    { color:var(--danger);   background:rgba(239,68,68,.07);  border:1px solid rgba(239,68,68,.22); }
        .kpi-badge-warning   { color:var(--warning);  background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.22); }
        .kpi-badge-neutral   { color:var(--muted-2);  background:rgba(255,255,255,.02);border:1px solid var(--border); }

        .kpi-val { font-family:var(--font-display); font-size:1.75rem; font-weight:900; letter-spacing:-.04em; line-height:1; margin-bottom:5px; }
        .kpi-val-highlight { color:var(--accent); }
        .kpi-val-danger    { color:var(--danger); }
        .kpi-val-warning   { color:var(--warning); }
        .kpi-val-neutral   { color:var(--text); }
        .kpi-sub { font-size:.6875rem; color:var(--muted-2); line-height:1.4; }

        /* ── Runway bar ───────────────────────────────────────── */
        .runway-track { height:3px; background:var(--border); border-radius:999px; overflow:hidden; }
        .runway-fill  { height:100%; border-radius:999px; transition:width 1s cubic-bezier(.16,1,.3,1); }

        /* ── Score hero ───────────────────────────────────────── */
        .score-hero    { display:flex; align-items:center; gap:20px; padding:20px 24px; border-radius:16px; border:1px solid transparent; margin-bottom:20px; }
        .score-num-big { font-family:var(--font-display); font-size:clamp(2.5rem,5vw,3.5rem); font-weight:900; letter-spacing:-.04em; line-height:1; }
        .score-info    { flex:1; }
        .score-lbl     { font-family:var(--font-display); font-size:1rem; font-weight:800; margin-bottom:8px; }
        .score-track   { height:4px; background:var(--border); border-radius:999px; overflow:hidden; }
        .score-fill    { height:100%; border-radius:999px; transition:width 1s cubic-bezier(.16,1,.3,1); }
        .score-sub     { font-size:.6875rem; color:var(--muted-2); margin-top:6px; }

        /* ── Projection chart ─────────────────────────────────── */
        .proj-chart { display:flex; align-items:flex-end; gap:3px; height:80px; margin-top:12px; }
        .proj-col   { flex:1; display:flex; flex-direction:column; align-items:center; gap:4px; }
        .proj-bar   { width:100%; border-radius:2px 2px 0 0; min-height:3px; }
        .proj-lbl   { font-size:.5rem; color:var(--muted-2); line-height:1; }

        /* ── Scenario cards ───────────────────────────────────── */
        .sc-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-top:10px; }
        @media(max-width:480px){ .sc-grid { grid-template-columns:1fr; } }
        .sc-card { border-radius:12px; padding:16px 14px; text-align:center; border:1px solid var(--border); background:var(--bg); }
        .sc-tag  { font-size:.5rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; color:var(--muted-2); margin-bottom:10px; }
        .sc-val  { font-family:var(--font-display); font-size:1.125rem; font-weight:900; letter-spacing:-.03em; color:var(--text); }
        .sc-sub  { font-size:.625rem; color:var(--muted-2); margin-top:5px; }

        /* ── Sensitivity grid ─────────────────────────────────── */
        .sens-grid { display:grid; grid-template-columns:1fr 1fr 1fr; gap:8px; margin-bottom:12px; }
        @media(max-width:480px){ .sens-grid { grid-template-columns:1fr; } }

        /* ── Action plan ──────────────────────────────────────── */
        .action-item  { display:flex; flex-direction:column; gap:6px; padding:14px; border-radius:10px; border:1px solid transparent; margin-bottom:8px; }
        .action-item:last-child { margin-bottom:0; }
        .action-tag   { display:inline-flex; align-items:center; gap:5px; align-self:flex-start; font-size:.5rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; padding:3px 8px; border-radius:4px; }
        .action-dot   { width:4px; height:4px; border-radius:50%; flex-shrink:0; }
        .action-title { font-size:.875rem; font-weight:700; color:var(--text); line-height:1.5; }
        .action-desc  { font-size:.8125rem; color:var(--muted); line-height:1.65; }

        /* ── Working capital flow ─────────────────────────────── */
        .wc-flow { display:grid; grid-template-columns:1fr auto 1fr auto 1fr; align-items:center; gap:8px; margin-top:12px; }
        @media(max-width:480px){ .wc-flow { grid-template-columns:1fr; gap:4px; } }
        .wc-flow-arrow { color:var(--muted-2); font-size:.875rem; text-align:center; padding:0 2px; }
        @media(max-width:480px){ .wc-flow-arrow { display:none; } }
        .wc-box { text-align:center; padding:14px 12px; border-radius:12px; border:1px solid var(--border); }
        .wc-box-lbl  { font-size:.5rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; margin-bottom:8px; }
        .wc-box-val  { font-family:var(--font-display); font-size:1.625rem; font-weight:900; letter-spacing:-.04em; line-height:1; }
        .wc-box-sub  { font-size:.6rem; color:var(--muted-2); margin-top:5px; }
      `}</style>

      <div className="home-content">

        {/* Score hero */}
        <div className="score-hero" style={{ background: `${col}12`, borderColor: `${col}28` }}>
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
        <div className="diag-card" style={{ position: 'relative', overflow: 'hidden', marginBottom: 20 }}>
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

        {/* KPI Metric cards */}
        <div className="metrics-grid" style={{ marginBottom: 16 }}>
          <MetricCard
            label="EBITDA mensual"
            value={fmtCLP(calc.ebitda)}
            sub={calc.ebitda >= 0 ? 'Operación rentable' : 'Pérdida operacional'}
            variant={calc.ebitda >= 0 ? 'highlight' : 'danger'}
          />
          <MetricCard
            label="Runway"
            value={runwayLabel(calc.runway)}
            sub="Con caja ajustada"
            variant={calc.runway > 12 || !isFinite(calc.runway) ? 'highlight' : calc.runway > 3 ? 'warning' : 'danger'}
            extra={
              <div className="runway-track">
                <div className="runway-fill" style={{
                  width: `${Math.min(100, isFinite(calc.runway) ? (calc.runway / 24) * 100 : 100)}%`,
                  background: calc.runway > 12 || !isFinite(calc.runway) ? 'var(--accent)' : calc.runway > 3 ? 'var(--warning)' : 'var(--danger)',
                }} />
              </div>
            }
          />
          <MetricCard
            label="Margen bruto"
            value={`${calc.grossMarginPct.toFixed(1)}%`}
            sub={`${fmtCLP(calc.grossProfit)} / mes`}
            variant={calc.grossMarginPct >= 30 ? 'highlight' : calc.grossMarginPct >= 20 ? 'warning' : 'danger'}
          />
          <MetricCard
            label="Flujo neto mensual"
            value={fmtCLP(calc.monthlyNetCashFlow)}
            sub="Después de deuda"
            variant={calc.monthlyNetCashFlow >= 0 ? 'highlight' : 'danger'}
          />
          <MetricCard
            label="Punto de equilibrio"
            value={isFinite(calc.breakevenRevenue) ? fmtCLP(calc.breakevenRevenue) : '—'}
            sub={calc.revenueGap && calc.revenueGap > 0 ? `Faltan ${fmtCLP(calc.revenueGap)}` : 'Ya superaste el umbral'}
            variant="neutral"
          />
          <MetricCard
            label="Brecha capital trabajo"
            value={`${calc.wcGapDays} días`}
            sub={calc.wcGapDays > 0 ? `${fmtCLP(calc.wcCashTied)} atrapados` : 'Ciclo favorable'}
            variant={calc.wcGapDays <= 0 ? 'highlight' : calc.wcGapDays <= 15 ? 'warning' : 'danger'}
          />
        </div>

        {/* Working capital — flow diagram */}
        <div className="chart-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div className="chart-lbl" style={{ margin: 0 }}>Ciclo de capital de trabajo</div>
            <span style={{
              fontSize: '0.5rem', fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
              padding: '3px 9px', borderRadius: 5, whiteSpace: 'nowrap',
              color: calc.wcGapDays > 0 ? 'var(--warning)' : 'var(--accent)',
              background: calc.wcGapDays > 0 ? 'rgba(245,158,11,.08)' : 'rgba(249,215,27,.08)',
              border: `1px solid ${calc.wcGapDays > 0 ? 'rgba(245,158,11,.22)' : 'rgba(249,215,27,.2)'}`,
            }}>
              {calc.wcGapDays > 0 ? `${calc.wcGapDays}d financiado` : '✓ Favorable'}
            </span>
          </div>
          <div className="wc-flow">
            <div className="wc-box" style={{ background: 'rgba(239,68,68,.05)', borderColor: 'rgba(239,68,68,.2)' }}>
              <div className="wc-box-lbl" style={{ color: 'var(--danger)' }}>DSO — Cobrar</div>
              <div className="wc-box-val" style={{ color: 'var(--danger)' }}>{calc.arDays}d</div>
              <div className="wc-box-sub">Días promedio para cobrar</div>
            </div>
            <div className="wc-flow-arrow">→</div>
            <div className="wc-box" style={{ background: 'rgba(249,215,27,.04)', borderColor: 'rgba(249,215,27,.15)' }}>
              <div className="wc-box-lbl" style={{ color: 'var(--accent)' }}>DPO — Pagar</div>
              <div className="wc-box-val" style={{ color: 'var(--accent)' }}>{calc.apDays}d</div>
              <div className="wc-box-sub">Días promedio para pagar</div>
            </div>
            <div className="wc-flow-arrow">=</div>
            <div className="wc-box" style={{
              background: calc.wcGapDays > 0 ? 'rgba(245,158,11,.05)' : 'rgba(249,215,27,.04)',
              borderColor: calc.wcGapDays > 0 ? 'rgba(245,158,11,.22)' : 'rgba(249,215,27,.15)',
            }}>
              <div className="wc-box-lbl" style={{ color: calc.wcGapDays > 0 ? 'var(--warning)' : 'var(--accent)' }}>Brecha neta</div>
              <div className="wc-box-val" style={{ color: calc.wcGapDays > 0 ? 'var(--warning)' : 'var(--accent)' }}>{calc.wcGapDays}d</div>
              <div className="wc-box-sub">{calc.wcGapDays > 0 ? 'Días que financias' : 'Ciclo favorable'}</div>
            </div>
          </div>
          {calc.wcGapDays > 0 && (
            <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(245,158,11,.04)', border: '1px solid rgba(245,158,11,.14)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.65 }}>
              <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.wcCashTied)}</strong> atrapados en el ciclo. Tu caja real es{' '}
              <strong style={{ color: 'var(--text)' }}>{fmtCLP(calc.cashAdjustedStart)}</strong>, no {fmtCLP(calc.cashOnHand)}.
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
                  <div className="proj-bar" style={{ height: `${h}%`, background: m.cash >= 0 ? 'var(--accent)' : 'var(--danger)', opacity: 0.85 }} />
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
            <div className="sc-card" style={{ borderColor: 'rgba(239,68,68,.22)', background: 'rgba(239,68,68,.05)' }}>
              <div className="sc-tag" style={{ color: 'var(--danger)' }}>↓ Estrés −10%</div>
              <div className="sc-val" style={{ color: 'var(--danger)' }}>{fmtCLP(stressFinal)}</div>
              <div className="sc-sub">Ventas −10%</div>
            </div>
            <div className="sc-card">
              <div className="sc-tag">Base actual</div>
              <div className="sc-val">{fmtCLP(baseFinal)}</div>
              <div className="sc-sub">Sin cambios</div>
            </div>
            <div className="sc-card" style={{ borderColor: 'rgba(249,215,27,.22)', background: 'rgba(249,215,27,.05)' }}>
              <div className="sc-tag" style={{ color: 'var(--accent)' }}>↑ Optimista +10%</div>
              <div className="sc-val" style={{ color: 'var(--accent)' }}>{fmtCLP(optFinal)}</div>
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
          ].map((item, i) => {
            const sv: KpiVariant = item.val > 0 ? 'highlight' : item.val < 0 ? 'danger' : 'warning';
            return (
              <div key={i} className={`pro-kpi kpi-${sv}`} style={{ textAlign: 'center' }}>
                <div className="kpi-label" style={{ marginBottom: 8, display: 'block' }}>{item.lbl}</div>
                <div className={`kpi-val kpi-val-${sv}`} style={{ fontSize: '1.25rem' }}>{fmtCLP(item.val)}</div>
                <div className="kpi-sub" style={{ marginTop: 4 }}>EBITDA resultante</div>
              </div>
            );
          })}
        </div>

        {/* Action plan */}
        <div className="form-card">
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)', marginBottom: 14, letterSpacing: '-0.02em' }}>Plan de acción</div>
          {actions.length === 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', background: 'rgba(249,215,27,.06)', border: '1px solid rgba(249,215,27,.15)', borderRadius: 8, fontSize: '0.875rem', color: 'var(--accent)' }}>✓ Sin alertas críticas. Enfócate en crecer.</div>
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
