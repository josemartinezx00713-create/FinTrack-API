import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { swaggerUI } from '@hono/swagger-ui';
import { openapiSpec } from './openapi';
import { buildContainer } from './di/container';

const container = buildContainer();

const app = new Hono();

app.use('*', cors());

app.route('/transactions', (() => {
  const r = new Hono();
  const c = container.transactionController;
  r.get('/', c.getAll);
  r.post('/', c.create);
  r.patch('/:id', c.update);
  r.delete('/:id', c.delete);
  r.post('/bulk-delete', c.bulkDelete);
  return r;
})());

app.route('/stats', (() => {
  const r = new Hono();
  const c = container.statsController;
  r.get('/summary', c.summary);
  r.get('/by-category', c.byCategory);
  r.get('/trends', c.trends);
  r.get('/top-expenses', c.topExpenses);
  r.get('/heatmap', c.heatmap);
  return r;
})());

app.route('/budgets', (() => {
  const r = new Hono();
  const c = container.budgetController;
  r.get('/', c.getAll);
  r.get('/status', c.getStatus);
  r.post('/', c.create);
  r.patch('/:id', c.update);
  r.delete('/:id', c.delete);
  r.post('/bulk-delete', c.bulkDelete);
  return r;
})());

app.route('/goals', (() => {
  const r = new Hono();
  const c = container.goalController;
  r.get('/', c.getAll);
  r.post('/', c.create);
  r.patch('/:id/deposit', c.deposit);
  r.delete('/:id', c.delete);
  r.post('/bulk-delete', c.bulkDelete);
  return r;
})());

app.route('/exchange-rates', (() => {
  const r = new Hono();
  const c = container.exchangeRateController;
  r.get('/', c.getAll);
  r.get('/:currency', c.getByCurrency);
  r.post('/refresh', c.refresh);
  return r;
})());

app.get('/swagger.json', (c) => c.json(openapiSpec));
app.get('/swagger', swaggerUI({ url: '/swagger.json' }));

app.get('/', (c) => c.text('FinTrack API is running'));

const port = 3000;
console.log(`Server is running on port ${port}`);
console.log(`Swagger UI is available at: http://localhost:${port}/swagger`);

serve({
  fetch: app.fetch,
  port
});
