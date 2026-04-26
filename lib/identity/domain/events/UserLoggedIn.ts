import { DomainEvent } from '../../../shared/domain/DomainEvent';

export class UserLoggedIn extends DomainEvent {
  constructor(
    readonly userId: number,
    readonly email: string,
    readonly ip: string,
  ) { super(); }

  get eventName(): string { return 'identity.user_logged_in'; }
}
