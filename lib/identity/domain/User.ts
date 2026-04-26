import { Entity } from '../../shared/domain/Entity';
import { Plan } from './Plan';
import { Password } from './Password';

interface UserProps {
  email: string;
  password: Password;
  plan: Plan;
  orderId: string;
  schemaName: string | null;
  activatedAt: Date | null;
  createdAt: Date;
}

export class User extends Entity<number> {
  private props: UserProps;

  private constructor(id: number, props: UserProps) {
    super(id);
    this.props = props;
  }

  static create(id: number, props: UserProps): User {
    return new User(id, props);
  }

  get email():       string          { return this.props.email; }
  get plan():        Plan            { return this.props.plan; }
  get orderId():     string          { return this.props.orderId; }
  get schemaName():  string | null   { return this.props.schemaName; }
  get activatedAt(): Date | null     { return this.props.activatedAt; }
  get createdAt():   Date            { return this.props.createdAt; }
  get password():    Password        { return this.props.password; }

  isActivated(): boolean {
    return this.props.activatedAt !== null && !this.props.password.isEmpty();
  }

  verifyPassword(plain: string): boolean {
    return this.props.password.verify(plain);
  }
}
