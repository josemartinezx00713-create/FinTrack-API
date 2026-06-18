import { getDb, generateId } from './database';
import { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';
import { Budget } from '../../domain/entities/Budget';

export class SqliteBudgetRepository implements IBudgetRepository {
  getAll(month?: string): Budget[] {
    const db = getDb();
    let sql = `
      SELECT b.*, c.nombre AS category_name
      FROM budgets b
      LEFT JOIN categorias c ON b.id_categoria = c.id
    `;
    const params: unknown[] = [];

    if (month) {
      sql += ' WHERE b.month = ?';
      params.push(month);
    }

    sql += ' ORDER BY b.month DESC, c.nombre';
    return (db.prepare(sql).all(...params) as Record<string, unknown>[]).map(Budget.fromRow);
  }

  getById(id: string): Budget | undefined {
    const db = getDb();
    const row = db.prepare(`
      SELECT b.*, c.nombre AS category_name
      FROM budgets b
      LEFT JOIN categorias c ON b.id_categoria = c.id
      WHERE b.id = ?
    `).get(id) as Record<string, unknown> | undefined;
    return row ? Budget.fromRow(row) : undefined;
  }

  findByCategoryAndMonth(category: string, month: string): Budget | undefined {
    const db = getDb();
    const row = db.prepare(`
      SELECT b.*, c.nombre AS category_name
      FROM budgets b
      LEFT JOIN categorias c ON b.id_categoria = c.id
      WHERE (c.nombre = ? OR b.category = ?) AND b.month = ?
      LIMIT 1
    `).get(category, category, month) as Record<string, unknown> | undefined;
    return row ? Budget.fromRow(row) : undefined;
  }

  create(data: { category: string; limitAmount: number; month: string }): Budget {
    const db = getDb();
    const id = generateId();

    const idCategoria = db.prepare(
      'SELECT id FROM categorias WHERE nombre = ?'
    ).get(data.category) as { id: number } | undefined;

    db.prepare(`
      INSERT INTO budgets (id, category, id_categoria, limitAmount, month, created_at)
      VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
    `).run(id, data.category, idCategoria?.id ?? null, Number(data.limitAmount), data.month);

    return this.getById(id)!;
  }

  update(id: string, data: Partial<{ category: string; limitAmount: number; month: string }>): Budget | undefined {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return undefined;

    const updates: string[] = [];
    const params: unknown[] = [];

    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);

      const idCategoria = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(data.category) as { id: number } | undefined;
      updates.push('id_categoria = ?');
      params.push(idCategoria?.id ?? null);
    }
    if (data.limitAmount !== undefined) {
      updates.push('limitAmount = ?');
      params.push(Number(data.limitAmount));
    }
    if (data.month !== undefined) {
      updates.push('month = ?');
      params.push(data.month);
    }

    if (updates.length === 0) return existing;

    params.push(id);
    db.prepare(`UPDATE budgets SET ${updates.join(', ')} WHERE id = ?`).run(...params);

    return this.getById(id);
  }

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM budgets WHERE id = ?').run(id);
    return result.changes > 0;
  }

  bulkDelete(ids: string[]): { deleted: number } {
    const db = getDb();
    const result = db.prepare(`DELETE FROM budgets WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
    return { deleted: result.changes };
  }
}
