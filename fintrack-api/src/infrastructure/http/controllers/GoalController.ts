import { Context } from 'hono';
import { GetGoalsUseCase } from '../../../application/goals/GetGoalsUseCase';
import { CreateGoalUseCase } from '../../../application/goals/CreateGoalUseCase';
import { DepositToGoalUseCase } from '../../../application/goals/DepositToGoalUseCase';
import { DeleteGoalUseCase } from '../../../application/goals/DeleteGoalUseCase';
import { BulkDeleteGoalsUseCase } from '../../../application/goals/BulkDeleteGoalsUseCase';
import { goalSchema, depositSchema } from '../../../lib/validation';

export class GoalController {
  constructor(
    private readonly getUseCase: GetGoalsUseCase,
    private readonly createUseCase: CreateGoalUseCase,
    private readonly depositUseCase: DepositToGoalUseCase,
    private readonly deleteUseCase: DeleteGoalUseCase,
    private readonly bulkDeleteUseCase: BulkDeleteGoalsUseCase
  ) {}

  getAll = (c: Context) => {
    return c.json(this.getUseCase.execute());
  };

  create = async (c: Context) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = goalSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    return c.json(this.createUseCase.execute(parsed.data), 201);
  };

  deposit = async (c: Context) => {
    const id = c.req.param('id')!;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = depositSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const updated = this.depositUseCase.execute(id, parsed.data.amount);
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
