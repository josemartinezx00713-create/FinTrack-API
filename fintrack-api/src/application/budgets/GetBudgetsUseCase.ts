import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Budget } from '../../domain/entities/Budget';

export class GetBudgetsUseCase {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  execute(month?: string): Budget[] {
    return this.budgetRepo.getAll(month);
  }
}
