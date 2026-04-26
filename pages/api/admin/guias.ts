import type { NextApiRequest, NextApiResponse } from 'next';
import { getAllGuias } from '../../../lib/guias';

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const guias = getAllGuias(true).map(g => ({
    slug: g.slug,
    title: g.title,
    description: g.description,
    tags: g.tags,
    draft: g.draft ?? false,
  }));
  res.json({ guias });
}
