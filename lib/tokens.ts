import crypto from 'crypto';

const SECRET = process.env.TOKEN_SECRET ?? 'dev-secret-change-me';

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify<T>(token: string): T | null {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (sig !== expected) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as T & { exp?: number };
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export type ActivationPayload = { type: 'activation'; email: string; plan: string; orderId: string; exp: number };
export type SessionPayload    = { type: 'session';    email: string; plan: string; iat: number };

export function createActivationToken(email: string, plan: string, orderId: string): string {
  return sign({ type: 'activation', email, plan, orderId, exp: Date.now() + 7 * 24 * 60 * 60 * 1000 });
}

export function verifyActivationToken(token: string): ActivationPayload | null {
  const p = verify<ActivationPayload>(token);
  return p?.type === 'activation' ? p : null;
}

export function createSessionToken(email: string, plan: string): string {
  return sign({ type: 'session', email, plan, iat: Date.now() });
}

export function verifySessionToken(token: string): SessionPayload | null {
  const p = verify<SessionPayload>(token);
  return p?.type === 'session' ? p : null;
}
