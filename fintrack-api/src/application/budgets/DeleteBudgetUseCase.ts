import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';

export class DeleteBudgetUseCase {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  execute(id: string): boolean {
    return this.budgetRepo.delete(id);
  }
}
