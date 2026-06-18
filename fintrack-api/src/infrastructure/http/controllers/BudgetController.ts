import { Context } from 'hono';
import { GetBudgetsUseCase } from '../../../application/budgets/GetBudgetsUseCase';
import { CreateBudgetUseCase } from '../../../application/budgets/CreateBudgetUseCase';
import { UpdateBudgetUseCase } from '../../../application/budgets/UpdateBudgetUseCase';
import { DeleteBudgetUseCase } from '../../../application/budgets/DeleteBudgetUseCase';
import { BulkDeleteBudgetsUseCase } from '../../../application/budgets/BulkDeleteBudgetsUseCase';
import { GetBudgetStatusUseCase } from '../../../application/budgets/GetBudgetStatusUseCase';
import { budgetSchema, budgetUpdateSchema } from '../../../lib/validation';

export class BudgetController {
  constructor(
    private readonly getUseCase: GetBudgetsUseCase,
    private readonly createUseCase: CreateBudgetUseCase,
    private readonly updateUseCase: UpdateBudgetUseCase,
    private readonly deleteUseCase: DeleteBudgetUseCase,
    private readonly bulkDeleteUseCase: BulkDeleteBudgetsUseCase,
    private readonly statusUseCase: GetBudgetStatusUseCase
  ) {}

  getAll = (c: Context) => {
    const month = c.req.query('month');
    return c.json(this.getUseCase.execute(month || undefined));
  };

  getStatus = (c: Context) => {
    const month = c.req.query('month');
    if (!month) return c.json({ error: 'Month is required' }, 400);
    return c.json(this.statusUseCase.execute(month));
  };

  create = async (c: Context) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = budgetSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    return c.json(this.createUseCase.execute(parsed.data), 201);
  };

  update = async (c: Context) => {
    const id = c.req.param('id')!;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = budgetUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const updated = this.updateUseCase.execute(id, parsed.data);
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  };

  delete = (c: Context) => {
    const id = c.req.param('id')!;
    const deleted = this.deleteUseCase.execute(id);
    if (!deleted) return c.json({ error: 'Not found' }, 404);
    return c.json({ success: true });
  };

  bulkDelete = async (c: Context) => {
    let body: { ids: string[] };
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    if (!Array.isArray(body.ids) || body.ids.length === 0) {
      return c.json({ error: 'ids array required' }, 400);
    }

    const result = this.bulkDeleteUseCase.execute(body.ids);
    return c.json({ success: true, ...result });
  };
}
