export type TransactionType = 'income' | 'expense';

export class Transaction {
  constructor(
    public readonly id: string,
    public readonly amount: number,
    public readonly type: TransactionType,
    /** Nombre de categoría (texto, backward compat) */
    public readonly category: string,
    /** ID numérico de categoría (nuevo schema normalizado) */
    public readonly id_categoria: number | null,
    public readonly description: string,
    public readonly date: string,
    public readonly currency: string,
    public readonly created_at: string | null
  ) {}

  get signedAmount(): number {
    return this.type === 'income' ? this.amount : -this.amount;
  }

  get month(): string {
    return this.date.substring(0, 7);
  }

  static fromRow(row: Record<string, unknown>): Transaction {
    return new Transaction(
      row.id as string,
      Number(row.amount),
      row.type as TransactionType,
      (row.category_name as string) || (row.category as string),
      (row.id_categoria as number) ?? null,
      row.description as string,
      row.date as string,
      row.currency as string,
      (row.created_at as string) ?? null
    );
  }
}

export interface TransactionFilters {
  month?: string;
  category?: string;
  type?: string;
  limit?: number;
  offset?: number;
}
