import { Transaction, TransactionFilters } from '../entities/Transaction';

export interface ITransactionRepository {
  getAll(filters?: TransactionFilters): Transaction[];
  getById(id: string): Transaction | undefined;
  create(data: { amount: number; type: string; category: string; description: string; date: string; currency: string }): Transaction;
  update(id: string, data: Partial<{ amount: number; type: string; category: string; description: string; date: string; currency: string }>): Transaction | undefined;
  delete(id: string): boolean;
  bulkDelete(ids: string[]): { deleted: number };
}
