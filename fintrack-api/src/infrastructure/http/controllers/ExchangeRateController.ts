import { Context } from 'hono';
import { GetExchangeRatesUseCase, RefreshExchangeRatesUseCase } from '../../../application/exchange-rates';

export class ExchangeRateController {
  constructor(
    private readonly getUseCase: GetExchangeRatesUseCase,
    private readonly refreshUseCase: RefreshExchangeRatesUseCase
  ) {}

  getAll = async (c: Context) => {
    const result = await this.getUseCase.execute();
    return c.json(result);
  };

  getByCurrency = async (c: Context) => {
    const param = c.req.param('currency');
    if (!param) return c.json({ error: 'Currency parameter required' }, 400);
    const currency = param.toUpperCase();
    const result = await this.getUseCase.executeForCurrency(currency);
    if (!result) {
      return c.json({ error: `Rate for ${currency} not found` }, 404);
    }
    return c.json(result);
  };

  refresh = async (c: Context) => {
    try {
      const result = await this.refreshUseCase.execute();
      return c.json(result);
    } catch {
      return c.json({ error: 'Failed to fetch exchange rates' }, 502);
    }
  };
}
