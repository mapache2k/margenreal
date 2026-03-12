'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePro } from '../../lib/ProContext';

// carga dinámica del layout que usa hooks del cliente
const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};

type ForecastPoint = {
  month: number;
  label: string;
  revenue: number;
  ebitda: number;
  cash: number;
};

type Assumptions = {
  monthlyGrowth: string;
  fixedCostChange: string;
  oneOffMonth: string;
  oneOffAmount: string;
  horizon: '3' | '6' | '12' | '24';
};

function buildForecast(calc: any, assumptions: Assumptions): ForecastPoint[] {
  const months = parseInt(assumptions.horizon);
  const growth = parseFloat(assumptions.monthlyGrowth) / 100 || 0;
  const fixedDelta = parseFloat(assumptions.fixedCostChange) || 0;
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

    const labelIdx = (m - 1) % 12;
    points.push({ month: m, label: monthLabels[labelIdx], revenue, ebitda, cash });
  }

  return points;
}

export default function Forecast() {
  const router = useRouter();
  const { data, loading } = usePro();
  const [assumptions, setAssumptions] = useState<Assumptions>({
    monthlyGrowth: '2',
    fixedCostChange: '0',
    oneOffMonth: '',
    oneOffAmount: '',
    horizon: '12',
  });
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [aiText, setAiText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!loading && !data) router.replace('/pro');
  }, [data, loading]);

  useEffect(() => {
    if (data?.calc) {
      setForecast(buildForecast(data.calc, assumptions));
    }
  }, [data, assumptions]);

  if (!data) return null;
  const { calc } = data;

  const setA = (k: keyof Assumptions) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAssumptions(prev => ({ ...prev, [k]: e.target.value as any }));

  const maxCash = Math.max(...forecast.map(p => p.cash), 1);
  const minCash = Math.min(...forecast.map(p => p.cash), 0);
  const range = maxCash - minCash || 1;

  const lastPoint = forecast[forecast.length - 1];
  const cashBelowZero = forecast.filter(p => p.cash < 0);
  const firstNegative = cashBelowZero[0];

  const analyzeWithClaude = async () => {
    setAiLoading(true);
    const horizon = assumptions.horizon;
    const growth = assumptions.monthlyGrowth;
    const prompt = `Eres un consultor financiero para PyMEs. Analiza este forecast y ayuda al dueño a tomar decisiones.

SITUACIÓN BASE:
- Ventas actuales: ${fmtCLP(calc.revenue)}/mes
- EBITDA actual: ${fmtCLP(calc.ebitda)}/mes
- Caja actual: ${fmtCLP(calc.cashAdjustedStart)}
- Margen bruto: ${calc.grossMarginPct}%
- Runway actual: ${isFinite(calc.runway) ? calc.runway.toFixed(1) + ' meses' : 'positivo'}

SUPUESTOS DEL FORECAST:
- Horizonte: ${horizon} meses
- Crecimiento mensual asumido: ${growth}%
- Cambio en costos fijos: ${assumptions.fixedCostChange || '0'}/mes
- Evento extraordinario: ${assumptions.oneOffAmount ? fmtCLP(parseFloat(assumptions.oneOffAmount)) + ' en mes ' + assumptions.oneOffMonth : 'ninguno'}

RESULTADO DEL FORECAST:
- Ventas proyectadas al mes ${horizon}: ${fmtCLP(lastPoint?.revenue ?? 0)}
- EBITDA proyectado al mes ${horizon}: ${fmtCLP(lastPoint?.ebitda ?? 0)}
- Caja proyectada al mes ${horizon}: ${fmtCLP(lastPoint?.cash ?? 0)}
${firstNegative ? `- ⚠️ La caja cae a negativo en el mes ${firstNegative.month}` : '- ✓ La caja se mantiene positiva en todo el horizonte'}

Escribe el análisis del forecast en exactamente 4 secciones en español:

🔭 HACIA DÓNDE VAS: ¿Qué dice este forecast sobre el futuro del negocio? ¿Es sostenible este ritmo?

⚠️ EL RIESGO OCULTO: ¿Qué supuesto es el más frágil? ¿Qué pasa si el crecimiento es la mitad?

🎯 DECISIÓN PRÓXIMOS 30 DÍAS: Una acción concreta que cambia la trayectoria esta semana.

📅 TRABAJO DE FONDO (3-6 meses): Una cosa que deberías estar construyendo ahora para que el negocio sea más sólido en 6 meses.

Máximo 220 palabras. Directo, con números, habla de "tu negocio".`;

    try {
      const res = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calc: { _rawPrompt: prompt } }),
      });
      const d = await res.json();
      setAiText(d.diagnosis || '');
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <ProLayout>
      <style>{`
        .page-topbar {
          height: 56px; border-bottom: 1px solid #2a2a28;
          display: flex; align-items: center; padding: 0 40px;
          background: #161614; position: sticky; top: 0; z-index: 40;
        }
        .page-title { font-family: 'Syne', sans-serif; font-size: 0.9375rem; font-weight: 800; color: #f0f0f0; letter-spacing: -0.02em; }
        .page-content { padding: 32px 40px 80px; max-width: 860px; }

        .forecast-grid { display: grid; grid-template-columns: 260px 1fr; gap: 20px; align-items: start; }
        @media (max-width: 700px) { .forecast-grid { grid-template-columns: 1fr; } }

        .assumptions-card {
          background: #1e1e1c; border: 1px solid #2a2a28;
          border-radius: 14px; padding: 20px;
          position: sticky; top: 72px;
        }
        .assumptions-title { font-family: 'Syne', sans-serif; font-size: 0.875rem; font-weight: 800; color: #f0f0f0; margin-bottom: 16px; letter-spacing: -0.02em; }

        .field { margin-bottom: 12px; }
        .field label { display: block; font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
        .field input, .field select {
          width: 100%; background: #161614; border: 1.5px solid #2a2a28; color: #f0f0f0;
          font-family: 'Epilogue', sans-serif; font-size: 0.9375rem; font-weight: 600;
          padding: 9px 12px; border-radius: 8px; outline: none;
          transition: border-color 0.18s; -moz-appearance: textfield;
        }
        .field input::-webkit-outer-spin-button, .field input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .field input:focus, .field select:focus { border-color: #f0ebe0; }
        .field input::placeholder { color: #2a2a28; font-weight: 400; }
        .field select { cursor: pointer; }

        .horizon-tabs { display: flex; gap: 4px; margin-bottom: 16px; }
        .horizon-tab {
          flex: 1; padding: 8px 4px; border-radius: 7px;
          border: 1px solid #2a2a28; background: transparent;
          color: #555; font-family: 'Epilogue', sans-serif;
          font-size: 0.75rem; font-weight: 600; cursor: pointer;
          transition: all 0.18s; text-align: center;
        }
        .horizon-tab.active { background: rgba(240,235,224,.08); border-color: rgba(240,235,224,.2); color: #f0ebe0; }

        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .field-hint { font-size: 0.6875rem; color: #444; margin-top: 4px; line-height: 1.4; }

        .results-col {}

        .section-lbl { font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase; color: #444; margin-bottom: 10px; }

        .summary-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-bottom: 14px; }
        .s-card { background: #1e1e1c; border: 1px solid #2a2a28; border-radius: 10px; padding: 14px 12px; }
        .s-lbl { font-size: 0.5625rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #555; margin-bottom: 6px; }
        .s-val { font-family: 'Syne', sans-serif; font-size: 1.125rem; font-weight: 800; letter-spacing: -0.02em; }
        .s-sub { font-size: 0.625rem; color: #444; margin-top: 4px; }

        .chart-card { background: #1e1e1c; border: 1px solid #2a2a28; border-radius: 12px; padding: 18px; margin-bottom: 14px; }

        .forecast-chart { display: flex; align-items: flex-end; gap: 3px; height: 120px; margin-top: 12px; overflow: hidden; }
        .fc-col { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; gap: 3px; height: 100%; }
        .fc-bar { width: 100%; border-radius: 2px 2px 0 0; min-height: 3px; flex-shrink: 0; }
        .fc-lbl { font-size: 0.5rem; color: #444; line-height: 1; flex-shrink: 0; }

        .warning-card {
          background: rgba(232,85,85,.07); border: 1px solid rgba(232,85,85,.2);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
          font-size: 0.875rem; color: #e85555; line-height: 1.6;
        }
        .good-card {
          background: rgba(45,212,160,.06); border: 1px solid rgba(45,212,160,.2);
          border-radius: 10px; padding: 14px 16px; margin-bottom: 14px;
          font-size: 0.875rem; color: #2dd4a0; line-height: 1.6;
        }

        .btn-ai {
          width: 100%; background: rgba(240,235,224,.06);
          border: 1px solid rgba(240,235,224,.15); color: #f0ebe0;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 0.875rem; padding: 13px; border-radius: 10px;
          cursor: pointer; transition: all 0.18s; letter-spacing: 0.02em;
          margin-bottom: 12px;
        }
        .btn-ai:hover:not(:disabled) { background: rgba(240,235,224,.1); border-color: rgba(240,235,224,.25); }
        .btn-ai:disabled { opacity: 0.5; cursor: not-allowed; }

        .ai-card {
          background: #1e1e1c; border: 1px solid rgba(240,235,224,.12);
          border-radius: 12px; padding: 20px; margin-bottom: 12px;
          position: relative; overflow: hidden;
        }
        .ai-card::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(240,235,224,.2), transparent);
        }
        .ai-header { display: flex; align-items: center; gap: 10px; margin-bottom: 14px; }
        .ai-icon { width: 28px; height: 28px; border-radius: 6px; background: rgba(240,235,224,.07); border: 1px solid rgba(240,235,224,.1); display: flex; align-items: center; justify-content: center; font-size: 0.75rem; }
        .ai-title { font-family: 'Syne', sans-serif; font-size: 0.875rem; font-weight: 800; color: #f0f0f0; }
        .ai-body { font-size: 0.9375rem; color: #bbb; line-height: 1.85; }
        .ai-body p { margin-bottom: 12px; }
        .ai-body p:last-child { margin-bottom: 0; }

        .loading-dots { display: flex; align-items: center; gap: 8px; color: #444; font-size: 0.875rem; padding: 6px 0; }
        .loading-dot { width: 5px; height: 5px; border-radius: 50%; background: #f0ebe0; animation: pulse 1.2s ease-in-out infinite; }
        .loading-dot:nth-child(2) { animation-delay: 0.2s; }
        .loading-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes pulse { 0%,100% { opacity: 0.15; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="page-topbar">
        <span className="page-title">Forecast</span>
      </div>

      <div className="page-content">
        <div className="forecast-grid">

          {/* Left: assumptions */}
          <div className="assumptions-card">
            <div className="assumptions-title">Supuestos</div>

            <div className="field">
              <label>Horizonte</label>
              <div className="horizon-tabs">
                {(['3','6','12','24'] as const).map(h => (
                  <button
                    key={h}
                    className={`horizon-tab ${assumptions.horizon === h ? 'active' : ''}`}
                    onClick={() => setAssumptions(p => ({ ...p, horizon: h }))}
                  >
                    {h}m
                  </button>
                ))}
              </div>
            </div>

            <div className="field">
              <label>Crecimiento mensual (%)</label>
              <input type="number" value={assumptions.monthlyGrowth} onChange={setA('monthlyGrowth')} placeholder="2" />
              <div className="field-hint">2% mensual = ~27% anual</div>
            </div>

            <div className="field">
              <label>Cambio en costos fijos / mes</label>
              <input type="number" value={assumptions.fixedCostChange} onChange={setA('fixedCostChange')} placeholder="0" />
              <div className="field-hint">Positivo = más costos. Negativo = menos.</div>
            </div>

            <div className="field">
              <label>Evento extraordinario</label>
              <div className="field-row">
                <div>
                  <input type="number" value={assumptions.oneOffMonth} onChange={setA('oneOffMonth')} placeholder="Mes" />
                </div>
                <div>
                  <input type="number" value={assumptions.oneOffAmount} onChange={setA('oneOffAmount')} placeholder="Monto" />
                </div>
              </div>
              <div className="field-hint">Ej: bono de temporada, inversión, pago de deuda</div>
            </div>
          </div>

          {/* Right: results */}
          <div className="results-col">
            {/* Summary cards */}
            <div className="section-lbl">Proyección a {assumptions.horizon} meses</div>
            <div className="summary-grid">
              <div className="s-card">
                <div className="s-lbl">Ventas mes {assumptions.horizon}</div>
                <div className="s-val" style={{ color: '#f0ebe0' }}>{fmtCLP(lastPoint?.revenue ?? 0)}</div>
                <div className="s-sub">vs {fmtCLP(calc.revenue)} hoy</div>
              </div>
              <div className="s-card">
                <div className="s-lbl">EBITDA mes {assumptions.horizon}</div>
                <div className="s-val" style={{ color: (lastPoint?.ebitda ?? 0) >= 0 ? '#2dd4a0' : '#e85555' }}>
                  {fmtCLP(lastPoint?.ebitda ?? 0)}
                </div>
                <div className="s-sub">vs {fmtCLP(calc.ebitda)} hoy</div>
              </div>
              <div className="s-card">
                <div className="s-lbl">Caja mes {assumptions.horizon}</div>
                <div className="s-val" style={{ color: (lastPoint?.cash ?? 0) >= 0 ? '#2dd4a0' : '#e85555' }}>
                  {fmtCLP(lastPoint?.cash ?? 0)}
                </div>
                <div className="s-sub">vs {fmtCLP(calc.cashAdjustedStart)} hoy</div>
              </div>
            </div>

            {/* Warning or good */}
            {firstNegative ? (
              <div className="warning-card">
                ⚠️ Con estos supuestos, tu caja cae a negativo en el <strong>mes {firstNegative.month}</strong>.
                Necesitas actuar antes de ese punto.
              </div>
            ) : (
              <div className="good-card">
                ✓ Con estos supuestos, tu caja se mantiene positiva durante todo el horizonte de {assumptions.horizon} meses.
              </div>
            )}

            {/* Chart */}
            <div className="chart-card">
              <div className="section-lbl">Evolución de caja</div>
              <div className="forecast-chart">
                {forecast.map((p, i) => {
                  const norm = ((p.cash - minCash) / range);
                  const h = Math.max(3, Math.round(norm * 90));
                  const showLabel = forecast.length <= 12 || i === 0 || (i + 1) % Math.ceil(forecast.length / 6) === 0;
                  return (
                    <div key={i} className="fc-col" title={`${p.label} M${p.month}: ${fmtCLP(p.cash)}`}>
                      <div className="fc-bar" style={{ height: `${h}px`, background: p.cash >= 0 ? '#2dd4a0' : '#e85555', opacity: 0.85 }} />
                      {showLabel && <div className="fc-lbl">{p.label}</div>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* EBITDA chart */}
            <div className="chart-card">
              <div className="section-lbl">Evolución de EBITDA</div>
              <div className="forecast-chart">
                {(() => {
                  const maxE = Math.max(...forecast.map(p => p.ebitda), 1);
                  const minE = Math.min(...forecast.map(p => p.ebitda), 0);
                  const rangeE = maxE - minE || 1;
                  return forecast.map((p, i) => {
                    const norm = ((p.ebitda - minE) / rangeE);
                    const h = Math.max(3, Math.round(norm * 90));
                    const showLabel = forecast.length <= 12 || i === 0 || (i + 1) % Math.ceil(forecast.length / 6) === 0;
                    return (
                      <div key={i} className="fc-col" title={`${p.label} M${p.month}: ${fmtCLP(p.ebitda)}`}>
                        <div className="fc-bar" style={{ height: `${h}px`, background: p.ebitda >= 0 ? '#7c6fff' : '#e85555', opacity: 0.85 }} />
                        {showLabel && <div className="fc-lbl">{p.label}</div>}
                      </div>
                    );
                  });
                })()}
              </div>
            </div>

            {/* AI analysis */}
            <button className="btn-ai" onClick={analyzeWithClaude} disabled={aiLoading}>
              {aiLoading ? 'Analizando forecast...' : '✦ Analizar este forecast con IA →'}
            </button>

            {aiLoading && (
              <div className="loading-dots">
                <div className="loading-dot" /><div className="loading-dot" /><div className="loading-dot" />
                <span>Claude está analizando tu trayectoria...</span>
              </div>
            )}

            {aiText && (
              <div className="ai-card">
                <div className="ai-header">
                  <div className="ai-icon">✦</div>
                  <div className="ai-title">Análisis del forecast</div>
                </div>
                <div className="ai-body">
                  {aiText.split('\n\n').map((p, i) => <p key={i}>{p}</p>)}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProLayout>
  );
}
