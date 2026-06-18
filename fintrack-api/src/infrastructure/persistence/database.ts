import Database from 'better-sqlite3';
import path from 'path';

const DB_PATH = path.join(__dirname, '../../fintrack.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initSchema(db);
    migrateV2(db);
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}

function initSchema(database: Database.Database): void {
  database.exec(`
    CREATE TABLE IF NOT EXISTS categorias (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL UNIQUE,
      tipo TEXT NOT NULL CHECK(tipo IN ('income', 'expense', 'both')),
      icono TEXT DEFAULT ''
    );

    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL CHECK(amount >= 0),
      type TEXT NOT NULL CHECK(type IN ('income', 'expense')),
      category TEXT NOT NULL,
      id_categoria INTEGER REFERENCES categorias(id),
      description TEXT NOT NULL DEFAULT '',
      date TEXT NOT NULL,
      currency TEXT NOT NULL DEFAULT 'C$',
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS budgets (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      id_categoria INTEGER REFERENCES categorias(id),
      limitAmount REAL NOT NULL CHECK(limitAmount > 0),
      month TEXT NOT NULL CHECK(month GLOB '????-??'),
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS goals (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      target REAL NOT NULL CHECK(target > 0),
      current REAL NOT NULL DEFAULT 0 CHECK(current >= 0),
      deadline TEXT NOT NULL CHECK(deadline GLOB '????-??-??'),
      created_at TEXT
    );

    CREATE TABLE IF NOT EXISTS exchange_rates (
      base_currency TEXT NOT NULL,
      target_currency TEXT NOT NULL,
      rate REAL NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      PRIMARY KEY (base_currency, target_currency)
    );

    CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
    CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
    CREATE INDEX IF NOT EXISTS idx_budgets_month ON budgets(month);
  `);
}

function migrateV2(database: Database.Database): void {
  const tableInfo = database.pragma('table_info(transactions)') as { name: string }[];
  const hasIdCategoria = tableInfo.some(c => c.name === 'id_categoria');
  if (hasIdCategoria) return;

  database.exec(`
    -- 1. Poblar catalogo de categorias desde transactions existentes
    INSERT OR IGNORE INTO categorias (nombre, tipo)
    SELECT DISTINCT category, 'expense' FROM transactions WHERE type = 'expense';

    INSERT OR IGNORE INTO categorias (nombre, tipo)
    SELECT DISTINCT category, 'income' FROM transactions WHERE type = 'income'
    AND category NOT IN (SELECT nombre FROM categorias);

    -- 2. Asegurar que categorias de budgets tambien existan
    INSERT OR IGNORE INTO categorias (nombre, tipo)
    SELECT DISTINCT category, 'expense' FROM budgets
    WHERE category NOT IN (SELECT nombre FROM categorias);

    -- 3. Agregar columnas nuevas a transactions
    ALTER TABLE transactions ADD COLUMN id_categoria INTEGER REFERENCES categorias(id);
    ALTER TABLE transactions ADD COLUMN created_at TEXT;

    UPDATE transactions SET id_categoria = (
      SELECT id FROM categorias WHERE nombre = transactions.category
    );
    UPDATE transactions SET created_at = datetime('now', 'localtime') WHERE created_at IS NULL;

    -- 4. Agregar columnas nuevas a budgets
    ALTER TABLE budgets ADD COLUMN id_categoria INTEGER REFERENCES categorias(id);
    ALTER TABLE budgets ADD COLUMN created_at TEXT;

    UPDATE budgets SET id_categoria = (
      SELECT id FROM categorias WHERE nombre = budgets.category
    );
    UPDATE budgets SET created_at = datetime('now', 'localtime') WHERE created_at IS NULL;

    -- 5. Eliminar duplicados en budgets (conservar el primero)
    DELETE FROM budgets WHERE id NOT IN (
      SELECT MIN(id) FROM budgets GROUP BY COALESCE(id_categoria, -1), month
    );

    -- 5. Agregar created_at a goals
    ALTER TABLE goals ADD COLUMN created_at TEXT;
    UPDATE goals SET created_at = datetime('now', 'localtime') WHERE created_at IS NULL;

    -- 6. Indices compuestos y unicos (requieren id_categoria, se crean post-migracion)
    CREATE INDEX IF NOT EXISTS idx_transactions_categoria_fecha ON transactions(id_categoria, date);
    CREATE INDEX IF NOT EXISTS idx_transactions_tipo_fecha ON transactions(type, date);
    CREATE INDEX IF NOT EXISTS idx_budgets_month_categoria ON budgets(month, id_categoria);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_budgets_unique_categoria_month ON budgets(id_categoria, month);
  `);
}

export function generateId(): string {
  return crypto.randomUUID();
}
