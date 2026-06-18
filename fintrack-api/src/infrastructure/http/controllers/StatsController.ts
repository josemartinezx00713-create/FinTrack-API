import { Context } from 'hono';
import { StatsService } from '../../../domain/services/StatsService';

export class StatsController {
  constructor(private readonly statsService: StatsService) {}

  summary = (c: Context) => {
    const month = c.req.query('month');
    if (!month) return c.json({ error: 'Month is required' }, 400);
    return c.json(this.statsService.getMonthlySummary(month));
  };

  byCategory = (c: Context) => {
    const month = c.req.query('month');
    if (!month) return c.json({ error: 'Month is required' }, 400);
    return c.json(this.statsService.getCategoryExpenses(month));
  };

  trends = (c: Context) => {
    const months = parseInt(c.req.query('months') || '6', 10);
    const safeMonths = Math.min(Math.max(months, 1), 24);
    return c.json(this.statsService.getMonthlyTrends(safeMonths));
  };

  topExpenses = (c: Context) => {
    const month = c.req.query('month');
    if (!month) return c.json({ error: 'Month is required' }, 400);
    const limit = parseInt(c.req.query('limit') || '5', 10);
    const safeLimit = Math.min(Math.max(limit, 1), 100);
    return c.json(this.statsService.getTopExpenses(month, safeLimit));
  };

  heatmap = (c: Context) => {
    const month = c.req.query('month');
    if (!month) return c.json({ error: 'Month is required' }, 400);
    return c.json(this.statsService.getHeatmapData(month));
  };
}
