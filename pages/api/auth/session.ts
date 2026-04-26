import type { NextApiRequest, NextApiResponse } from 'next';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { SessionQuery } from '../../../lib/identity/application/SessionQuery';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end();

  const { session } = req.body as { session?: string };
  if (!session) return res.status(401).json({ valid: false });

  const query  = new SessionQuery(new TokenService());
  const result = query.execute(session);

  return res.status(result.valid ? 200 : 401).json(result);
}
