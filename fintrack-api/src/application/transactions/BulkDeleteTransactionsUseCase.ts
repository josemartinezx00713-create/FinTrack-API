import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';

export class BulkDeleteTransactionsUseCase {
  constructor(private readonly txRepo: ITransactionRepository) {}

  execute(ids: string[]): { deletedCount: number } {
    const result = this.txRepo.bulkDelete(ids);
    return { deletedCount: result.deleted };
  }
}
