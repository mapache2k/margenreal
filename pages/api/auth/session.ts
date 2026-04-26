import type { NextApiRequest, NextApiResponse } from 'next';
import { verifySessionToken } from '../../../lib/tokens';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { session } = req.body as { session?: string };
  if (!session) return res.status(401).json({ valid: false });

  const payload = verifySessionToken(session);
  if (!payload)  return res.status(401).json({ valid: false });

  return res.status(200).json({ valid: true, email: payload.email, plan: payload.plan });
}
