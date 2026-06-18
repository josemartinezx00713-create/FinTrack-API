import { getDb, generateId } from './database';
import { ITransactionRepository } from '../../domain/repositories/ITransactionRepository';
import { Transaction, TransactionFilters } from '../../domain/entities/Transaction';

export class SqliteTransactionRepository implements ITransactionRepository {
  getAll(filters?: TransactionFilters): Transaction[] {
    const db = getDb();
    let sql = `
      SELECT t.*, c.nombre AS category_name
      FROM transactions t
      LEFT JOIN categorias c ON t.id_categoria = c.id
      WHERE 1=1
    `;
    const params: unknown[] = [];

    if (filters?.month) {
      sql += ' AND t.date LIKE ?';
      params.push(`${filters.month}%`);
    }
    if (filters?.category) {
      sql += ' AND (c.nombre = ? OR t.category = ?)';
      params.push(filters.category, filters.category);
    }
    if (filters?.type) {
      sql += ' AND t.type = ?';
      params.push(filters.type);
    }

    sql += ' ORDER BY t.date DESC, t.id DESC';

    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    if (filters?.offset) {
      sql += ' OFFSET ?';
      params.push(filters.offset);
    }

    return (db.prepare(sql).all(...params) as Record<string, unknown>[]).map(Transaction.fromRow);
  }

  getById(id: string): Transaction | undefined {
    const db = getDb();
    const row = db.prepare(`
      SELECT t.*, c.nombre AS category_name
      FROM transactions t
      LEFT JOIN categorias c ON t.id_categoria = c.id
      WHERE t.id = ?
    `).get(id) as Record<string, unknown> | undefined;
    return row ? Transaction.fromRow(row) : undefined;
  }

  create(data: { amount: number; type: string; category: string; description: string; date: string; currency: string }): Transaction {
    const db = getDb();
    const id = generateId();

    const idCategoria = db.prepare(
      'SELECT id FROM categorias WHERE nombre = ?'
    ).get(data.category) as { id: number } | undefined;

    db.prepare(`
      INSERT INTO transactions (id, amount, type, category, id_categoria, description, date, currency, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
    `).run(
      id,
      Number(data.amount),
      data.type,
      data.category,
      idCategoria?.id ?? null,
      data.description || '',
      data.date,
      data.currency || 'C$'
    );

    return this.getById(id)!;
  }

  update(id: string, data: Partial<{ amount: number; type: string; category: string; description: string; date: string; currency: string }>): Transaction | undefined {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return undefined;

    const updatedCategory = data.category ?? existing.category;
    let idCategoria = existing.id_categoria;
    if (data.category) {
      const row = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(data.category) as { id: number } | undefined;
      idCategoria = row?.id ?? null;
    }

    db.prepare(`
      UPDATE transactions SET
        amount = COALESCE(?, amount),
        type = COALESCE(?, type),
        category = COALESCE(?, category),
        id_categoria = ?,
        description = COALESCE(?, description),
        date = COALESCE(?, date),
        currency = COALESCE(?, currency)
      WHERE id = ?
    `).run(
      data.amount != null ? Number(data.amount) : null,
      data.type ?? null,
      data.category ?? null,
      idCategoria,
      data.description ?? null,
      data.date ?? null,
      data.currency ?? null,
      id
    );

    return this.getById(id);
  }

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM transactions WHERE id = ?').run(id);
    return result.changes > 0;
  }

  bulkDelete(ids: string[]): { deleted: number } {
    const db = getDb();
    const result = db.prepare(`DELETE FROM transactions WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
    return { deleted: result.changes };
  }
}
