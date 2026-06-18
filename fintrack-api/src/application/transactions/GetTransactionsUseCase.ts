import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { TransactionFilters } from '../../domain/entities/Transaction';

export class GetTransactionsUseCase {
  constructor(private readonly txRepo: ITransactionRepository) {}

  execute(filters?: TransactionFilters) {
    return this.txRepo.getAll(filters);
  }
}
