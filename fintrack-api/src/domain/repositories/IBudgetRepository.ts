import { Budget } from '../entities/Budget';

export interface IBudgetRepository {
  getAll(month?: string): Budget[];
  getById(id: string): Budget | undefined;
  findByCategoryAndMonth(category: string, month: string): Budget | undefined;
  create(data: { category: string; limitAmount: number; month: string }): Budget;
  update(id: string, data: Partial<{ category: string; limitAmount: number; month: string }>): Budget | undefined;
  delete(id: string): boolean;
  bulkDelete(ids: string[]): { deleted: number };
}
