import { IExchangeRateApi } from '../domain/repositories/IExchangeRateApi';

export class ExchangeRateApi implements IExchangeRateApi {
  async fetchRates(baseCurrency: string): Promise<Record<string, number>> {
    const response = await fetch(`https://open.er-api.com/v6/latest/${baseCurrency}`);
    if (!response.ok) {
      throw new Error(`Exchange rate API responded with ${response.status}`);
    }
    const data = await response.json() as { rates: Record<string, number> };
    return data.rates;
  }
}
