import { getDb } from './database';
import { IExchangeRateRepository } from '../../domain/repositories/IExchangeRateRepository';
import { ExchangeRate } from '../../domain/entities/ExchangeRate';

export class SqliteExchangeRateRepository implements IExchangeRateRepository {
  getRates(baseCurrency: string): ExchangeRate[] {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM exchange_rates WHERE base_currency = ?
      ORDER BY target_currency
    `).all(baseCurrency) as ExchangeRate[];
  }

  getRate(baseCurrency: string, targetCurrency: string): ExchangeRate | undefined {
    const db = getDb();
    return db.prepare(`
      SELECT * FROM exchange_rates WHERE base_currency = ? AND target_currency = ?
    `).get(baseCurrency, targetCurrency) as ExchangeRate | undefined;
  }

  upsertRates(baseCurrency: string, rates: Record<string, number>): void {
    const db = getDb();
    const upsert = db.prepare(`
      INSERT INTO exchange_rates (base_currency, target_currency, rate, updated_at)
      VALUES (?, ?, ?, datetime('now'))
      ON CONFLICT(base_currency, target_currency)
      DO UPDATE SET rate = excluded.rate, updated_at = datetime('now')
    `);
    const insertMany = db.transaction((entries: [string, number][]) => {
      for (const [currency, rate] of entries) {
        upsert.run(baseCurrency, currency, rate);
      }
    });
    insertMany(Object.entries(rates));
  }

  isCacheFresh(baseCurrency: string, maxAgeMinutes = 60): boolean {
    const db = getDb();
    const row = db.prepare(`
      SELECT updated_at FROM exchange_rates
      WHERE base_currency = ?
      ORDER BY updated_at DESC LIMIT 1
    `).get(baseCurrency) as { updated_at: string } | undefined;

    if (!row) return false;

    const updated = new Date(row.updated_at + 'Z');
    const now = new Date();
    const diffMs = now.getTime() - updated.getTime();
    return diffMs < maxAgeMinutes * 60 * 1000;
  }
}
