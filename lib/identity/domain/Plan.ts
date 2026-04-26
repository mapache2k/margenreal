import { ValueObject } from '../../shared/domain/ValueObject';

type PlanType = 'free' | 'starter' | 'pro' | 'admin';

interface PlanProps { value: PlanType }

export class Plan extends ValueObject<PlanProps> {
  private constructor(props: PlanProps) { super(props); }

  static create(value: string): Plan {
    if (!['free', 'starter', 'pro', 'admin'].includes(value)) {
      throw new Error(`Plan inválido: ${value}`);
    }
    return new Plan({ value: value as PlanType });
  }

  static free():    Plan { return new Plan({ value: 'free' }); }
  static starter(): Plan { return new Plan({ value: 'starter' }); }
  static pro():     Plan { return new Plan({ value: 'pro' }); }
  static admin():   Plan { return new Plan({ value: 'admin' }); }

  get value(): PlanType { return this.props.value; }

  isPaid():  boolean { return !['free'].includes(this.props.value); }
  isPro():   boolean { return this.props.value === 'pro'; }
  isAdmin(): boolean { return this.props.value === 'admin'; }

  toString(): string { return this.props.value; }
}
