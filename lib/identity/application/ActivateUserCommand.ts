import { IUserRepository } from '../domain/IUserRepository';
import { Password } from '../domain/Password';
import { TokenService } from '../infrastructure/TokenService';
import { AuditLogService } from '../infrastructure/AuditLogService';
import { UserActivated } from '../domain/events/UserActivated';

interface ActivateUserInput {
  token: string;
  password: string;
  ip?: string;
}

interface ActivateUserResult {
  accessToken: string;
  refreshToken: string;
  email: string;
  plan: string;
  event: UserActivated;
}

export class ActivateUserCommand {
  constructor(
    private readonly userRepo: IUserRepository,
    private readonly tokenService: TokenService,
    private readonly auditLog: AuditLogService,
  ) {}

  async execute(input: ActivateUserInput): Promise<ActivateUserResult> {
    const payload = this.tokenService.verifyActivationToken(input.token);
    if (!payload) throw new Error('Enlace inválido o expirado');

    const existingUser = await this.userRepo.findByEmail(payload.email);
    if (!existingUser) throw new Error('No se encontró la cuenta. Contacta a soporte.');

    // Si ya está activado, verificar contraseña y emitir tokens
    if (existingUser.isActivated()) {
      if (!existingUser.verifyPassword(input.password)) {
        await this.auditLog.log(existingUser.id, existingUser.email, 'login_fail', input.ip);
        throw new Error('Esta cuenta ya está activa. La contraseña no coincide.');
      }
      await this.auditLog.log(existingUser.id, existingUser.email, 'login_ok', input.ip);
      return {
        accessToken:  this.tokenService.createAccessToken(existingUser.email, existingUser.plan.toString(), existingUser.id),
        refreshToken: this.tokenService.createRefreshToken(existingUser.email, existingUser.id),
        email: existingUser.email,
        plan:  existingUser.plan.toString(),
        event: new UserActivated(existingUser.id, existingUser.email, existingUser.plan.toString(), existingUser.schemaName ?? ''),
      };
    }

    // Activar: hashear contraseña, actualizar DB, crear schema de tenant
    const password    = Password.fromPlainText(input.password);
    const activated   = await this.userRepo.activate(existingUser.id, password.hash);
    if (!activated) throw new Error('Error al activar la cuenta.');

    const schemaName  = await this.userRepo.createTenantSchema(activated.id);
    const domainEvent = new UserActivated(activated.id, activated.email, activated.plan.toString(), schemaName);

    await this.auditLog.log(activated.id, activated.email, 'activated', input.ip);

    return {
      accessToken:  this.tokenService.createAccessToken(activated.email, activated.plan.toString(), activated.id),
      refreshToken: this.tokenService.createRefreshToken(activated.email, activated.id),
      email: activated.email,
      plan:  activated.plan.toString(),
      event: domainEvent,
    };
  }
}
