'use client';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { usePro } from '../../lib/ProContext';

// carga dinámica del layout que usa hooks del cliente
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
      {/* TODO: mantuve todo tu CSS/JSX tal cual — lo dejé fuera por brevedad en este snippet */}
      {/* pega aquí el resto de tu JSX/CSS tal cual lo tenías */}
      <div style={{ padding: 40, maxWidth: 900, margin: '0 auto' }}>
        {/* tu contenido actual */}
      </div>
    </ProLayout>
  );
}
