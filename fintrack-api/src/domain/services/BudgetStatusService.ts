import { IBudgetRepository } from '../repositories/IBudgetRepository';
import { ITransactionRepository } from '../repositories/ITransactionRepository';
import { BudgetStatus } from '../entities/Budget';

export class BudgetStatusService {
  constructor(
    private readonly budgetRepo: IBudgetRepository,
    private readonly txRepo: ITransactionRepository
  ) {}

  getBudgetStatus(month: string): BudgetStatus[] {
    const budgets = this.budgetRepo.getAll(month);

    return budgets.map(b => {
      const expenses = this.txRepo.getAll({
        month,
        type: 'expense',
        category: b.id_categoria !== null ? undefined : b.category,
      }).filter(t => {
        if (b.id_categoria !== null) {
          return t.id_categoria === b.id_categoria;
        }
        return t.category === b.category;
      });

      const spent = expenses.reduce((sum, t) => sum + t.amount, 0);
      const remaining = b.limitAmount - spent;
      const percentUsed = b.limitAmount > 0 ? (spent / b.limitAmount) * 100 : 0;

      return {
        id: b.id,
        category: b.category,
        limitAmount: b.limitAmount,
        month: b.month,
        spent,
        remaining,
        percentUsed,
      };
    });
  }
}
