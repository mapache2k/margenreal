'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { usePro, SnapshotInputs } from '../../lib/ProContext';

const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: '0.5625rem', fontWeight: 800, letterSpacing: '0.18em',
      textTransform: 'uppercase', color: 'var(--muted-2)',
      margin: '24px 0 10px', paddingBottom: '8px',
      borderBottom: '1px solid var(--border)',
    }}>
      {children}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <label style={{
        display: 'block', fontSize: '0.625rem', fontWeight: 700,
        letterSpacing: '0.1em', textTransform: 'uppercase',
        color: 'var(--muted-2)', marginBottom: '7px',
      }}>
        {label}
      </label>
      {children}
      {hint && (
        <div style={{ fontSize: '0.6875rem', color: 'var(--muted-2)', marginTop: '4px', lineHeight: 1.4 }}>
          {hint}
        </div>
      )}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%', background: 'var(--bg)',
  border: '1.5px solid var(--border)', color: 'var(--text)',
  fontFamily: 'var(--font-display)', fontSize: '0.9375rem', fontWeight: 700,
  padding: '11px 14px', borderRadius: '9px', outline: 'none',
  boxSizing: 'border-box', transition: 'border-color 0.18s',
  MozAppearance: 'textfield' as any,
};

export default function ProHome() {
  const router = useRouter();
  const { inputs, setInputs, runDiagnostic, loading, data } = usePro();

  const set = (k: keyof SnapshotInputs) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setInputs({ ...inputs, [k]: e.target.value });

  const handleStart = async () => {
    await runDiagnostic();
    router.push('/pro/diagnostico');
  };

  return (
    <ProLayout>
      <style>{`
        .ph-wrap { padding: 40px 40px 80px; max-width: 600px; }
        @media(max-width:640px){ .ph-wrap { padding: 28px 20px 60px; } }
        .ph-hero { margin-bottom: 32px; }
        .ph-eyebrow { font-size: 0.5625rem; font-weight: 800; letter-spacing: 0.2em; text-transform: uppercase; color: var(--accent); margin-bottom: 10px; }
        .ph-title { font-family: var(--font-display); font-size: clamp(1.75rem, 3vw, 2.375rem); font-weight: 900; letter-spacing: -0.03em; line-height: 1.1; color: var(--text); margin-bottom: 10px; }
        .ph-sub { font-size: 0.9375rem; color: var(--muted); line-height: 1.7; }
        .ph-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; padding: 28px; }
        .ph-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        @media(max-width:480px){ .ph-row { grid-template-columns: 1fr; } }
        .ph-input { width: 100%; background: var(--bg); border: 1.5px solid var(--border); color: var(--text); font-family: var(--font-display); font-size: 0.9375rem; font-weight: 700; padding: 11px 14px; border-radius: 9px; outline: none; box-sizing: border-box; transition: border-color 0.18s; -moz-appearance: textfield; }
        .ph-input::-webkit-outer-spin-button, .ph-input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .ph-input:focus { border-color: var(--accent); }
        .ph-input::placeholder { color: var(--border); font-weight: 400; }
        .ph-btn {
          width: 100%; margin-top: 24px; background: var(--accent); color: var(--bg);
          font-family: var(--font-display); font-weight: 900; font-size: 1rem;
          padding: 16px; border-radius: 12px; border: none; cursor: pointer;
          transition: opacity 0.18s, transform 0.15s; letter-spacing: -0.01em;
        }
        .ph-btn:hover:not(:disabled) { opacity: 0.88; transform: translateY(-1px); }
        .ph-btn:disabled { opacity: 0.4; cursor: not-allowed; }
        .ph-btn-sec {
          width: 100%; margin-top: 10px; background: transparent;
          border: 1px solid var(--border); color: var(--muted);
          font-family: var(--font-display); font-size: 0.875rem; font-weight: 700;
          padding: 13px; border-radius: 10px; cursor: pointer; transition: all 0.18s;
        }
        .ph-btn-sec:hover { border-color: var(--accent); color: var(--accent); }
        .ph-hint { font-size: 0.75rem; color: var(--muted-2); line-height: 1.6; margin-top: 16px; text-align: center; }
        .ph-features { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; margin-bottom: 28px; }
        @media(max-width:480px){ .ph-features { grid-template-columns: 1fr; gap: 8px; } }
        .ph-feat { background: var(--surface); border: 1px solid var(--border); border-radius: 12px; padding: 14px; }
        .ph-feat-icon { font-size: 1.125rem; margin-bottom: 6px; }
        .ph-feat-title { font-size: 0.8125rem; font-weight: 700; color: var(--text); margin-bottom: 3px; }
        .ph-feat-sub { font-size: 0.75rem; color: var(--muted); line-height: 1.4; }
      `}</style>

      <div className="ph-wrap">
        <div className="ph-hero">
          <div className="ph-eyebrow">margenreal pro</div>
          <h1 className="ph-title">Tu co-piloto<br />financiero.</h1>
          <p className="ph-sub">Ingresa los números de tu negocio una vez. Diagnóstico, simuladores y forecast te esperan del otro lado.</p>
        </div>

        <div className="ph-features">
          <div className="ph-feat">
            <div className="ph-feat-icon">📊</div>
            <div className="ph-feat-title">Diagnóstico</div>
            <div className="ph-feat-sub">Score, runway y plan de acción</div>
          </div>
          <div className="ph-feat">
            <div className="ph-feat-icon">🔭</div>
            <div className="ph-feat-title">Forecast</div>
            <div className="ph-feat-sub">Proyección de caja a 24 meses</div>
          </div>
          <div className="ph-feat">
            <div className="ph-feat-icon">⚡</div>
            <div className="ph-feat-title">Simuladores</div>
            <div className="ph-feat-sub">Préstamos, hiring, crisis</div>
          </div>
        </div>

        <div className="ph-card">
          <Field label="Nombre del negocio (opcional)">
            <input className="ph-input" type="text" placeholder="Ej: Mi Tienda" value={inputs.businessName} onChange={e => setInputs({ ...inputs, businessName: e.target.value })} />
          </Field>

          <SectionLabel>Ingresos y margen</SectionLabel>

          <div className="ph-row">
            <Field label="Ventas mensuales" hint="Total facturado en un mes típico">
              <input className="ph-input" type="number" placeholder="0" value={inputs.revenue} onChange={set('revenue')} />
            </Field>
            <Field label="Margen bruto (%)" hint="(Ventas − costo de ventas) / ventas">
              <input className="ph-input" type="number" placeholder="40" value={inputs.grossMarginPct} onChange={set('grossMarginPct')} />
            </Field>
          </div>

          <SectionLabel>Costos y caja</SectionLabel>

          <Field label="Costos fijos mensuales" hint="Arriendo, sueldos, servicios — lo que pagas sí o sí">
            <input className="ph-input" type="number" placeholder="0" value={inputs.fixedCosts} onChange={set('fixedCosts')} />
          </Field>
          <div className="ph-row">
            <Field label="Caja disponible">
              <input className="ph-input" type="number" placeholder="0" value={inputs.cashOnHand} onChange={set('cashOnHand')} />
            </Field>
            <Field label="Deuda mensual" hint="Cuotas fijas de créditos">
              <input className="ph-input" type="number" placeholder="0" value={inputs.monthlyDebtPayment} onChange={set('monthlyDebtPayment')} />
            </Field>
          </div>

          <SectionLabel>Capital de trabajo</SectionLabel>

          <div className="ph-row">
            <Field label="Días para cobrar" hint="Promedio que tarda en entrar el dinero">
              <input className="ph-input" type="number" placeholder="30" value={inputs.arDays} onChange={set('arDays')} />
            </Field>
            <Field label="Días para pagar" hint="Promedio antes de pagar a proveedores">
              <input className="ph-input" type="number" placeholder="30" value={inputs.apDays} onChange={set('apDays')} />
            </Field>
          </div>

          <button className="ph-btn" onClick={handleStart} disabled={loading || !inputs.revenue}>
            {loading ? 'Analizando tu negocio...' : 'Generar diagnóstico →'}
          </button>

          {data && (
            <button className="ph-btn-sec" onClick={() => router.push('/pro/diagnostico')}>
              Ver último diagnóstico →
            </button>
          )}

          <p className="ph-hint">🔒 Tus datos nunca se almacenan ni se comparten.</p>
        </div>
      </div>
    </ProLayout>
  );
}
