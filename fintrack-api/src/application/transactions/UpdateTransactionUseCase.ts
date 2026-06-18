import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction } from '../../domain/entities/Transaction';

export class UpdateTransactionUseCase {
  constructor(private readonly txRepo: ITransactionRepository) {}

  execute(id: string, data: {
    amount?: number;
    type?: string;
    category?: string;
    description?: string;
    date?: string;
    currency?: string;
  }): Transaction | undefined {
    return this.txRepo.update(id, data);
  }
}
