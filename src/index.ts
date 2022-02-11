import * as http from 'http';
import GuildWars2Helper from './gw2.helper.class';
import PrometheusHelperClass from './prometheus.helper.class';

const gw2 = new GuildWars2Helper();
const prom = new PrometheusHelperClass();

const port =
  process.env.port && !isNaN(parseInt(process.env.port))
    ? parseInt(process.env.port)
    : 8080;

const tradingPostIds = process.env.tradingpost_ids
  ?.split(',')
  .filter(id => !isNaN(parseInt(id.trim())))
  .map(id => parseInt(id.trim()));

const apiKey = process.env.gw2_api_key;

const gw2_coin_to_gem_value = async () => {
  const promVal = await gw2.coinToGemValue;

  prom.logMetric({
    name: 'gw2_coin_to_gem_value',
    help: 'The amount of copper coins required to purchase a single gem.',
    type: 'gauge',
    value: promVal,
  });
};

const gw2_exchange_rate = async () => {
  const promVal = await gw2.getExchangeRateGems();

  prom.logMetric({
    name: 'gw2_exchange_rate',
    help: 'The current exchange rate in gold coins for 400 gems.',
    type: 'gauge',
    value: promVal.gold,
  });
};

const gw2_trade_prices = async (id: number) => {
  const name = (await gw2.itemQuery(id)).name;
  const {buys, sells} = await gw2.tradingPostQuery(id);

  prom.logMetric({
    name: 'gw2_trading_post_buy_price',
    value: prom.value(
      `${buys.price.gold}.${buys.price.silver}.${buys.price.copper}`,
    ),
    labels: [{name}],
  });
  prom.logMetric({
    name: 'gw2_trading_post_sell_price',
    value: prom.value(
      `${sells.price.gold}.${sells.price.silver}.${sells.price.copper}`,
    ),
    labels: [{name}],
  });
  prom.logMetric({
    name: 'gw2_trading_post_buy_quantity',
    value: prom.value(`${buys.quantity}`),
    labels: [{name}],
  });
  prom.logMetric({
    name: 'gw2_trading_post_sell_quantity',
    value: prom.value(`${sells.quantity}`),
    labels: [{name}],
  });
};

/**
 * Set up metric tasks
 */
const metricTasks = [{func: gw2_coin_to_gem_value}, {func: gw2_exchange_rate}];

/**
 * Set up server
 */
const server = http.createServer();
server.listen(port);

server.on('request', async (req, res) => {
  if (req.url !== '/metrics') {
    res.writeHead(500);
    res.end();
    return;
  }

  prom.metricReport = '';

  console.log(apiKey);

  try {
    await Promise.all([
      ...metricTasks.map(prom => prom.func()),
      ...(!!tradingPostIds
        ? tradingPostIds.map(id => gw2_trade_prices(id))
        : []),
    ]);
    res.writeHead(200);
    res.end(`${prom.metricReport}`);
  } catch (error) {
    res.writeHead(500);
  }
});
