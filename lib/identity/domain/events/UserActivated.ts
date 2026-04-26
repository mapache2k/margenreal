import { DomainEvent } from '../../../shared/domain/DomainEvent';

export class UserActivated extends DomainEvent {
  constructor(
    readonly userId: number,
    readonly email: string,
    readonly plan: string,
    readonly schemaName: string,
  ) { super(); }

  get eventName(): string { return 'identity.user_activated'; }
}
