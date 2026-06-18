import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Budget } from '../../domain/entities/Budget';

export class UpdateBudgetUseCase {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  execute(id: string, data: {
    category?: string;
    limitAmount?: number;
    month?: string;
  }): Budget | undefined {
    return this.budgetRepo.update(id, data);
  }
}
