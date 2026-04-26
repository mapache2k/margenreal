'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { usePro, SnapshotInputs } from '../../lib/ProContext';

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
        .pro-section-divider {
          font-size: 0.5625rem; font-weight: 800; letter-spacing: 0.18em;
          text-transform: uppercase; color: var(--muted-2);
          margin: 20px 0 12px; padding-bottom: 8px;
          border-bottom: 1px solid var(--border);
        }
        .sf-hint { font-size: 0.6875rem; color: var(--muted-2); margin-top: 4px; line-height: 1.4; }
        @media(max-width:480px) { .pro-feat-grid { grid-template-columns: 1fr !important; } }
      `}</style>

      <div className="home-content">
        {/* Hero */}
        <div style={{ marginBottom: '32px' }}>
          <div className="section-label">margenreal pro</div>
          <h1 className="home-title">Tu co-piloto<br />financiero.</h1>
          <p className="home-sub">Ingresa los números de tu negocio una vez. Diagnóstico, simuladores y forecast te esperan del otro lado.</p>
        </div>

        {/* Feature cards */}
        <div className="pro-feat-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginBottom: '28px' }}>
          {[
            { icon: '📊', title: 'Diagnóstico', sub: 'Score, runway y plan de acción' },
            { icon: '🔭', title: 'Forecast',    sub: 'Proyección de caja a 24 meses' },
            { icon: '⚡', title: 'Simuladores', sub: 'Préstamos, hiring, crisis' },
          ].map(f => (
            <div key={f.title} className="hook-card">
              <div style={{ fontSize: '1.125rem', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '0.875rem', fontWeight: 800, color: 'var(--text)', marginBottom: '4px' }}>{f.title}</div>
              <div style={{ fontSize: '0.8125rem', color: 'var(--muted)', lineHeight: 1.5 }}>{f.sub}</div>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="form-card">
          <div className="sf">
            <label>Nombre del negocio (opcional)</label>
            <input type="text" placeholder="Ej: Mi Tienda" value={inputs.businessName}
              onChange={e => setInputs({ ...inputs, businessName: e.target.value })} />
          </div>

          <div className="pro-section-divider">Ingresos y margen</div>

          <div className="sf-row">
            <div className="sf">
              <label>Ventas mensuales</label>
              <input type="number" placeholder="0" value={inputs.revenue} onChange={set('revenue')} />
              <div className="sf-hint">Total facturado en un mes típico</div>
            </div>
            <div className="sf">
              <label>Margen bruto (%)</label>
              <input type="number" placeholder="40" value={inputs.grossMarginPct} onChange={set('grossMarginPct')} />
              <div className="sf-hint">(Ventas − costo de ventas) / ventas</div>
            </div>
          </div>

          <div className="pro-section-divider">Costos y caja</div>

          <div className="sf">
            <label>Costos fijos mensuales</label>
            <input type="number" placeholder="0" value={inputs.fixedCosts} onChange={set('fixedCosts')} />
            <div className="sf-hint">Arriendo, sueldos, servicios — lo que pagas sí o sí</div>
          </div>

          <div className="sf-row">
            <div className="sf">
              <label>Caja disponible</label>
              <input type="number" placeholder="0" value={inputs.cashOnHand} onChange={set('cashOnHand')} />
            </div>
            <div className="sf">
              <label>Deuda mensual</label>
              <input type="number" placeholder="0" value={inputs.monthlyDebtPayment} onChange={set('monthlyDebtPayment')} />
              <div className="sf-hint">Cuotas fijas de créditos</div>
            </div>
          </div>

          <div className="pro-section-divider">Capital de trabajo</div>

          <div className="sf-row">
            <div className="sf">
              <label>Días para cobrar</label>
              <input type="number" placeholder="30" value={inputs.arDays} onChange={set('arDays')} />
              <div className="sf-hint">Promedio que tarda en entrar el dinero</div>
            </div>
            <div className="sf">
              <label>Días para pagar</label>
              <input type="number" placeholder="30" value={inputs.apDays} onChange={set('apDays')} />
              <div className="sf-hint">Promedio antes de pagar a proveedores</div>
            </div>
          </div>

          <button className="btn-start" onClick={handleStart} disabled={loading || !inputs.revenue}>
            {loading ? 'Analizando tu negocio...' : 'Generar diagnóstico →'}
          </button>

          {data && (
            <button className="btn-continue" onClick={() => router.push('/pro/diagnostico')}>
              Ver último diagnóstico →
            </button>
          )}

          <p className="hint">🔒 Tus datos nunca se almacenan ni se comparten.</p>
        </div>
      </div>
    </ProLayout>
  );
}
