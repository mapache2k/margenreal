import { TokenService, AccessPayload } from '../infrastructure/TokenService';

interface SessionResult {
  valid: true;
  email: string;
  plan: string;
  userId: number;
}

export class SessionQuery {
  constructor(private readonly tokenService: TokenService) {}

  execute(accessToken: string): SessionResult | { valid: false } {
    const payload: AccessPayload | null = this.tokenService.verifyAccessToken(accessToken);
    if (!payload) return { valid: false };
    return { valid: true, email: payload.email, plan: payload.plan, userId: payload.userId };
  }
}
