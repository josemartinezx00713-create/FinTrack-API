import { Transaction } from './Transaction';

export class Budget {
  constructor(
    public readonly id: string,
    /** Nombre de categoría (texto, backward compat) */
    public readonly category: string,
    /** ID numérico de categoría (nuevo schema normalizado) */
    public readonly id_categoria: number | null,
    public readonly limitAmount: number,
    public readonly month: string,
    public readonly created_at: string | null
  ) {}

  getSpent(transactions: Transaction[]): number {
    return transactions
      .filter(t => t.type === 'expense' && (
        (this.id_categoria !== null && t.id_categoria === this.id_categoria) ||
        t.category === this.category
      ))
      .reduce((sum, t) => sum + t.amount, 0);
  }

  getRemaining(transactions: Transaction[]): number {
    return this.limitAmount - this.getSpent(transactions);
  }

  getProgressPct(transactions: Transaction[]): number {
    const spent = this.getSpent(transactions);
    return this.limitAmount > 0 ? (spent / this.limitAmount) * 100 : 0;
  }

  isExceeded(transactions: Transaction[]): boolean {
    return this.getSpent(transactions) > this.limitAmount;
  }

  static fromRow(row: Record<string, unknown>): Budget {
    return new Budget(
      row.id as string,
      (row.category_name as string) || (row.category as string),
      (row.id_categoria as number) ?? null,
      Number(row.limitAmount),
      row.month as string,
      (row.created_at as string) ?? null
    );
  }
}

export interface BudgetStatus {
  id: string;
  category: string;
  limitAmount: number;
  month: string;
  spent: number;
  remaining: number;
  percentUsed: number;
}
