import { getDb, generateId } from './database';
import { IGoalRepository } from '../../domain/repositories/IGoalRepository';
import { Goal } from '../../domain/entities/Goal';

export class SqliteGoalRepository implements IGoalRepository {
  getAll(): Goal[] {
    const db = getDb();
    return (db.prepare('SELECT * FROM goals ORDER BY deadline ASC').all() as Record<string, unknown>[]).map(Goal.fromRow);
  }

  getById(id: string): Goal | undefined {
    const db = getDb();
    const row = db.prepare('SELECT * FROM goals WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    return row ? Goal.fromRow(row) : undefined;
  }

  create(data: { name: string; target: number; current?: number; deadline: string }): Goal {
    const db = getDb();
    const goal = {
      id: generateId(),
      name: data.name,
      target: Number(data.target),
      current: Number(data.current || 0),
      deadline: data.deadline,
    };
    db.prepare(`
      INSERT INTO goals (id, name, target, current, deadline, created_at)
      VALUES (@id, @name, @target, @current, @deadline, datetime('now','localtime'))
    `).run(goal);
    return this.getById(goal.id)!;
  }

  deposit(id: string, amount: number): Goal | undefined {
    const db = getDb();
    const existing = this.getById(id);
    if (!existing) return undefined;

    const newCurrent = Math.min(existing.current + amount, existing.target);
    db.prepare('UPDATE goals SET current = ? WHERE id = ?').run(newCurrent, id);
    return this.getById(id);
  }

  delete(id: string): boolean {
    const db = getDb();
    const result = db.prepare('DELETE FROM goals WHERE id = ?').run(id);
    return result.changes > 0;
  }

  bulkDelete(ids: string[]): { deleted: number } {
    const db = getDb();
    const result = db.prepare(`DELETE FROM goals WHERE id IN (${ids.map(() => '?').join(',')})`).run(...ids);
    return { deleted: result.changes };
  }
}
