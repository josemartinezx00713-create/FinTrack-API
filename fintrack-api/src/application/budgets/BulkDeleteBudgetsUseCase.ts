import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';

export class BulkDeleteBudgetsUseCase {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  execute(ids: string[]): { deletedCount: number } {
    const result = this.budgetRepo.bulkDelete(ids);
    return { deletedCount: result.deleted };
  }
}
