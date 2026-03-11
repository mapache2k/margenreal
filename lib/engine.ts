// lib/engine.ts
// TypeScript deterministic engine for Margen Real Pro
// Exports: calculate, simulateScenario, impactPriceIncrease, impactReduceFixedCosts, impactReduceDSO, buildActions

export type SnapshotInputs = {
  revenue: number;               // monthly revenue
  grossMarginPct: number;        // e.g., 40 for 40%
  fixedCosts: number;            // monthly fixed costs
  cashOnHand: number;            // current cash
  debtBalance?: number | null;   // optional total debt balance (informational)
  monthlyDebtPayment: number;    // recurring monthly debt service
  arDays: number;                // receivable days
  apDays: number;                // payable days
  currency?: string;
};

export type ScenarioParams = {
  months?: number; // default 12
  revenueGrowth?: number | number[]; // per-month % growth, e.g., 0.02 or [0.02,0,0,...]
  monthlyFixedChange?: number | number[]; // delta to fixed costs
  monthlyDebtPaymentOverride?: number | number[];
  oneOffEvents?: { month: number; amount: number; label?: string }[]; // month is 1-indexed
  applyWCTieAsInitial?: boolean; // default true
};

export type CalcResult = {
  // normalized inputs
  revenue: number;
  grossMarginPct: number;
  fixedCosts: number;
  cashOnHand: number;
  debtBalance?: number | null;
  monthlyDebtPayment: number;
  arDays: number;
  apDays: number;

  // derived
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
  runway: number; // months or Infinity
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

function safeNum(x: unknown, fallback = 0): number {
  if (x === null || x === undefined || x === '') return fallback;
  const n = Number(x);
  return Number.isFinite(n) ? n : fallback;
}

export function calculate(inputs: SnapshotInputs): CalcResult {
  const revenue = safeNum(inputs.revenue, 0);
  const grossMarginPct = safeNum(inputs.grossMarginPct, 0);
  const fixedCosts = safeNum(inputs.fixedCosts, 0);
  const cashOnHand = safeNum(inputs.cashOnHand, 0);
  const debtBalance = inputs.debtBalance === undefined ? null : safeNum(inputs.debtBalance, 0);
  const monthlyDebtPayment = safeNum(inputs.monthlyDebtPayment, 0);
  const arDays = Math.max(0, Math.round(safeNum(inputs.arDays, 0)));
  const apDays = Math.max(0, Math.round(safeNum(inputs.apDays, 0)));

  const grossProfit = revenue * (grossMarginPct / 100);
  const ebitda = grossProfit - fixedCosts;
  const monthlyNetCashFlow = ebitda - monthlyDebtPayment;

  const wcGapDays = arDays - apDays;
  const avgDailyRevenue = revenue / 30;
  const wcCashTied = avgDailyRevenue * wcGapDays;
  const cashAdjustedStart = cashOnHand - wcCashTied;

  const monthlyObligations = fixedCosts + monthlyDebtPayment;
  const contributionMarginPct = grossMarginPct / 100;
  const breakevenRevenue = contributionMarginPct > 0 ? (monthlyObligations / contributionMarginPct) : Infinity;

  const monthlyBurn = monthlyNetCashFlow < 0 ? Math.abs(monthlyNetCashFlow) : 0;
  const runway = monthlyBurn > 0 ? cashAdjustedStart / monthlyBurn : Infinity;

  const ebitda_minus10 = ((revenue * 0.9) * contributionMarginPct) - fixedCosts - monthlyDebtPayment;
  const ebitda_minus20 = ((revenue * 0.8) * contributionMarginPct) - fixedCosts - monthlyDebtPayment;
  const ebitda_plus10 = ((revenue * 1.1) * contributionMarginPct) - fixedCosts - monthlyDebtPayment;

  function runwayIf(ebitdaScenario: number) {
    const monthlyNet = ebitdaScenario - monthlyDebtPayment;
    const burn = monthlyNet < 0 ? Math.abs(monthlyNet) : 0;
    return burn > 0 ? (cashAdjustedStart / burn) : Infinity;
  }

  const runway_minus10 = runwayIf(ebitda_minus10);
  const runway_minus20 = runwayIf(ebitda_minus20);
  const runway_plus10 = runwayIf(ebitda_plus10);

  let score = 0;
  if (ebitda > 0) score += 30;
  if (runway === Infinity || runway > 12) score += 20;
  if (grossMarginPct >= 30) score += 20;
  if (ebitda_minus10 > 0) score += 15;
  if (wcGapDays <= 0) score += 15;
  score = Math.max(0, Math.min(100, Math.round(score)));

  const revenueGap = isFinite(breakevenRevenue) ? Math.max(0, breakevenRevenue - revenue) : null;
  const costGap = ebitda >= 0 ? 0 : Math.abs(ebitda);
  const marginNeededPct = revenue > 0 ? ((monthlyObligations / revenue) * 100) : null;

  return {
    revenue, grossMarginPct, fixedCosts, cashOnHand, debtBalance, monthlyDebtPayment, arDays, apDays,
    grossProfit, ebitda, monthlyNetCashFlow,
    wcGapDays, wcCashTied, cashAdjustedStart,
    monthlyObligations, contributionMarginPct, breakevenRevenue,
    monthlyBurn, runway,
    sensitivities: {
      ebitda_minus10, ebitda_minus20, ebitda_plus10,
      runway_minus10, runway_minus20, runway_plus10
    },
    revenueGap, costGap, marginNeededPct, score
  };
}

export function simulateScenario(snapshot: SnapshotInputs, params: ScenarioParams = {}) {
  const months = Math.max(1, safeNum(params.months, 12));
  const base = calculate(snapshot);

  function resolveParam(param: number | number[] | undefined, idx: number, fallback = 0) {
    if (param === undefined || param === null) return fallback;
    if (Array.isArray(param)) return param[idx] === undefined ? fallback : param[idx];
    return param;
  }

  let cash = base.cashAdjustedStart;
  if (params.applyWCTieAsInitial === false) cash = base.cashOnHand;

  let revenue = base.revenue;
  const data: Array<any> = [];

  for (let m = 0; m < months; m++) {
    const growth = resolveParam(params.revenueGrowth, m, 0);
    if (Math.abs(growth) < 1 && growth > -1) revenue = revenue * (1 + growth);
    else if (growth >= 1 || growth <= -1) revenue = revenue * (growth);

    const fixed = base.fixedCosts + resolveParam(params.monthlyFixedChange, m, 0);
    const debtPayment = resolveParam(params.monthlyDebtPaymentOverride, m, base.monthlyDebtPayment);

    const events = (params.oneOffEvents || []).filter(e => e.month === m + 1);
    const oneOffTotal = events.reduce((s, e) => s + safeNum(e.amount, 0), 0);

    const gross = revenue * base.contributionMarginPct;
    const ebitda = gross - fixed;
    const monthlyNet = ebitda - debtPayment;

    cash += monthlyNet + oneOffTotal;

    data.push({
      month: m + 1,
      revenue,
      gross,
      fixed,
      ebitda,
      debtPayment,
      monthlyNet,
      oneOffTotal,
      cash
    });
  }

  return {
    baseSnapshot: base,
    months: data
  };
}

/* Lever helpers and action builder (kept lightweight) */
export function impactPriceIncrease(snapshot: SnapshotInputs, priceIncreasePct: number) {
  const base = calculate(snapshot);
  const pct = safeNum(priceIncreasePct, 0) / 100;
  const newRevenue = base.revenue * (1 + pct);
  const newGross = newRevenue * base.contributionMarginPct;
  const newEbitda = newGross - base.fixedCosts;
  const newMonthlyNet = newEbitda - base.monthlyDebtPayment;
  const newRunway = (newMonthlyNet < 0) ? base.cashAdjustedStart / Math.abs(newMonthlyNet) : Infinity;
  return { deltaEbitda: newEbitda - base.ebitda, newEbitda, newRunway, notes: `Price +${priceIncreasePct}%` };
}

export function impactReduceFixedCosts(snapshot: SnapshotInputs, reducePct: number) {
  const base = calculate(snapshot);
  const pct = safeNum(reducePct, 0) / 100;
  const newFixed = base.fixedCosts * (1 - pct);
  const newEbitda = base.grossProfit - newFixed;
  const newMonthlyNet = newEbitda - base.monthlyDebtPayment;
  const newRunway = (newMonthlyNet < 0) ? base.cashAdjustedStart / Math.abs(newMonthlyNet) : Infinity;
  return { deltaEbitda: newEbitda - base.ebitda, newEbitda, newRunway, notes: `Fixed costs -${reducePct}%` };
}

export function impactReduceDSO(snapshot: SnapshotInputs, reduceDays: number) {
  const base = calculate(snapshot);
  const rd = Math.round(safeNum(reduceDays, 0));
  const newAr = Math.max(0, base.arDays - rd);
  const newWcGap = newAr - base.apDays;
  const avgDailyRevenue = base.revenue / 30;
  const newWcCashTied = avgDailyRevenue * newWcGap;
  const freedCash = base.wcCashTied - newWcCashTied;
  const cashStart = base.cashAdjustedStart + freedCash;
  const monthlyBurn = base.monthlyNetCashFlow < 0 ? Math.abs(base.monthlyNetCashFlow) : 0;
  const newRunway = monthlyBurn > 0 ? (cashStart / monthlyBurn) : Infinity;
  return { freedCash, newRunway, deltaRunway: isFinite(base.runway) && isFinite(newRunway) ? newRunway - base.runway : null, notes: `DSO -${rd} days` };
}

export function buildActions(snapshot: SnapshotInputs) {
  const r = calculate(snapshot);
  const actions: Array<any> = [];

  if (isFinite(r.runway) && r.runway < 1 && r.ebitda < 0) {
    actions.push({ priority: 1, type: 'urgent', title: 'Critical runway', description: 'Collect receivables, defer costs, negotiate suppliers, consider short credit.' });
  } else if (isFinite(r.runway) && r.runway < 3 && r.ebitda < 0) {
    actions.push({ priority: 2, type: 'near_term', title: 'Limited runway', description: 'Reduce fixed costs and accelerate cash collection.' });
  }

  if (r.grossMarginPct < 25) actions.push({ priority: 1, type: 'margin', title: 'Increase margin', description: 'Review pricing and product mix.' });
  if (r.wcGapDays > 10) actions.push({ priority: 2, type: 'wc', title: 'Improve working capital', description: 'Shorten DSO or lengthen DPO.' });

  return actions.sort((a, b) => a.priority - b.priority);
}
