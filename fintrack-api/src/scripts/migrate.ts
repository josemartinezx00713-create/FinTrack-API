import fs from 'fs';
import path from 'path';
import { getDb, generateId } from '../infrastructure/persistence/database';

interface DBSchema {
  transactions?: Array<{
    id?: string; amount: number; type: string; category: string;
    description?: string; date: string; currency?: string;
  }>;
  budgets?: Array<{
    id?: string; category: string; limitAmount: number; month: string;
  }>;
  goals?: Array<{
    id?: string; name: string; target: number; current?: number; deadline: string;
  }>;
}

const DB_JSON_PATH = path.join(__dirname, '../../db.json');
const TRANSACTIONS_BATCH = 500;

function migrate(): void {
  if (!fs.existsSync(DB_JSON_PATH)) {
    console.log('No db.json found — nothing to migrate.');
    return;
  }

  console.log('Reading db.json...');
  const raw = fs.readFileSync(DB_JSON_PATH, 'utf-8');
  const data: DBSchema = JSON.parse(raw);
  const db = getDb();

  // --- Migrate transactions ---
  let txCount = 0;
  const insertTx = db.prepare(`
    INSERT OR IGNORE INTO transactions (id, amount, type, category, id_categoria, description, date, currency, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now','localtime'))
  `);

  db.transaction(() => {
    for (const t of data.transactions || []) {
      const catRow = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(t.category) as { id: number } | undefined;
      insertTx.run(
        t.id || generateId(),
        t.amount,
        t.type,
        t.category,
        catRow?.id ?? null,
        t.description || '',
        t.date,
        t.currency || 'C$'
      );
      txCount++;
      if (txCount % TRANSACTIONS_BATCH === 0) {
        process.stdout.write(`\r  Transactions: ${txCount}`);
      }
    }
  })();
  console.log(`\n  ✓ Transactions: ${txCount} imported`);

  // --- Migrate budgets ---
  let bgCount = 0;
  const insertBg = db.prepare(`
    INSERT OR IGNORE INTO budgets (id, category, id_categoria, limitAmount, month, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
  `);

  db.transaction(() => {
    for (const b of data.budgets || []) {
      const catRow = db.prepare('SELECT id FROM categorias WHERE nombre = ?').get(b.category) as { id: number } | undefined;
      insertBg.run(b.id || generateId(), b.category, catRow?.id ?? null, b.limitAmount, b.month);
      bgCount++;
    }
  })();
  console.log(`  ✓ Budgets: ${bgCount} imported`);

  // --- Migrate goals ---
  let glCount = 0;
  const insertGl = db.prepare(`
    INSERT OR IGNORE INTO goals (id, name, target, current, deadline, created_at)
    VALUES (?, ?, ?, ?, ?, datetime('now','localtime'))
  `);

  db.transaction(() => {
    for (const g of data.goals || []) {
      insertGl.run(g.id || generateId(), g.name, g.target, g.current || 0, g.deadline);
      glCount++;
    }
  })();
  console.log(`  ✓ Goals: ${glCount} imported`);

  const total = txCount + bgCount + glCount;
  console.log(`\n✔ Migration complete. ${total} total records imported.`);
}

migrate();
