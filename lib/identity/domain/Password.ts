import crypto from 'crypto';
import { ValueObject } from '../../shared/domain/ValueObject';

interface PasswordProps { hash: string }

export class Password extends ValueObject<PasswordProps> {
  static readonly MIN_LENGTH = 8;

  private constructor(props: PasswordProps) { super(props); }

  static fromPlainText(plain: string): Password {
    if (plain.length < Password.MIN_LENGTH) {
      throw new Error(`La contraseña debe tener al menos ${Password.MIN_LENGTH} caracteres`);
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
    return new Password({ hash: `${salt}:${hash}` });
  }

  static fromHash(hash: string): Password {
    return new Password({ hash });
  }

  verify(plain: string): boolean {
    if (!this.props.hash) return false;
    const [salt, stored] = this.props.hash.split(':');
    const hash = crypto.scryptSync(plain, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(stored, 'hex'));
  }

  get hash(): string { return this.props.hash; }

  isEmpty(): boolean { return !this.props.hash; }
}
