import { Context } from 'hono';
import { GetTransactionsUseCase } from '../../../application/transactions/GetTransactionsUseCase';
import { CreateTransactionUseCase } from '../../../application/transactions/CreateTransactionUseCase';
import { UpdateTransactionUseCase } from '../../../application/transactions/UpdateTransactionUseCase';
import { DeleteTransactionUseCase } from '../../../application/transactions/DeleteTransactionUseCase';
import { BulkDeleteTransactionsUseCase } from '../../../application/transactions/BulkDeleteTransactionsUseCase';
import { transactionSchema, transactionUpdateSchema } from '../../../lib/validation';

export class TransactionController {
  constructor(
    private readonly getUseCase: GetTransactionsUseCase,
    private readonly createUseCase: CreateTransactionUseCase,
    private readonly updateUseCase: UpdateTransactionUseCase,
    private readonly deleteUseCase: DeleteTransactionUseCase,
    private readonly bulkDeleteUseCase: BulkDeleteTransactionsUseCase
  ) {}

  getAll = (c: Context) => {
    const month = c.req.query('month');
    const category = c.req.query('category');
    const type = c.req.query('type');
    const limit = c.req.query('limit') ? parseInt(c.req.query('limit')!, 10) : undefined;
    const offset = c.req.query('offset') ? parseInt(c.req.query('offset')!, 10) : undefined;
    const transactions = this.getUseCase.execute({ month, category, type, limit, offset });
    return c.json(transactions);
  };

  create = async (c: Context) => {
    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = transactionSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ error: 'Validation failed', details: parsed.error.flatten() }, 400);
    }

    const transaction = this.createUseCase.execute(parsed.data);
    return c.json(transaction, 201);
  };

  update = async (c: Context) => {
    const id = c.req.param('id')!;

    let body: unknown;
    try {
      body = await c.req.json();
    } catch {
      return c.json({ error: 'Invalid JSON body' }, 400);
    }

    const parsed = transactionUpdateSchema.safeParse(body);
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
