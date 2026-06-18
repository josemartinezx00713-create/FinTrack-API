import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Transaction } from '../../domain/entities/Transaction';
import { Budget } from '../../domain/entities/Budget';

export class CreateTransactionUseCase {
  constructor(
    private readonly txRepo: ITransactionRepository,
    private readonly budgetRepo: IBudgetRepository
  ) {}

  execute(data: {
    amount: number;
    type: string;
    category: string;
    description: string;
    date: string;
    currency: string;
  }): Transaction {
    const tx = this.txRepo.create(data);

    // Validación de dominio: verificar presupuesto si es gasto
    if (tx.type === 'expense') {
      const month = tx.date.substring(0, 7);
      const budget = this.budgetRepo.findByCategoryAndMonth(tx.category, month);

      if (budget) {
        const monthTxs = this.txRepo.getAll({ month, type: 'expense' });
        const budgetEntity = Budget.fromRow({
          id: budget.id,
          category: budget.category,
          id_categoria: budget.id_categoria,
          category_name: budget.category,
          limitAmount: budget.limitAmount,
          month: budget.month,
          created_at: budget.created_at,
        });

        if (budgetEntity.isExceeded([...monthTxs])) {
          // No se rechaza la transacción, pero se notifica
          // Regla de negocio: el gasto se registra igual, el usuario ve la alerta
          (tx as any).budgetExceeded = true;
        }
      }
    }

    return tx;
  }
}
