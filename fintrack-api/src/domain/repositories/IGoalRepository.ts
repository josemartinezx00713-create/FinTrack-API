import { Goal } from '../entities/Goal';

export interface IGoalRepository {
  getAll(): Goal[];
  getById(id: string): Goal | undefined;
  create(data: { name: string; target: number; current?: number; deadline: string }): Goal;
  deposit(id: string, amount: number): Goal | undefined;
  delete(id: string): boolean;
  bulkDelete(ids: string[]): { deleted: number };
}
