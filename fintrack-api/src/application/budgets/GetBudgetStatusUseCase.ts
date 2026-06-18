import { BudgetStatusService } from '../../domain/services/BudgetStatusService';

export class GetBudgetStatusUseCase {
  constructor(private readonly budgetStatusService: BudgetStatusService) {}

  execute(month: string) {
    return this.budgetStatusService.getBudgetStatus(month);
  }
}
