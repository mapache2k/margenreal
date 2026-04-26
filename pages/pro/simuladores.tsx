'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePro } from '../../lib/ProContext';
import { CalcResult } from '../../lib/ProContext';

const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

const fmtCLP = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}K`;
  return `$${Math.round(n)}`;
};

async function askClaude(prompt: string): Promise<string> {
  const res = await fetch('/api/diagnose', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ calc: { _rawPrompt: prompt } }),
  });
  const d = await res.json();
  return d.diagnosis || 'No se pudo obtener el análisis.';
}

function AIResult({ text, loading }: { text: string; loading: boolean }) {
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--muted-2)', fontSize: '0.875rem', padding: '12px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', animation: 'sim-pulse 1.2s ease-in-out infinite', animationDelay: `${i*0.2}s` }} />
      ))}
      <span>Claude está analizando...</span>
    </div>
  );
  if (!text) return null;
  return (
    <div className="diag-card" style={{ marginTop: 16, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg,transparent,rgba(249,215,27,.2),transparent)' }} />
      <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 12 }}>✦ Análisis de Claude</div>
      <div style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.85 }}>
        {text.split('\n\n').map((p, i) => <p key={i} style={{ margin: '0 0 12px' }}>{p}</p>)}
      </div>
    </div>
  );
}

function ModuleShell({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="form-card" style={{ padding: 0, marginBottom: 10, overflow: 'hidden', borderColor: open ? 'rgba(249,215,27,.2)' : undefined, transition: 'border-color 0.2s' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: 14,
        padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        transition: 'background 0.18s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(249,215,27,.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 800, color: 'var(--text)', marginBottom: 3, letterSpacing: '-0.02em' }}>{title}</div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.4 }}>{subtitle}</div>
        </div>
        <div style={{ color: 'var(--muted-2)', fontSize: '0.75rem', flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>↓</div>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border)', animation: 'sim-fadeup 0.25s ease both' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function SimField({ label, value, onChange, placeholder, type = 'number' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="sf" style={{ marginTop: 14 }}>
      <label>{label}</label>
      <input type={type} value={value} placeholder={placeholder || '0'} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

type SimVariant = 'highlight' | 'danger' | 'warning' | 'neutral';

function MiniMetric({ label, value, variant = 'neutral', sub }: { label: string; value: string; variant?: SimVariant; sub?: string }) {
  return (
    <div className={`pro-kpi kpi-${variant}`}>
      <div className="kpi-label" style={{ marginBottom: 8, display: 'block' }}>{label}</div>
      <div className={`kpi-val kpi-val-${variant}`} style={{ fontSize: '1.25rem' }}>{value}</div>
      {sub && <div className="kpi-sub" style={{ marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ── Loan ──────────────────────────────────────────────────────────────────
function LoanModule({ calc }: { calc: CalcResult }) {
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [rate, setRate]   = useState('');
  const [ai, setAi]       = useState('');
  const [loading, setLoading] = useState(false);

  const p = parseFloat(payment) || 0;
  const newEbitda = calc.grossProfit - calc.fixedCosts - p;
  const newNet    = newEbitda - calc.monthlyDebtPayment;
  const e10 = calc.revenue * 0.9 * calc.contributionMarginPct - calc.fixedCosts - p;
  const e20 = calc.revenue * 0.8 * calc.contributionMarginPct - calc.fixedCosts - p;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs. Un dueño evalúa tomar un préstamo.

NEGOCIO ACTUAL: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Runway ${isFinite(calc.runway) ? calc.runway.toFixed(1) + ' meses' : 'positivo'}, Caja ${fmtCLP(calc.cashAdjustedStart)}

PRÉSTAMO: Monto ${fmtCLP(parseFloat(amount)||0)}, Cuota ${fmtCLP(p)}/mes, Tasa ${rate}% anual

IMPACTO: Nuevo EBITDA ${fmtCLP(newEbitda)}, Nuevo flujo neto ${fmtCLP(newNet)}, EBITDA si ventas −10% = ${fmtCLP(e10)}, si −20% = ${fmtCLP(e20)}

3 párrafos en español (máx 180 palabras): 1) ¿Puede pagar esta cuota cómodamente? 2) Riesgo principal y escenario peligroso 3) Recomendación concreta: ¿tomar, negociar o esperar?`);
    setAi(text); setLoading(false);
  };

  return (
    <ModuleShell icon="🏦" title="Simulador de préstamo" subtitle="¿Puedo pagar esta deuda sin ahogar el negocio?">
      <div className="sf-row">
        <SimField label="Monto del préstamo" value={amount} onChange={setAmount} placeholder="500000" />
        <SimField label="Cuota mensual" value={payment} onChange={setPayment} placeholder="50000" />
      </div>
      <SimField label="Tasa de interés anual (%)" value={rate} onChange={setRate} placeholder="12" />
      {p > 0 && (
        <div className="metrics-grid" style={{ marginTop: 8 }}>
          <MiniMetric label="Nuevo EBITDA" value={fmtCLP(newEbitda)} variant={newEbitda>=0?'highlight':'danger'} sub={`vs ${fmtCLP(calc.ebitda)} actual`} />
          <MiniMetric label="Nuevo flujo neto" value={fmtCLP(newNet)} variant={newNet>=0?'highlight':'danger'} sub="Después de deuda" />
          <MiniMetric label="Si ventas −10%" value={fmtCLP(e10)} variant={e10>=0?'highlight':'danger'} sub="EBITDA bajo estrés" />
          <MiniMetric label="Si ventas −20%" value={fmtCLP(e20)} variant={e20>=0?'highlight':'danger'} sub="EBITDA bajo estrés" />
        </div>
      )}
      <button className="btn-start" onClick={analyze} disabled={loading || !p} style={{ marginTop: 16 }}>
        {loading ? 'Analizando...' : 'Analizar con IA →'}
      </button>
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Hiring ────────────────────────────────────────────────────────────────
function HiringModule({ calc }: { calc: CalcResult }) {
  const [salary, setSalary] = useState('');
  const [role, setRole]     = useState('');
  const [ai, setAi]         = useState('');
  const [loading, setLoading] = useState(false);

  const totalCost = (parseFloat(salary)||0) * 1.25;
  const newEbitda = calc.ebitda - totalCost;
  const extraRev  = calc.contributionMarginPct > 0 ? totalCost / calc.contributionMarginPct : 0;
  const cushion   = totalCost > 0 ? calc.cashAdjustedStart / totalCost : 0;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs. Un dueño evalúa contratar a alguien.

NEGOCIO: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Margen ${calc.grossMarginPct}%, Runway ${isFinite(calc.runway)?calc.runway.toFixed(1)+'m':'positivo'}, Caja ${fmtCLP(calc.cashAdjustedStart)}

CONTRATACIÓN: Rol "${role||'no especificado'}", Sueldo ${fmtCLP(parseFloat(salary)||0)}, Costo total ${fmtCLP(totalCost)}/mes
Nuevo EBITDA: ${fmtCLP(newEbitda)}, Ventas extra necesarias: ${fmtCLP(extraRev)}, Colchón de caja: ${cushion.toFixed(1)} meses

3 párrafos en español (máx 180 palabras): 1) ¿Los fundamentos soportan esta contratación ahora? 2) Tiempo de colchón y qué necesita ocurrir para que sea rentable 3) ¿Contratar ahora, en X meses, o bajo qué condiciones?`);
    setAi(text); setLoading(false);
  };

  return (
    <ModuleShell icon="👤" title="Simulador de contratación" subtitle="¿El negocio soporta sumar a alguien al equipo?">
      <SimField label="Rol o cargo" value={role} onChange={setRole} placeholder="Ej: vendedor, asistente..." type="text" />
      <SimField label="Sueldo mensual bruto" value={salary} onChange={setSalary} placeholder="800000" />
      {parseFloat(salary) > 0 && (
        <>
          <div style={{ marginTop: 12, padding: '10px 14px', background: 'rgba(249,215,27,.04)', border: '1px solid rgba(249,215,27,.1)', borderRadius: 8, fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.6 }}>
            💡 Costo real para el negocio: <strong style={{ color: 'var(--text)' }}>{fmtCLP(totalCost)}/mes</strong> (incluye cargas ~25%)
          </div>
          <div className="metrics-grid" style={{ marginTop: 10 }}>
            <MiniMetric label="Nuevo EBITDA" value={fmtCLP(newEbitda)} variant={newEbitda>=0?'highlight':'danger'} sub={`vs ${fmtCLP(calc.ebitda)}`} />
            <MiniMetric label="Ventas extra necesarias" value={fmtCLP(extraRev)} sub="Para cubrir el costo" />
            <MiniMetric label="Colchón de caja" value={`${cushion.toFixed(1)} meses`} variant={cushion>=3?'highlight':'warning'} sub="Para absorber el costo" />
            <MiniMetric label="% de ventas actuales" value={`${calc.revenue>0?((totalCost/calc.revenue)*100).toFixed(1):0}%`} sub="Del ingreso mensual" />
          </div>
        </>
      )}
      <button className="btn-start" onClick={analyze} disabled={loading || !salary} style={{ marginTop: 16 }}>
        {loading ? 'Analizando...' : 'Analizar con IA →'}
      </button>
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Crisis ────────────────────────────────────────────────────────────────
function CrisisModule({ calc }: { calc: CalcResult }) {
  const [ai, setAi]         = useState('');
  const [loading, setLoading] = useState(false);

  const levers = [
    { icon: '📈', name: 'Subir precios 5%',       impact: fmtCLP(calc.revenue*0.05*calc.contributionMarginPct)+' EBITDA', ease: 'Difícil',  easeColor: 'var(--danger)' },
    { icon: '⚡', name: 'Cobrar 15 días antes',    impact: fmtCLP((calc.revenue/30)*15)+' en caja',                        ease: 'Moderado', easeColor: 'var(--warning)' },
    { icon: '✂️', name: 'Cortar costos fijos 10%', impact: fmtCLP(calc.fixedCosts*0.1)+' EBITDA',                          ease: 'Moderado', easeColor: 'var(--warning)' },
    { icon: '🤝', name: 'Extender pagos 30 días',  impact: 'Mejora ciclo de caja',                                         ease: 'Fácil',    easeColor: 'var(--accent)' },
    { icon: '🚀', name: 'Aumentar ventas 10%',     impact: fmtCLP(calc.revenue*0.1*calc.contributionMarginPct)+' EBITDA',  ease: 'Difícil',  easeColor: 'var(--danger)' },
    { icon: '💰', name: 'Cobrar cartera vencida',  impact: fmtCLP(calc.wcCashTied*0.5)+' inmediato',                       ease: 'Fácil',    easeColor: 'var(--accent)' },
  ];

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs en modo crisis. El dueño siente la caja apretada.

SITUACIÓN: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Flujo neto ${fmtCLP(calc.monthlyNetCashFlow)}, Caja ${fmtCLP(calc.cashAdjustedStart)}, Runway ${isFinite(calc.runway)?calc.runway.toFixed(1)+'m':'positivo'}, DSO ${calc.arDays}d, DPO ${calc.apDays}d, Efectivo atrapado ${fmtCLP(calc.wcCashTied)}, Costos fijos ${fmtCLP(calc.fixedCosts)}, Margen ${calc.grossMarginPct}%

PALANCAS: Subir precios 5% = +${fmtCLP(calc.revenue*0.05*calc.contributionMarginPct)} EBITDA (difícil) | Cobrar 15d antes = +${fmtCLP((calc.revenue/30)*15)} caja (moderado) | Cortar costos 10% = +${fmtCLP(calc.fixedCosts*0.1)} EBITDA (moderado) | Extender pagos = mejora ciclo (fácil) | Ventas +10% = +${fmtCLP(calc.revenue*0.1*calc.contributionMarginPct)} EBITDA (difícil) | Cartera vencida = +${fmtCLP(calc.wcCashTied*0.5)} (fácil)

3 párrafos en español (máx 200 palabras): 1) Raíz del problema de caja en este negocio 2) Las 2-3 palancas más impactantes y fáciles de ejecutar esta semana (con números) 3) Qué NO hacer: qué palanca parece fácil pero es una trampa`);
    setAi(text); setLoading(false);
  };

  return (
    <ModuleShell icon="🚨" title="Modo crisis — caja apretada" subtitle="¿Qué palancas debo activar y en qué orden?">
      <div className="metrics-grid" style={{ marginTop: 14 }}>
        {levers.map((l, i) => (
          <div key={i} className="metric-card" style={{ padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 6 }}>
              <span style={{ fontSize: '0.9375rem' }}>{l.icon}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text)', lineHeight: 1.3 }}>{l.name}</span>
            </div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--accent)', marginBottom: 3 }}>+{l.impact}</div>
            <div style={{ fontSize: '0.6875rem', color: l.easeColor }}>{l.ease}</div>
          </div>
        ))}
      </div>
      <button className="btn-start" onClick={analyze} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Analizando...' : 'Analizar con IA →'}
      </button>
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Monthly Close ─────────────────────────────────────────────────────────
function MonthlyCloseModule({ calc }: { calc: CalcResult }) {
  const [prevRev, setPrevRev]       = useState('');
  const [prevEbitda, setPrevEbitda] = useState('');
  const [highlight, setHighlight]   = useState('');
  const [ai, setAi]                 = useState('');
  const [loading, setLoading]       = useState(false);

  const prev  = parseFloat(prevRev)    || 0;
  const prevE = parseFloat(prevEbitda) || 0;
  const revGrowth    = prev  > 0      ? ((calc.revenue - prev)  / prev)         * 100 : 0;
  const ebitdaGrowth = prevE !== 0    ? ((calc.ebitda  - prevE) / Math.abs(prevE)) * 100 : 0;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero haciendo el cierre mensual de una PyME.

RESULTADOS: Ventas ${fmtCLP(calc.revenue)} (${prev>0?(revGrowth>=0?'+':'')+revGrowth.toFixed(1)+'% vs mes anterior':'primer mes'}), EBITDA ${fmtCLP(calc.ebitda)} (${prevE!==0?(ebitdaGrowth>=0?'+':'')+ebitdaGrowth.toFixed(1)+'%':'sin comparación'}), Margen ${calc.grossMarginPct}%, Runway ${isFinite(calc.runway)?calc.runway.toFixed(1)+'m':'positivo'}, Score ${calc.score}/100

LO MÁS IMPORTANTE DEL MES: ${highlight||'No especificado'}

4 secciones cortas en español (máx 200 palabras total):
📊 CÓMO TE FUE: Una frase honesta. ¿Bien, regular, mal? ¿Qué número lo define?
🎯 DECISIÓN ESTA SEMANA: Una acción concreta para los próximos 7 días.
📅 FOCO DEL PRÓXIMO MES: La prioridad #1 con un número objetivo.
🔭 TRABAJO DE FONDO: Una cosa que construir en los próximos 3-6 meses.`);
    setAi(text); setLoading(false);
  };

  return (
    <ModuleShell icon="📅" title="Cierre mensual" subtitle="¿Cómo me fue y qué priorizo el próximo mes?">
      <div className="sf-row">
        <SimField label="Ventas mes anterior" value={prevRev} onChange={setPrevRev} placeholder="0" />
        <SimField label="EBITDA mes anterior" value={prevEbitda} onChange={setPrevEbitda} placeholder="0" />
      </div>
      <SimField label="¿Qué fue lo más importante del mes?" value={highlight} onChange={setHighlight} placeholder="Ej: perdimos un cliente grande..." type="text" />
      {prev > 0 && (
        <div className="metrics-grid" style={{ marginTop: 8 }}>
          <MiniMetric label="Crecimiento ventas" value={`${revGrowth>=0?'+':''}${revGrowth.toFixed(1)}%`} variant={revGrowth>=0?'highlight':'danger'} sub={`${fmtCLP(prev)} → ${fmtCLP(calc.revenue)}`} />
          <MiniMetric label="Cambio EBITDA" value={`${ebitdaGrowth>=0?'+':''}${ebitdaGrowth.toFixed(1)}%`} variant={ebitdaGrowth>=0?'highlight':'danger'} sub={`${fmtCLP(prevE)} → ${fmtCLP(calc.ebitda)}`} />
        </div>
      )}
      <button className="btn-start" onClick={analyze} disabled={loading} style={{ marginTop: 16 }}>
        {loading ? 'Analizando...' : 'Analizar con IA →'}
      </button>
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────
export default function Simuladores() {
  const router = useRouter();
  const { data, loading } = usePro();

  useEffect(() => {
    if (!loading && !data) router.replace('/pro');
  }, [data, loading]);

  if (!data) return null;

  return (
    <ProLayout>
      <style>{`
        @keyframes sim-fadeup { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        @keyframes sim-pulse  { 0%,100% { opacity:0.15; transform:scale(0.8); } 50% { opacity:1; transform:scale(1); } }
        .pro-kpi { position:relative; overflow:hidden; border-radius:14px; border:1px solid var(--border); background:var(--surface); padding:14px 16px 14px 20px; }
        .pro-kpi::before { content:''; position:absolute; left:0; top:12px; bottom:12px; width:3px; border-radius:0 2px 2px 0; background:var(--border); }
        .kpi-highlight { border-color:rgba(249,215,27,.22); background:linear-gradient(135deg,rgba(249,215,27,.06) 0%,var(--surface) 55%); }
        .kpi-highlight::before { background:var(--accent); }
        .kpi-danger  { border-color:rgba(239,68,68,.28); background:linear-gradient(135deg,rgba(239,68,68,.07) 0%,var(--surface) 55%); }
        .kpi-danger::before  { background:var(--danger); }
        .kpi-warning { border-color:rgba(245,158,11,.22); background:linear-gradient(135deg,rgba(245,158,11,.06) 0%,var(--surface) 55%); }
        .kpi-warning::before { background:var(--warning); }
        .kpi-neutral::before { background:var(--border); }
        .kpi-label { font-size:.5625rem; font-weight:700; letter-spacing:.12em; text-transform:uppercase; color:var(--muted-2); }
        .kpi-val { font-family:var(--font-display); font-weight:900; letter-spacing:-.04em; line-height:1; }
        .kpi-val-highlight { color:var(--accent); }
        .kpi-val-danger    { color:var(--danger); }
        .kpi-val-warning   { color:var(--warning); }
        .kpi-val-neutral   { color:var(--text); }
        .kpi-sub { font-size:.6875rem; color:var(--muted-2); line-height:1.4; }
      `}</style>

      <div className="home-content">
        <p style={{ fontSize: '0.9375rem', color: 'var(--muted)', lineHeight: 1.6, marginBottom: 24 }}>
          Simula el impacto de tus decisiones más importantes antes de tomarlas.
          Cada simulador usa tus números reales como base.
        </p>
        <LoanModule calc={data.calc} />
        <HiringModule calc={data.calc} />
        <CrisisModule calc={data.calc} />
        <MonthlyCloseModule calc={data.calc} />
      </div>
    </ProLayout>
  );
}
