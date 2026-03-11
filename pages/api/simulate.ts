// pages/api/simulate.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { calculate, simulateScenario, buildActions, SnapshotInputs, ScenarioParams } from '../../lib/engine';

type ReqBody = {
  snapshot: SnapshotInputs;
  scenario?: ScenarioParams;
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const body: ReqBody = req.body;
    if (!body || !body.snapshot) return res.status(400).json({ error: 'snapshot required' });

    // server-side validation could be stronger; keep minimal here
    const snapshot = body.snapshot;
    const scenario = body.scenario || { months: 12, applyWCTieAsInitial: true };

    // deterministic outputs
    const calc = calculate(snapshot);
    const projection = simulateScenario(snapshot, scenario);
    const actions = buildActions(snapshot);

    return res.status(200).json({
      ok: true,
      calc,
      projection,
      actions
    });
  } catch (err: any) {
    console.error('simulate error', err);
    return res.status(500).json({ error: err?.message || 'internal error' });
  }
}
