import { IUserRepository } from '../domain/IUserRepository';
import { TokenService } from '../infrastructure/TokenService';
import { AuditLogService } from '../infrastructure/AuditLogService';
import { UserLoggedIn } from '../domain/events/UserLoggedIn';

interface LoginInput {
  email: string;
  password: string;
  ip?: string;
}

interface LoginResult {
  accessToken: string;
  refreshToken: string;
  email: string;
  plan: string;
  event: UserLoggedIn;
}

// Bloqueo: 5 intentos fallidos en 15 minutos (OWASP A07)
const MAX_FAILURES = 5;
const WINDOW_MS    = 15 * 60 * 1000;

export class LoginCommand {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: LoginInput): Promise<LoginResult> {
    const user = await this.userRepo.findByEmail(input.email);

    // Verificar lockout por intentos fallidos
    const failures = await this.auditLog.countRecentFailures(input.email, WINDOW_MS);
    if (failures >= MAX_FAILURES) {
      throw new Error('Cuenta bloqueada temporalmente. Intentá de nuevo en 15 minutos.');
    }

    if (!user || !user.isActivated() || !user.verifyPassword(input.password)) {
      if (user) await this.auditLog.log(user.id, input.email, 'login_fail', input.ip);
      throw new Error('Email o contraseña incorrectos');
    }

    await this.auditLog.log(user.id, user.email, 'login_ok', input.ip);

    return {
      accessToken:  this.tokenService.createAccessToken(user.email, user.plan.toString(), user.id),
      refreshToken: this.tokenService.createRefreshToken(user.email, user.id),
      email: user.email,
      plan:  user.plan.toString(),
      event: new UserLoggedIn(user.id, user.email, input.ip ?? ''),
    };
  }
}
