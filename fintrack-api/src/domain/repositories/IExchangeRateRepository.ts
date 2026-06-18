import { ExchangeRate } from '../entities/ExchangeRate';

export interface IExchangeRateRepository {
  getRates(baseCurrency: string): ExchangeRate[];
  getRate(baseCurrency: string, targetCurrency: string): ExchangeRate | undefined;
  upsertRates(baseCurrency: string, rates: Record<string, number>): void;
  isCacheFresh(baseCurrency: string, maxAgeMinutes?: number): boolean;
}
