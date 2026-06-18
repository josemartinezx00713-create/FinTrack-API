import { IExchangeRateRepository } from '../../domain/repositories/IExchangeRateRepository';
import { IExchangeRateApi } from '../../domain/repositories/IExchangeRateApi';

const BASE_CURRENCY = 'NIO';

export class RefreshExchangeRatesUseCase {
  constructor(
    private readonly rateRepo: IExchangeRateRepository,
    private readonly rateApi: IExchangeRateApi
  ) {}

  async execute() {
    const rates = await this.rateApi.fetchRates(BASE_CURRENCY);
    this.rateRepo.upsertRates(BASE_CURRENCY, rates);
    return { base_currency: BASE_CURRENCY, rates, cached: false };
  }
}
