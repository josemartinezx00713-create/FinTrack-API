import { SqliteTransactionRepository } from '../infrastructure/persistence/SqliteTransactionRepository';
import { SqliteBudgetRepository } from '../infrastructure/persistence/SqliteBudgetRepository';
import { SqliteGoalRepository } from '../infrastructure/persistence/SqliteGoalRepository';
import { SqliteExchangeRateRepository } from '../infrastructure/persistence/SqliteExchangeRateRepository';
import { ExchangeRateApi } from '../infrastructure/ExchangeRateApi';
import { StatsService } from '../domain/services/StatsService';
import { BudgetStatusService } from '../domain/services/BudgetStatusService';
import { GetTransactionsUseCase } from '../application/transactions/GetTransactionsUseCase';
import { CreateTransactionUseCase } from '../application/transactions/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../application/transactions/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../application/transactions/DeleteTransactionUseCase';
import { BulkDeleteTransactionsUseCase } from '../application/transactions/BulkDeleteTransactionsUseCase';
import { GetBudgetsUseCase } from '../application/budgets/GetBudgetsUseCase';
import { CreateBudgetUseCase } from '../application/budgets/CreateBudgetUseCase';
import { UpdateBudgetUseCase } from '../application/budgets/UpdateBudgetUseCase';
import { DeleteBudgetUseCase } from '../application/budgets/DeleteBudgetUseCase';
import { BulkDeleteBudgetsUseCase } from '../application/budgets/BulkDeleteBudgetsUseCase';
import { GetBudgetStatusUseCase } from '../application/budgets/GetBudgetStatusUseCase';
import { GetGoalsUseCase } from '../application/goals/GetGoalsUseCase';
import { CreateGoalUseCase } from '../application/goals/CreateGoalUseCase';
import { DepositToGoalUseCase } from '../application/goals/DepositToGoalUseCase';
import { DeleteGoalUseCase } from '../application/goals/DeleteGoalUseCase';
import { BulkDeleteGoalsUseCase } from '../application/goals/BulkDeleteGoalsUseCase';
import { GetExchangeRatesUseCase } from '../application/exchange-rates/GetExchangeRatesUseCase';
import { RefreshExchangeRatesUseCase } from '../application/exchange-rates/RefreshExchangeRatesUseCase';
import { TransactionController } from '../infrastructure/http/controllers/TransactionController';
import { BudgetController } from '../infrastructure/http/controllers/BudgetController';
import { GoalController } from '../infrastructure/http/controllers/GoalController';
import { StatsController } from '../infrastructure/http/controllers/StatsController';
import { ExchangeRateController } from '../infrastructure/http/controllers/ExchangeRateController';

export interface Container {
  transactionController: TransactionController;
  budgetController: BudgetController;
  goalController: GoalController;
  statsController: StatsController;
  exchangeRateController: ExchangeRateController;
}

export function buildContainer(): Container {
  const txRepo = new SqliteTransactionRepository();
  const budgetRepo = new SqliteBudgetRepository();
  const goalRepo = new SqliteGoalRepository();
  const rateRepo = new SqliteExchangeRateRepository();
  const rateApi = new ExchangeRateApi();

  const statsService = new StatsService(txRepo);
  const budgetStatusService = new BudgetStatusService(budgetRepo, txRepo);

  const getTxs = new GetTransactionsUseCase(txRepo);
  const createTx = new CreateTransactionUseCase(txRepo, budgetRepo);
  const updateTx = new UpdateTransactionUseCase(txRepo);
  const deleteTx = new DeleteTransactionUseCase(txRepo);
  const bulkDeleteTxs = new BulkDeleteTransactionsUseCase(txRepo);

  const getBudgets = new GetBudgetsUseCase(budgetRepo);
  const createBudget = new CreateBudgetUseCase(budgetRepo);
  const updateBudget = new UpdateBudgetUseCase(budgetRepo);
  const deleteBudget = new DeleteBudgetUseCase(budgetRepo);
  const bulkDeleteBudgets = new BulkDeleteBudgetsUseCase(budgetRepo);
  const getBudgetStatus = new GetBudgetStatusUseCase(budgetStatusService);

  const getGoals = new GetGoalsUseCase(goalRepo);
  const createGoal = new CreateGoalUseCase(goalRepo);
  const depositGoal = new DepositToGoalUseCase(goalRepo);
  const deleteGoal = new DeleteGoalUseCase(goalRepo);
  const bulkDeleteGoals = new BulkDeleteGoalsUseCase(goalRepo);

  const getRates = new GetExchangeRatesUseCase(rateRepo, rateApi);
  const refreshRates = new RefreshExchangeRatesUseCase(rateRepo, rateApi);

  return {
    transactionController: new TransactionController(getTxs, createTx, updateTx, deleteTx, bulkDeleteTxs),
    budgetController: new BudgetController(getBudgets, createBudget, updateBudget, deleteBudget, bulkDeleteBudgets, getBudgetStatus),
    goalController: new GoalController(getGoals, createGoal, depositGoal, deleteGoal, bulkDeleteGoals),
    statsController: new StatsController(statsService),
    exchangeRateController: new ExchangeRateController(getRates, refreshRates),
  };
}
