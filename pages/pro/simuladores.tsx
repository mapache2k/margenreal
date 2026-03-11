'use client';
import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { usePro } from '../../lib/ProContext';
import { CalcResult } from '../../lib/ProContext';

// carga dinámica del layout que usa hooks/objetos del cliente
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
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#444', fontSize: '0.875rem', padding: '12px 0' }}>
      {[0,1,2].map(i => (
        <div key={i} style={{
          width: '5px', height: '5px', borderRadius: '50%', background: '#f0ebe0',
          animation: 'pulse 1.2s ease-in-out infinite',
          animationDelay: `${i * 0.2}s`,
        }} />
      ))}
      <span>Claude está analizando...</span>
    </div>
  );
  if (!text) return null;
  return (
    <div style={{
      marginTop: '16px', padding: '18px',
      background: 'rgba(240,235,224,.03)', border: '1px solid rgba(240,235,224,.1)',
      borderRadius: '10px',
    }}>
      <div style={{ fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(240,235,224,.5)', marginBottom: '12px' }}>
        ✦ Análisis de Claude
      </div>
      <div style={{ fontSize: '0.9375rem', color: '#bbb', lineHeight: 1.85 }}>
        {text.split('\n\n').map((p, i) => <p key={i} style={{ marginBottom: '12px' }}>{p}</p>)}
      </div>
    </div>
  );
}

function ModuleShell({ icon, title, subtitle, children }: {
  icon: string; title: string; subtitle: string; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{
      background: '#1e1e1c',
      border: `1px solid ${open ? 'rgba(240,235,224,.15)' : '#2a2a28'}`,
      borderRadius: '14px', marginBottom: '10px', overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: '14px',
        padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
        textAlign: 'left', transition: 'background 0.18s',
      }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(240,235,224,.03)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'none')}
      >
        <span style={{ fontSize: '1.25rem', flexShrink: 0 }}>{icon}</span>
        <div style={{ flex: 1 }}>
          <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.9375rem', fontWeight: 800, color: '#f0f0f0', marginBottom: '3px', letterSpacing: '-0.02em' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.8125rem', color: '#555', lineHeight: 1.4 }}>{subtitle}</div>
        </div>
        <div style={{ color: '#444', fontSize: '0.75rem', flexShrink: 0, transition: 'transform 0.25s', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}>↓</div>
      </button>
      {open && (
        <div style={{ padding: '0 20px 20px', borderTop: '1px solid #222', animation: 'fadeUp 0.25s ease both' }}>
          {children}
        </div>
      )}
    </div>
  );
}

function Field({ label, value, onChange, placeholder, type = 'number' }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div style={{ marginBottom: '12px', marginTop: '14px' }}>
      <label style={{ display: 'block', fontSize: '0.5625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#555', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder || '0'}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', background: '#161614', border: '1.5px solid #2a2a28', color: '#f0f0f0',
          fontFamily: "'Epilogue', sans-serif", fontSize: '0.9375rem', fontWeight: 600,
          padding: '10px 12px', borderRadius: '8px', outline: 'none',
          MozAppearance: 'textfield' as any,
        }}
        onFocus={e => e.target.style.borderColor = '#f0ebe0'}
        onBlur={e => e.target.style.borderColor = '#2a2a28'}
      />
    </div>
  );
}

function MiniMetric({ label, value, color, sub }: { label: string; value: string; color?: string; sub?: string }) {
  return (
    <div style={{ background: '#161614', border: '1px solid #222', borderRadius: '10px', padding: '14px 12px' }}>
      <div style={{ fontSize: '0.5rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#444', marginBottom: '6px' }}>{label}</div>
      <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '1.0625rem', fontWeight: 800, letterSpacing: '-0.02em', color: color || '#f0ebe0' }}>{value}</div>
      {sub && <div style={{ fontSize: '0.625rem', color: '#444', marginTop: '4px' }}>{sub}</div>}
    </div>
  );
}

function BtnAnalyze({ onClick, loading, disabled }: { onClick: () => void; loading: boolean; disabled?: boolean }) {
  return (
    <button onClick={onClick} disabled={loading || disabled} style={{
      width: '100%', marginTop: '16px',
      background: '#f0ebe0', color: '#0a0a0a',
      fontFamily: "'Syne', sans-serif", fontWeight: 800,
      fontSize: '0.875rem', padding: '13px', borderRadius: '9px', border: 'none',
      cursor: loading || disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.5 : 1,
      transition: 'all 0.18s',
    }}>
      {loading ? 'Analizando...' : 'Analizar con IA →'}
    </button>
  );
}

// ── Loan ──────────────────────────────────────────────────────────────────
function LoanModule({ calc }: { calc: CalcResult }) {
  const [amount, setAmount] = useState('');
  const [payment, setPayment] = useState('');
  const [rate, setRate] = useState('');
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const p = parseFloat(payment) || 0;
  const newEbitda = calc.grossProfit - calc.fixedCosts - p;
  const newNet = newEbitda - calc.monthlyDebtPayment;
  const e10 = calc.revenue * 0.9 * calc.contributionMarginPct - calc.fixedCosts - p;
  const e20 = calc.revenue * 0.8 * calc.contributionMarginPct - calc.fixedCosts - p;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs. Un dueño evalúa tomar un préstamo.

NEGOCIO ACTUAL: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Runway ${isFinite(calc.runway) ? calc.runway.toFixed(1) + ' meses' : 'positivo'}, Caja ${fmtCLP(calc.cashAdjustedStart)}

PRÉSTAMO: Monto ${fmtCLP(parseFloat(amount) || 0)}, Cuota ${fmtCLP(p)}/mes, Tasa ${rate}% anual

IMPACTO: Nuevo EBITDA ${fmtCLP(newEbitda)}, Nuevo flujo neto ${fmtCLP(newNet)}, EBITDA si ventas −10% = ${fmtCLP(e10)}, si −20% = ${fmtCLP(e20)}

3 párrafos en español (máx 180 palabras): 1) ¿Puede pagar esta cuota cómodamente? 2) Riesgo principal y escenario peligroso 3) Recomendación concreta: ¿tomar, negociar o esperar?`);
    setAi(text);
    setLoading(false);
  };

  return (
    <ModuleShell icon="🏦" title="Simulador de préstamo" subtitle="¿Puedo pagar esta deuda sin ahogar el negocio?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="Monto del préstamo" value={amount} onChange={setAmount} placeholder="500000" />
        <Field label="Cuota mensual" value={payment} onChange={setPayment} placeholder="50000" />
      </div>
      <Field label="Tasa de interés anual (%)" value={rate} onChange={setRate} placeholder="12" />

      {p > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
          <MiniMetric label="Nuevo EBITDA" value={fmtCLP(newEbitda)} color={newEbitda >= 0 ? '#2dd4a0' : '#e85555'} sub={`vs ${fmtCLP(calc.ebitda)} actual`} />
          <MiniMetric label="Nuevo flujo neto" value={fmtCLP(newNet)} color={newNet >= 0 ? '#2dd4a0' : '#e85555'} sub="Después de deuda" />
          <MiniMetric label="Si ventas −10%" value={fmtCLP(e10)} color={e10 >= 0 ? '#2dd4a0' : '#e85555'} sub="EBITDA bajo estrés" />
          <MiniMetric label="Si ventas −20%" value={fmtCLP(e20)} color={e20 >= 0 ? '#2dd4a0' : '#e85555'} sub="EBITDA bajo estrés" />
        </div>
      )}
      <BtnAnalyze onClick={analyze} loading={loading} disabled={!p} />
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Hiring ────────────────────────────────────────────────────────────────
function HiringModule({ calc }: { calc: CalcResult }) {
  const [salary, setSalary] = useState('');
  const [role, setRole] = useState('');
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const totalCost = (parseFloat(salary) || 0) * 1.25;
  const newEbitda = calc.ebitda - totalCost;
  const extraRev = calc.contributionMarginPct > 0 ? totalCost / calc.contributionMarginPct : 0;
  const cushion = totalCost > 0 ? calc.cashAdjustedStart / totalCost : 0;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs. Un dueño evalúa contratar a alguien.

NEGOCIO: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Margen ${calc.grossMarginPct}%, Runway ${isFinite(calc.runway) ? calc.runway.toFixed(1) + 'm' : 'positivo'}, Caja ${fmtCLP(calc.cashAdjustedStart)}

CONTRATACIÓN: Rol "${role || 'no especificado'}", Sueldo ${fmtCLP(parseFloat(salary)||0)}, Costo total ${fmtCLP(totalCost)}/mes
Nuevo EBITDA: ${fmtCLP(newEbitda)}, Ventas extra necesarias: ${fmtCLP(extraRev)}, Colchón de caja: ${cushion.toFixed(1)} meses

3 párrafos en español (máx 180 palabras): 1) ¿Los fundamentos soportan esta contratación ahora? 2) Tiempo de colchón y qué necesita ocurrir para que sea rentable 3) ¿Contratar ahora, en X meses, o bajo qué condiciones?`);
    setAi(text);
    setLoading(false);
  };

  return (
    <ModuleShell icon="👤" title="Simulador de contratación" subtitle="¿El negocio soporta sumar a alguien al equipo?">
      <Field label="Rol o cargo" value={role} onChange={setRole} placeholder="Ej: vendedor, asistente..." type="text" />
      <Field label="Sueldo mensual bruto" value={salary} onChange={setSalary} placeholder="800000" />

      {parseFloat(salary) > 0 && (
        <>
          <div style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(240,235,224,.04)', border: '1px solid rgba(240,235,224,.08)', borderRadius: '8px', fontSize: '0.8125rem', color: '#888', lineHeight: 1.6 }}>
            💡 Costo real para el negocio: <strong style={{ color: '#f0ebe0' }}>{fmtCLP(totalCost)}/mes</strong> (incluye cargas ~25%)
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '10px' }}>
            <MiniMetric label="Nuevo EBITDA" value={fmtCLP(newEbitda)} color={newEbitda >= 0 ? '#2dd4a0' : '#e85555'} sub={`vs ${fmtCLP(calc.ebitda)}`} />
            <MiniMetric label="Ventas extra necesarias" value={fmtCLP(extraRev)} sub="Para cubrir el costo" />
            <MiniMetric label="Colchón de caja" value={`${cushion.toFixed(1)} meses`} color={cushion >= 3 ? '#2dd4a0' : '#f0b429'} sub="Para absorber el costo" />
            <MiniMetric label="% de ventas actuales" value={`${calc.revenue > 0 ? ((totalCost/calc.revenue)*100).toFixed(1) : 0}%`} sub="Del ingreso mensual" />
          </div>
        </>
      )}
      <BtnAnalyze onClick={analyze} loading={loading} disabled={!salary} />
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Crisis ────────────────────────────────────────────────────────────────
function CrisisModule({ calc }: { calc: CalcResult }) {
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const levers = [
    { icon: '📈', name: 'Subir precios 5%', impact: fmtCLP(calc.revenue * 0.05 * calc.contributionMarginPct) + ' EBITDA', ease: 'Difícil', easeColor: '#e85555' },
    { icon: '⚡', name: 'Cobrar 15 días antes', impact: fmtCLP((calc.revenue / 30) * 15) + ' en caja', ease: 'Moderado', easeColor: '#f0b429' },
    { icon: '✂️', name: 'Cortar costos fijos 10%', impact: fmtCLP(calc.fixedCosts * 0.1) + ' EBITDA', ease: 'Moderado', easeColor: '#f0b429' },
    { icon: '🤝', name: 'Extender pagos 30 días', impact: 'Mejora ciclo de caja', ease: 'Fácil', easeColor: '#2dd4a0' },
    { icon: '🚀', name: 'Aumentar ventas 10%', impact: fmtCLP(calc.revenue * 0.1 * calc.contributionMarginPct) + ' EBITDA', ease: 'Difícil', easeColor: '#e85555' },
    { icon: '💰', name: 'Cobrar cartera vencida', impact: fmtCLP(calc.wcCashTied * 0.5) + ' inmediato', ease: 'Fácil', easeColor: '#2dd4a0' },
  ];

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero para PyMEs en modo crisis. El dueño siente la caja apretada.

SITUACIÓN: Ventas ${fmtCLP(calc.revenue)}/mes, EBITDA ${fmtCLP(calc.ebitda)}, Flujo neto ${fmtCLP(calc.monthlyNetCashFlow)}, Caja ${fmtCLP(calc.cashAdjustedStart)}, Runway ${isFinite(calc.runway) ? calc.runway.toFixed(1) + 'm' : 'positivo'}, DSO ${calc.arDays}d, DPO ${calc.apDays}d, Efectivo atrapado ${fmtCLP(calc.wcCashTied)}, Costos fijos ${fmtCLP(calc.fixedCosts)}, Margen ${calc.grossMarginPct}%

PALANCAS: Subir precios 5% = +${fmtCLP(calc.revenue*0.05*calc.contributionMarginPct)} EBITDA (difícil) | Cobrar 15d antes = +${fmtCLP((calc.revenue/30)*15)} caja (moderado) | Cortar costos 10% = +${fmtCLP(calc.fixedCosts*0.1)} EBITDA (moderado) | Extender pagos = mejora ciclo (fácil) | Ventas +10% = +${fmtCLP(calc.revenue*0.1*calc.contributionMarginPct)} EBITDA (difícil) | Cartera vencida = +${fmtCLP(calc.wcCashTied*0.5)} (fácil)

3 párrafos en español (máx 200 palabras): 1) Raíz del problema de caja en este negocio 2) Las 2-3 palancas más impactantes y fáciles de ejecutar esta semana (con números) 3) Qué NO hacer: qué palanca parece fácil pero es una trampa`);
    setAi(text);
    setLoading(false);
  };

  return (
    <ModuleShell icon="🚨" title="Modo crisis — caja apretada" subtitle="¿Qué palancas debo activar y en qué orden?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '14px' }}>
        {levers.map((l, i) => (
          <div key={i} style={{ background: '#161614', border: '1px solid #222', borderRadius: '10px', padding: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.9375rem' }}>{l.icon}</span>
              <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f0f0f0', lineHeight: 1.3 }}>{l.name}</span>
            </div>
            <div style={{ fontFamily: "'Syne', sans-serif", fontSize: '0.875rem', fontWeight: 800, color: '#2dd4a0', marginBottom: '3px' }}>+{l.impact}</div>
            <div style={{ fontSize: '0.6875rem', color: l.easeColor }}>{l.ease}</div>
          </div>
        ))}
      </div>
      <BtnAnalyze onClick={analyze} loading={loading} />
      <AIResult text={ai} loading={loading} />
    </ModuleShell>
  );
}

// ── Monthly Close ─────────────────────────────────────────────────────────
function MonthlyCloseModule({ calc }: { calc: CalcResult }) {
  const [prevRev, setPrevRev] = useState('');
  const [prevEbitda, setPrevEbitda] = useState('');
  const [highlight, setHighlight] = useState('');
  const [ai, setAi] = useState('');
  const [loading, setLoading] = useState(false);

  const prev = parseFloat(prevRev) || 0;
  const prevE = parseFloat(prevEbitda) || 0;
  const revGrowth = prev > 0 ? ((calc.revenue - prev) / prev) * 100 : 0;
  const ebitdaGrowth = prevE !== 0 ? ((calc.ebitda - prevE) / Math.abs(prevE)) * 100 : 0;

  const analyze = async () => {
    setLoading(true);
    const text = await askClaude(`Eres un consultor financiero haciendo el cierre mensual de una PyME.

RESULTADOS: Ventas ${fmtCLP(calc.revenue)} (${prev > 0 ? (revGrowth >= 0 ? '+' : '') + revGrowth.toFixed(1) + '% vs mes anterior' : 'primer mes'}), EBITDA ${fmtCLP(calc.ebitda)} (${prevE !== 0 ? (ebitdaGrowth >= 0 ? '+' : '') + ebitdaGrowth.toFixed(1) + '%' : 'sin comparación'}), Margen ${calc.grossMarginPct}%, Runway ${isFinite(calc.runway) ? calc.runway.toFixed(1) + 'm' : 'positivo'}, Score ${calc.score}/100

LO MÁS IMPORTANTE DEL MES: ${highlight || 'No especificado'}

4 secciones cortas en español (máx 200 palabras total):
📊 CÓMO TE FUE: Una frase honesta. ¿Bien, regular, mal? ¿Qué número lo define?
🎯 DECISIÓN ESTA SEMANA: Una acción concreta para los próximos 7 días.
📅 FOCO DEL PRÓXIMO MES: La prioridad #1 con un número objetivo.
🔭 TRABAJO DE FONDO: Una cosa que construir en los próximos 3-6 meses.`);
    setAi(text);
    setLoading(false);
  };

  return (
    <ModuleShell icon="📅" title="Cierre mensual" subtitle="¿Cómo me fue y qué priorizo el próximo mes?">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <Field label="Ventas mes anterior" value={prevRev} onChange={setPrevRev} placeholder="0" />
        <Field label="EBITDA mes anterior" value={prevEbitda} onChange={setPrevEbitda} placeholder="0" />
      </div>
      <Field label="¿Qué fue lo más importante del mes?" value={highlight} onChange={setHighlight} placeholder="Ej: perdimos un cliente grande..." type="text" />

      {prev > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '4px' }}>
          <MiniMetric label="Crecimiento ventas" value={`${revGrowth >= 0 ? '+' : ''}${revGrowth.toFixed(1)}%`} color={revGrowth >= 0 ? '#2dd4a0' : '#e85555'} sub={`${fmtCLP(prev)} → ${fmtCLP(calc.revenue)}`} />
          <MiniMetric label="Cambio EBITDA" value={`${ebitdaGrowth >= 0 ? '+' : ''}${ebitdaGrowth.toFixed(1)}%`} color={ebitdaGrowth >= 0 ? '#2dd4a0' : '#e85555'} sub={`${fmtCLP(prevE)} → ${fmtCLP(calc.ebitda)}`} />
        </div>
      )}
      <BtnAnalyze onClick={analyze} loading={loading} />
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
        .page-topbar { height: 56px; border-bottom: 1px solid #2a2a28; display: flex; align-items: center; padding: 0 40px; background: #161614; position: sticky; top: 0; z-index: 40; }
        .page-title { font-family: 'Syne', sans-serif; font-size: 0.9375rem; font-weight: 800; color: #f0f0f0; letter-spacing: -0.02em; }
        .page-content { padding: 32px 40px 80px; max-width: 720px; }
        .page-sub { font-size: 0.875rem; color: #555; line-height: 1.6; margin-bottom: 24px; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulse { 0%,100% { opacity: 0.15; transform: scale(0.8); } 50% { opacity: 1; transform: scale(1); } }
      `}</style>

      <div className="page-topbar">
        <span className="page-title">Simuladores de decisión</span>
      </div>

      <div className="page-content">
        <p className="page-sub">
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
