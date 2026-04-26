import crypto from 'crypto';

const SECRET = process.env.TOKEN_SECRET ?? 'dev-secret-change-me';

// Access token: 15 minutos
const ACCESS_TTL  = 15 * 60 * 1000;
// Refresh token: 7 días
const REFRESH_TTL = 7 * 24 * 60 * 60 * 1000;
// Activation token: 7 días
const ACTIVATION_TTL = 7 * 24 * 60 * 60 * 1000;

function sign(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const sig  = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verify<T>(token: string): T | null {
  try {
    const [data, sig] = token.split('.');
    const expected = crypto.createHmac('sha256', SECRET).update(data).digest('base64url');
    if (!crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(expected))) return null;
    const payload = JSON.parse(Buffer.from(data, 'base64url').toString()) as T & { exp?: number };
    if (payload.exp && payload.exp < Date.now()) return null;
    return payload;
  } catch { return null; }
}

export type ActivationPayload = { type: 'activation'; email: string; plan: string; orderId: string; exp: number };
export type AccessPayload     = { type: 'access';     email: string; plan: string; userId: number; exp: number };
export type RefreshPayload    = { type: 'refresh';    email: string; userId: number; jti: string; exp: number };

export class TokenService {
  createActivationToken(email: string, plan: string, orderId: string): string {
    return sign({ type: 'activation', email, plan, orderId, exp: Date.now() + ACTIVATION_TTL });
  }

  verifyActivationToken(token: string): ActivationPayload | null {
    const p = verify<ActivationPayload>(token);
    return p?.type === 'activation' ? p : null;
  }

  createAccessToken(email: string, plan: string, userId: number): string {
    return sign({ type: 'access', email, plan, userId, exp: Date.now() + ACCESS_TTL });
  }

  createRefreshToken(email: string, userId: number): string {
    const jti = crypto.randomBytes(16).toString('hex');
    return sign({ type: 'refresh', email, userId, jti, exp: Date.now() + REFRESH_TTL });
  }

  verifyAccessToken(token: string): AccessPayload | null {
    const p = verify<AccessPayload>(token);
    return p?.type === 'access' ? p : null;
  }

  verifyRefreshToken(token: string): RefreshPayload | null {
    const p = verify<RefreshPayload>(token);
    return p?.type === 'refresh' ? p : null;
  }
}
