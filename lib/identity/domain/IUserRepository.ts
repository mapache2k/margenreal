import { User } from './User';
import { Plan } from './Plan';

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  upsertPending(email: string, plan: Plan, orderId: string): Promise<User>;
  activate(userId: number, passwordHash: string): Promise<User | null>;
  createTenantSchema(userId: number): Promise<string>;
}
