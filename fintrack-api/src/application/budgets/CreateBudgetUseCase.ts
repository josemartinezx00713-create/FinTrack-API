import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Budget } from '../../domain/entities/Budget';

export class CreateBudgetUseCase {
  constructor(private readonly budgetRepo: IBudgetRepository) {}

  execute(data: {
    category: string;
    limitAmount: number;
    month: string;
  }): Budget {
    return this.budgetRepo.create(data);
  }
}
