'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePro } from '../../lib/ProContext';

const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};

type ForecastPoint = { month: number; label: string; revenue: number; ebitda: number; cash: number };
type Assumptions   = { monthlyGrowth: string; fixedCostChange: string; oneOffMonth: string; oneOffAmount: string; horizon: '3'|'6'|'12'|'24' };

function buildForecast(calc: any, assumptions: Assumptions): ForecastPoint[] {
  const months      = parseInt(assumptions.horizon);
  const growth      = parseFloat(assumptions.monthlyGrowth) / 100 || 0;
  const fixedDelta  = parseFloat(assumptions.fixedCostChange) || 0;
  const oneOffMonth = parseInt(assumptions.oneOffMonth) || 0;
  const oneOffAmount = parseFloat(assumptions.oneOffAmount) || 0;
  let cash = calc.cashAdjustedStart;
  let revenue = calc.revenue;
  const points: ForecastPoint[] = [];
  const monthLabels = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  for (let m = 1; m <= months; m++) {
    revenue = revenue * (1 + growth);
    const fixed = calc.fixedCosts + fixedDelta;
    const gross = revenue * calc.contributionMarginPct;
    const ebitda = gross - fixed;
    const net = ebitda - calc.monthlyDebtPayment;
    const oneOff = m === oneOffMonth ? oneOffAmount : 0;
    cash += net + oneOff;
    points.push({ month: m, label: monthLabels[(m-1)%12], revenue, ebitda, cash });
  }
  return points;
}

export default function Forecast() {
  const router = useRouter();
  const { data, loading } = usePro();
  const [assumptions, setAssumptions] = useState<Assumptions>({ monthlyGrowth: '2', fixedCostChange: '0', oneOffMonth: '', oneOffAmount: '', horizon: '12' });
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [aiText, setAiText]     = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!loading && !data) router.replace('/pro');
  }, [data, loading]);

  useEffect(() => {
    if (data?.calc) setForecast(buildForecast(data.calc, assumptions));
  }, [data, assumptions]);

  if (!data) return null;
  const { calc } = data;

  const setA = (k: keyof Assumptions) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAssumptions(prev => ({ ...prev, [k]: e.target.value as any }));

  const maxCash = Math.max(...forecast.map(p => p.cash), 1);
  const minCash = Math.min(...forecast.map(p => p.cash), 0);
  const range   = maxCash - minCash || 1;
  const lastPoint     = forecast[forecast.length - 1];
  const firstNegative = forecast.find(p => p.cash < 0);

  const analyzeWithClaude = async () => {
    setAiLoading(true);
    const prompt = `Eres un consultor financiero para PyMEs. Analiza este forecast y ayuda al dueño a tomar decisiones.

SITUACIÓN BASE:
- Ventas actuales: ${fmtCLP(calc.revenue)}/mes
- EBITDA actual: ${fmtCLP(calc.ebitda)}/mes
- Caja actual: ${fmtCLP(calc.cashAdjustedStart)}
- Margen bruto: ${calc.grossMarginPct}%
- Runway actual: ${isFinite(calc.runway)?calc.runway.toFixed(1)+' meses':'positivo'}

SUPUESTOS DEL FORECAST:
- Horizonte: ${assumptions.horizon} meses
- Crecimiento mensual asumido: ${assumptions.monthlyGrowth}%
- Cambio en costos fijos: ${assumptions.fixedCostChange||'0'}/mes
- Evento extraordinario: ${assumptions.oneOffAmount?fmtCLP(parseFloat(assumptions.oneOffAmount))+' en mes '+assumptions.oneOffMonth:'ninguno'}

RESULTADO DEL FORECAST:
- Ventas proyectadas al mes ${assumptions.horizon}: ${fmtCLP(lastPoint?.revenue??0)}
- EBITDA proyectado al mes ${assumptions.horizon}: ${fmtCLP(lastPoint?.ebitda??0)}
- Caja proyectada al mes ${assumptions.horizon}: ${fmtCLP(lastPoint?.cash??0)}
${firstNegative?`- ⚠️ La caja cae a negativo en el mes ${firstNegative.month}`:'- ✓ La caja se mantiene positiva en todo el horizonte'}

Escribe el análisis del forecast en exactamente 4 secciones en español:
🔭 HACIA DÓNDE VAS: ¿Qué dice este forecast sobre el futuro del negocio?
⚠️ EL RIESGO OCULTO: ¿Qué supuesto es el más frágil?
🎯 DECISIÓN PRÓXIMOS 30 DÍAS: Una acción concreta que cambia la trayectoria.
📅 TRABAJO DE FONDO (3-6 meses): Una cosa que deberías estar construyendo ahora.

Máximo 220 palabras. Directo, con números, habla de "tu negocio".`;

    try {
      const res = await fetch('/api/diagnose', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ calc: { _rawPrompt: prompt } }) });
      const d = await res.json();
      setAiText(d.diagnosis || '');
    } catch (e) { console.error(e); }
    finally { setAiLoading(false); }
  };

  return (
    <ProLayout>
      <style>{`
        .fc-grid { display:grid; grid-template-columns:260px 1fr; gap:20px; align-items:start; }
        @media(max-width:700px){ .fc-grid { grid-template-columns:1fr; } .fc-sticky { position:static !important; } }
        .horizon-tabs { display:flex; gap:4px; margin-bottom:16px; }
        .horizon-tab { flex:1; padding:8px 4px; border-radius:7px; border:1px solid var(--border); background:transparent; color:var(--muted-2); font-family:var(--font-display); font-size:0.75rem; font-weight:700; cursor:pointer; transition:all 0.18s; text-align:center; }
        .horizon-tab.active { background:var(--accent); border-color:var(--accent); color:var(--bg); }
        .horizon-tab:not(.active):hover { border-color:var(--accent); color:var(--accent); }
        .fc-chart { display:flex; align-items:flex-end; gap:3px; height:120px; margin-top:12px; overflow:hidden; }
        .fc-col { flex:1; display:flex; flex-direction:column; align-items:center; justify-content:flex-end; gap:3px; height:100%; }
        .fc-bar { width:100%; border-radius:2px 2px 0 0; min-height:3px; flex-shrink:0; }
        .fc-lbl { font-size:0.5rem; color:var(--muted-2); line-height:1; flex-shrink:0; }
        @keyframes fc-pulse { 0%,100%{opacity:0.15;transform:scale(0.8);}50%{opacity:1;transform:scale(1);} }
        .pro-kpi { position:relative; overflow:hidden; border-radius:14px; border:1px solid var(--border); background:var(--surface); padding:16px 18px 16px 22px; }
        .pro-kpi::before { content:''; position:absolute; left:0; top:14px; bottom:14px; width:3px; border-radius:0 2px 2px 0; background:var(--border); }
        .kpi-highlight { border-color:rgba(249,215,27,.22); background:linear-gradient(135deg,rgba(249,215,27,.06) 0%,var(--surface) 55%); }
        .kpi-highlight::before { background:var(--accent); }
        .kpi-danger  { border-color:rgba(239,68,68,.28); background:linear-gradient(135deg,rgba(239,68,68,.07) 0%,var(--surface) 55%); }
        .kpi-danger::before  { background:var(--danger); }
        .kpi-neutral::before { background:var(--border); }
        .kpi-label { font-size:.5625rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted-2); display:block; margin-bottom:8px; }
        .kpi-badge { font-size:.45rem; font-weight:800; letter-spacing:.1em; text-transform:uppercase; padding:2px 7px; border-radius:4px; white-space:nowrap; }
        .kpi-badge-highlight { color:var(--accent);  background:rgba(249,215,27,.08); border:1px solid rgba(249,215,27,.2); }
        .kpi-badge-danger    { color:var(--danger);  background:rgba(239,68,68,.07);  border:1px solid rgba(239,68,68,.22); }
        .kpi-badge-neutral   { color:var(--muted-2); background:rgba(255,255,255,.02);border:1px solid var(--border); }
        .kpi-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:10px; }
        .kpi-val { font-family:var(--font-display); font-size:1.75rem; font-weight:900; letter-spacing:-.04em; line-height:1; margin-bottom:4px; }
        .kpi-val-highlight { color:var(--accent); }
        .kpi-val-danger    { color:var(--danger); }
        .kpi-val-neutral   { color:var(--text); }
        .kpi-sub { font-size:.6875rem; color:var(--muted-2); line-height:1.4; }
      `}</style>

      <div className="home-content">
        <div className="fc-grid">

          {/* Assumptions panel */}
          <div className="form-card fc-sticky" style={{ position: 'sticky', top: 72 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)', marginBottom: 16, letterSpacing: '-0.02em' }}>Supuestos</div>

            <div className="sf" style={{ marginBottom: 16 }}>
              <label>Horizonte</label>
              <div className="horizon-tabs">
                {(['3','6','12','24'] as const).map(h => (
                  <button key={h} className={`horizon-tab${assumptions.horizon===h?' active':''}`} onClick={() => setAssumptions(p => ({ ...p, horizon: h }))}>{h}m</button>
                ))}
              </div>
            </div>

            <div className="sf">
              <label>Crecimiento mensual (%)</label>
              <input type="number" value={assumptions.monthlyGrowth} onChange={setA('monthlyGrowth')} placeholder="2" />
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: 4 }}>2% mensual = ~27% anual</div>
            </div>

            <div className="sf">
              <label>Cambio en costos fijos / mes</label>
              <input type="number" value={assumptions.fixedCostChange} onChange={setA('fixedCostChange')} placeholder="0" />
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: 4 }}>Positivo = más costos. Negativo = menos.</div>
            </div>

            <div className="sf">
              <label>Evento extraordinario</label>
              <div className="sf-row">
                <input type="number" value={assumptions.oneOffMonth} onChange={setA('oneOffMonth')} placeholder="Mes" />
                <input type="number" value={assumptions.oneOffAmount} onChange={setA('oneOffAmount')} placeholder="Monto" />
              </div>
              <div style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: 4 }}>Ej: bono de temporada, inversión, pago de deuda</div>
            </div>
          </div>

          {/* Results panel */}
          <div>
            <div className="chart-lbl" style={{ marginBottom: 10 }}>Proyección a {assumptions.horizon} meses</div>
            <div className="metrics-grid" style={{ gridTemplateColumns: 'repeat(3,1fr)', marginBottom: 14 }}>
              <div className="pro-kpi kpi-neutral">
                <div className="kpi-head">
                  <div className="kpi-label" style={{ margin:0 }}>Ventas mes {assumptions.horizon}</div>
                  <span className="kpi-badge kpi-badge-neutral">Proyectado</span>
                </div>
                <div className="kpi-val kpi-val-neutral">{fmtCLP(lastPoint?.revenue??0)}</div>
                <div className="kpi-sub">vs {fmtCLP(calc.revenue)} hoy</div>
              </div>
              <div className={`pro-kpi ${(lastPoint?.ebitda??0)>=0?'kpi-highlight':'kpi-danger'}`}>
                <div className="kpi-head">
                  <div className="kpi-label" style={{ margin:0 }}>EBITDA mes {assumptions.horizon}</div>
                  <span className={`kpi-badge ${(lastPoint?.ebitda??0)>=0?'kpi-badge-highlight':'kpi-badge-danger'}`}>{(lastPoint?.ebitda??0)>=0?'● Positivo':'● Negativo'}</span>
                </div>
                <div className={`kpi-val ${(lastPoint?.ebitda??0)>=0?'kpi-val-highlight':'kpi-val-danger'}`}>{fmtCLP(lastPoint?.ebitda??0)}</div>
                <div className="kpi-sub">vs {fmtCLP(calc.ebitda)} hoy</div>
              </div>
              <div className={`pro-kpi ${(lastPoint?.cash??0)>=0?'kpi-highlight':'kpi-danger'}`}>
                <div className="kpi-head">
                  <div className="kpi-label" style={{ margin:0 }}>Caja mes {assumptions.horizon}</div>
                  <span className={`kpi-badge ${(lastPoint?.cash??0)>=0?'kpi-badge-highlight':'kpi-badge-danger'}`}>{(lastPoint?.cash??0)>=0?'● Positivo':'● Negativo'}</span>
                </div>
                <div className={`kpi-val ${(lastPoint?.cash??0)>=0?'kpi-val-highlight':'kpi-val-danger'}`}>{fmtCLP(lastPoint?.cash??0)}</div>
                <div className="kpi-sub">vs {fmtCLP(calc.cashAdjustedStart)} hoy</div>
              </div>
            </div>

            {firstNegative ? (
              <div className="alert-card red" style={{ marginBottom: 14 }}>
                <span className="alert-icon">⚠️</span>
                <span>Con estos supuestos, tu caja cae a negativo en el <strong>mes {firstNegative.month}</strong>. Necesitas actuar antes de ese punto.</span>
              </div>
            ) : (
              <div className="alert-card green" style={{ marginBottom: 14 }}>
                <span className="alert-icon">✓</span>
                <span>Con estos supuestos, tu caja se mantiene positiva durante todo el horizonte de {assumptions.horizon} meses.</span>
              </div>
            )}

            <div className="chart-card">
              <div className="chart-lbl">Evolución de caja</div>
              <div className="fc-chart">
                {forecast.map((p, i) => {
                  const norm = (p.cash - minCash) / range;
                  const h = Math.max(3, Math.round(norm * 90));
                  const showLabel = forecast.length <= 12 || i === 0 || (i+1) % Math.ceil(forecast.length/6) === 0;
                  return (
                    <div key={i} className="fc-col" title={`${p.label} M${p.month}: ${fmtCLP(p.cash)}`}>
                      <div className="fc-bar" style={{ height: `${h}px`, background: p.cash>=0?'var(--accent)':'var(--danger)', opacity: 0.85 }} />
                      {showLabel && <div className="fc-lbl">{p.label}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-card">
              <div className="chart-lbl">Evolución de EBITDA</div>
              <div className="fc-chart">
                {(() => {
                  const maxE = Math.max(...forecast.map(p => p.ebitda), 1);
                  const minE = Math.min(...forecast.map(p => p.ebitda), 0);
                  const rangeE = maxE - minE || 1;
                  return forecast.map((p, i) => {
                    const norm = (p.ebitda - minE) / rangeE;
                    const h = Math.max(3, Math.round(norm * 90));
                    const showLabel = forecast.length <= 12 || i === 0 || (i+1) % Math.ceil(forecast.length/6) === 0;
                    return (
                      <div key={i} className="fc-col" title={`${p.label} M${p.month}: ${fmtCLP(p.ebitda)}`}>
                        <div className="fc-bar" style={{ height: `${h}px`, background: p.ebitda>=0?'var(--accent)':'var(--danger)', opacity: 0.85 }} />
                        {showLabel && <div className="fc-lbl">{p.label}</div>}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            <button className="btn-start" onClick={analyzeWithClaude} disabled={aiLoading} style={{ marginBottom: 12 }}>
              {aiLoading ? 'Analizando forecast...' : '✦ Analizar este forecast con IA →'}
            </button>

            {aiLoading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-2)', fontSize: '0.875rem', padding: '6px 0' }}>
                {[0,1,2].map(i => <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: `fc-pulse 1.2s ease-in-out infinite`, animationDelay: `${i*0.2}s` }} />)}
                <span>Claude está analizando tu trayectoria...</span>
              </div>
            )}

            {aiText && (
              <div className="diag-card" style={{ position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,215,27,.2),transparent)' }} />
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 6, background: 'rgba(249,215,27,.08)', border: '1px solid rgba(249,215,27,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)', fontSize: '0.75rem' }}>✦</div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)' }}>Análisis del forecast</div>
                </div>
                <div style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.85 }}>
                  {aiText.split('\n\n').map((p, i) => <p key={i} style={{ margin: '0 0 12px' }}>{p}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProLayout>
  );
}
