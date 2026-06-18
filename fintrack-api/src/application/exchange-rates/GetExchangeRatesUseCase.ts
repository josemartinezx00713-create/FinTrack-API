import { IExchangeRateRepository } from '../../domain/repositories/IExchangeRateRepository';
import { IExchangeRateApi } from '../../domain/repositories/IExchangeRateApi';

const BASE_CURRENCY = 'NIO';

export class GetExchangeRatesUseCase {
  constructor(
    private readonly rateRepo: IExchangeRateRepository,
    private readonly rateApi: IExchangeRateApi
  ) {}

  async execute() {
    try {
      if (!this.rateRepo.isCacheFresh(BASE_CURRENCY, 60)) {
        const rates = await this.rateApi.fetchRates(BASE_CURRENCY);
        this.rateRepo.upsertRates(BASE_CURRENCY, rates);
      }
    } catch {
      // Silent fallback to cache
    }

    const cached = this.rateRepo.getRates(BASE_CURRENCY);
    const result: Record<string, number> = {};
    for (const r of cached) {
      result[r.target_currency] = r.rate;
    }
    return { base_currency: BASE_CURRENCY, rates: result, cached: true };
  }

  async executeForCurrency(targetCurrency: string) {
    try {
      if (!this.rateRepo.isCacheFresh(BASE_CURRENCY, 60)) {
        const rates = await this.rateApi.fetchRates(BASE_CURRENCY);
        this.rateRepo.upsertRates(BASE_CURRENCY, rates);
      }
    } catch {
      // Silent fallback to cache
    }

    const cached = this.rateRepo.getRate(BASE_CURRENCY, targetCurrency);
    if (!cached) return null;

    return {
      base_currency: BASE_CURRENCY,
      target_currency: targetCurrency,
      rate: cached.rate,
      updated_at: cached.updated_at,
      cached: true,
    };
  }
}
