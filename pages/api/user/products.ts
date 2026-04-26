import type { NextApiRequest, NextApiResponse } from 'next';
import { TokenService } from '../../../lib/identity/infrastructure/TokenService';
import { withTenant } from '../../../lib/shared/infrastructure/db';

const tokenService = new TokenService();

function getSession(req: NextApiRequest) {
  const auth = req.headers.authorization ?? '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  return tokenService.verifyAccessToken(token);
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const session = getSession(req);
  if (!session) return res.status(401).json({ error: 'No autorizado' });

  const schemaName = `tenant_${session.userId}`;

  if (req.method === 'GET') {
    const rows = await withTenant(schemaName, async client => {
      const { rows } = await client.query(
        `SELECT id, nombre, categoria, precio, costo, margen_pct, detalle, created_at
         FROM calculations ORDER BY created_at DESC LIMIT 50`
      );
      return rows;
    });
    return res.status(200).json({ products: rows });
  }

  if (req.method === 'POST') {
    const { nombre, categoria, precio, costo, margen_pct, detalle } = req.body;
    if (!precio || !costo) return res.status(400).json({ error: 'Datos incompletos' });

    await withTenant(schemaName, async client => {
      await client.query(
        `INSERT INTO calculations (nombre, categoria, precio, costo, margen_pct, detalle)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [nombre || 'Sin nombre', categoria || '', precio, costo, margen_pct || 0, JSON.stringify(detalle ?? {})]
      );
    });
    return res.status(201).json({ ok: true });
  }

  if (req.method === 'DELETE') {
    const { id } = req.query;
    if (!id) return res.status(400).json({ error: 'Falta id' });

    await withTenant(schemaName, async client => {
      await client.query('DELETE FROM calculations WHERE id = $1', [Number(id)]);
    });
    return res.status(200).json({ ok: true });
  }

  return res.status(405).end();
}
