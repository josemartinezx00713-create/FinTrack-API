export interface IExchangeRateApi {
  fetchRates(baseCurrency: string): Promise<Record<string, number>>;
}
