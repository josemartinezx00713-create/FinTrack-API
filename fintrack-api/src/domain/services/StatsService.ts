import { ITransactionRepository } from '../repositories/ITransactionRepository';

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
  savingsRate: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
  balance: number;
}

export class StatsService {
  constructor(private readonly txRepo: ITransactionRepository) {}

  getMonthlySummary(month: string): MonthlySummary {
    const transactions = this.txRepo.getAll({ month });

    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = income - expense;
    const savingsRate = income > 0 ? ((income - expense) / income) * 100 : 0;

    return { income, expense, balance, savingsRate };
  }

  getCategoryExpenses(month: string): Record<string, number> {
    const transactions = this.txRepo.getAll({ month, type: 'expense' });

    return transactions.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);
  }

  getMonthlyTrends(months: number): MonthlyTrend[] {
    const today = new Date();
    const result: MonthlyTrend[] = [];

    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const mStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;

      const summary = this.getMonthlySummary(mStr);
      result.push({
        month: mStr,
        income: summary.income,
        expense: summary.expense,
        balance: summary.balance,
      });
    }

    return result;
  }

  getTopExpenses(month: string, limit = 5) {
    const transactions = this.txRepo.getAll({ month, type: 'expense' });
    return transactions
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit);
  }

  getHeatmapData(month: string): Record<string, number> {
    const transactions = this.txRepo.getAll({ month, type: 'expense' });
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const grouped: Record<string, number> = {};

    for (const t of transactions) {
      const day = days[new Date(t.date).getDay()];
      grouped[day] = (grouped[day] || 0) + t.amount;
    }

    return grouped;
  }
}
