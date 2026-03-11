'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export type SnapshotInputs = {
  revenue: string;
  grossMarginPct: string;
  fixedCosts: string;
  cashOnHand: string;
  monthlyDebtPayment: string;
  arDays: string;
  apDays: string;
  businessName: string;
};

export type CalcResult = {
  revenue: number;
  grossMarginPct: number;
  fixedCosts: number;
  cashOnHand: number;
  monthlyDebtPayment: number;
  arDays: number;
  apDays: number;
  grossProfit: number;
  ebitda: number;
  monthlyNetCashFlow: number;
  wcGapDays: number;
  wcCashTied: number;
  cashAdjustedStart: number;
  monthlyObligations: number;
  contributionMarginPct: number;
  breakevenRevenue: number;
  monthlyBurn: number;
  runway: number;
  sensitivities: {
    ebitda_minus10: number;
    ebitda_minus20: number;
    ebitda_plus10: number;
    runway_minus10: number;
    runway_minus20: number;
    runway_plus10: number;
  };
  revenueGap: number | null;
  costGap: number;
  marginNeededPct: number | null;
  score: number;
};

export type ProjectionMonth = {
  month: number;
  revenue: number;
  ebitda: number;
  cash: number;
};

export type Action = {
  priority: number;
  type: string;
  title: string;
  description: string;
};

export type ProData = {
  calc: CalcResult;
  projection: { months: ProjectionMonth[] };
  actions: Action[];
  diagnosis?: string;
} | null;

type ProContextType = {
  inputs: SnapshotInputs;
  setInputs: (i: SnapshotInputs) => void;
  data: ProData;
  setData: (d: ProData) => void;
  loading: boolean;
  setLoading: (v: boolean) => void;
  runDiagnostic: () => Promise<void>;
};

const defaultInputs: SnapshotInputs = {
  revenue: '',
  grossMarginPct: '',
  fixedCosts: '',
  cashOnHand: '',
  monthlyDebtPayment: '',
  arDays: '',
  apDays: '',
  businessName: '',
};

const ProContext = createContext<ProContextType>({} as ProContextType);

export function ProProvider({ children }: { children: ReactNode }) {
  const [inputs, setInputs] = useState<SnapshotInputs>(defaultInputs);
  const [data, setData] = useState<ProData>(null);
  const [loading, setLoading] = useState(false);

  const runDiagnostic = async () => {
    setLoading(true);
    try {
      const snapshot = {
        revenue: parseFloat(inputs.revenue) || 0,
        grossMarginPct: parseFloat(inputs.grossMarginPct) || 0,
        fixedCosts: parseFloat(inputs.fixedCosts) || 0,
        cashOnHand: parseFloat(inputs.cashOnHand) || 0,
        monthlyDebtPayment: parseFloat(inputs.monthlyDebtPayment) || 0,
        arDays: parseFloat(inputs.arDays) || 0,
        apDays: parseFloat(inputs.apDays) || 0,
      };

      const simRes = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ snapshot, scenario: { months: 12, applyWCTieAsInitial: true } }),
      });
      const simData = await simRes.json();
      if (!simData.ok) throw new Error(simData.error);

      // Get AI diagnosis in parallel
      const diagRes = await fetch('/api/diagnose', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calc: simData.calc }),
      });
      const diagData = await diagRes.json();

      setData({ ...simData, diagnosis: diagData.diagnosis || '' });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProContext.Provider value={{ inputs, setInputs, data, setData, loading, setLoading, runDiagnostic }}>
      {children}
    </ProContext.Provider>
  );
}

export const usePro = () => useContext(ProContext);
