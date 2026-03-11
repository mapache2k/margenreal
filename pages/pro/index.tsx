'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { usePro, SnapshotInputs } from '../../lib/ProContext';

// carga dinámica del layout que usa hooks/objetos del cliente
const ProLayout = dynamic(() => import('../../lib/ProLayout'), { ssr: false });

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
        .home-topbar {
          height: 56px; border-bottom: 1px solid #2a2a28;
          display: flex; align-items: center; padding: 0 40px;
          background: #161614; position: sticky; top: 0; z-index: 40;
        }
        .home-topbar-title {
          font-family: 'Syne', sans-serif;
          font-size: 0.9375rem; font-weight: 800;
          color: #f0f0f0; letter-spacing: -0.02em;
        }
        .home-content { padding: 48px 40px 80px; max-width: 620px; }
        .home-eyebrow {
          font-size: 0.625rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #f0ebe0; margin-bottom: 12px;
        }
        .home-title {
          font-family: 'Syne', sans-serif;
          font-size: clamp(1.75rem, 3vw, 2.5rem);
          font-weight: 800; letter-spacing: -0.02em;
          line-height: 1.15; color: #f0f0f0; margin-bottom: 10px;
        }
        .home-sub { font-size: 0.9375rem; color: #666; line-height: 1.7; margin-bottom: 40px; }

        .form-card {
          background: #1e1e1c;
          border: 1px solid #2a2a28;
          border-radius: 16px;
          padding: 28px;
        }
        .form-section {
          font-size: 0.5625rem; font-weight: 700;
          letter-spacing: 0.2em; text-transform: uppercase;
          color: #444; margin: 20px 0 12px;
          padding-bottom: 8px; border-bottom: 1px solid #222;
        }
        .form-section:first-child { margin-top: 0; }

        .field { margin-bottom: 14px; }
        .field label {
          display: block; font-size: 0.625rem; font-weight: 700;
          letter-spacing: 0.1em; text-transform: uppercase;
          color: #555; margin-bottom: 7px; line-height: 1;
        }
        .field input {
          width: 100%; background: #161614;
          border: 1.5px solid #2a2a28; color: #f0f0f0;
          font-family: 'Epilogue', sans-serif;
          font-size: 0.9375rem; font-weight: 600;
          padding: 10px 14px; border-radius: 8px; outline: none;
          transition: border-color 0.18s, box-shadow 0.18s;
          -moz-appearance: textfield;
        }
        .field input::-webkit-outer-spin-button,
        .field input::-webkit-inner-spin-button { -webkit-appearance: none; }
        .field input:focus {
          border-color: #f0ebe0;
          box-shadow: 0 0 0 3px rgba(240,235,224,.06);
        }
        .field input::placeholder { color: #2a2a28; font-weight: 400; }
        .field-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

        .btn-start {
          width: 100%; margin-top: 24px;
          background: #f0ebe0; color: #0a0a0a;
          font-family: 'Syne', sans-serif; font-weight: 800;
          font-size: 0.9375rem; padding: 15px; border-radius: 10px;
          border: none; cursor: pointer;
          transition: background 0.18s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.02em;
        }
        .btn-start:hover:not(:disabled) {
          background: #fff; transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(240,235,224,.15);
        }
        .btn-start:disabled { opacity: 0.5; cursor: not-allowed; }

        .btn-continue {
          width: 100%; margin-top: 10px;
          background: transparent;
          border: 1px solid #2a2a28; color: #555;
          font-family: 'Epilogue', sans-serif; font-size: 0.875rem; font-weight: 500;
          padding: 12px; border-radius: 10px; cursor: pointer;
          transition: all 0.18s;
        }
        .btn-continue:hover { border-color: #555; color: #f0f0f0; }

        .hint {
          font-size: 0.75rem; color: #444; line-height: 1.6;
          margin-top: 16px; text-align: center;
        }
      `}</style>

      <div className="home-topbar">
        <span className="home-topbar-title">Inicio</span>
      </div>

      <div className="home-content">
        <div className="home-eyebrow">margenreal pro</div>
        <h1 className="home-title">Tu co-piloto<br />financiero.</h1>
        <p className="home-sub">
          Ingresa los números de tu negocio una sola vez.
          Diagnóstico, simuladores y forecast te esperan del otro lado.
        </p>

        <div className="form-card">
          <div className="field">
            <label>Nombre del negocio (opcional)</label>
            <input
              type="text"
              placeholder="Ej: Panadería El Sol"
              value={inputs.businessName}
              onChange={e => setInputs({ ...inputs, businessName: e.target.value })}
            />
          </div>

          <div className="form-section">Ingresos y Margen</div>
          <div className="field">
            <label>Ventas mensuales</label>
            <input type="number" placeholder="0" value={inputs.revenue} onChange={set('revenue')} />
          </div>
          <div className="field">
            <label>Margen bruto (%)</label>
            <input type="number" placeholder="40" value={inputs.grossMarginPct} onChange={set('grossMarginPct')} />
          </div>

          <div className="form-section">Costos y Caja</div>
          <div className="field">
            <label>Costos fijos mensuales</label>
            <input type="number" placeholder="0" value={inputs.fixedCosts} onChange={set('fixedCosts')} />
          </div>
          <div className="field-row">
            <div className="field">
              <label>Caja disponible</label>
              <input type="number" placeholder="0" value={inputs.cashOnHand} onChange={set('cashOnHand')} />
            </div>
            <div className="field">
              <label>Deuda mensual</label>
              <input type="number" placeholder="0" value={inputs.monthlyDebtPayment} onChange={set('monthlyDebtPayment')} />
            </div>
          </div>

          <div className="form-section">Capital de Trabajo</div>
          <div className="field-row">
            <div className="field">
              <label>Días para cobrar</label>
              <input type="number" placeholder="30" value={inputs.arDays} onChange={set('arDays')} />
            </div>
            <div className="field">
              <label>Días para pagar</label>
              <input type="number" placeholder="30" value={inputs.apDays} onChange={set('apDays')} />
            </div>
          </div>

          <button className="btn-start" onClick={handleStart} disabled={loading || !inputs.revenue}>
            {loading ? 'Analizando tu negocio...' : 'Empezar diagnóstico →'}
          </button>

          {data && (
            <button className="btn-continue" onClick={() => router.push('/pro/diagnostico')}>
              Ver último diagnóstico →
            </button>
          )}
        </div>

        <p className="hint">🔒 Tus datos nunca se almacenan ni se comparten.</p>
      </div>
    </ProLayout>
  );
}
