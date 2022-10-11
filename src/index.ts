import * as http from 'http';
import GuildWars2Helper from './lib/gw2.helper.class';
import PrometheusHelperClass from './lib/prometheus.helper.class';
import config from './config';

const gw2 = new GuildWars2Helper();
const prom = new PrometheusHelperClass();

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

const gw2_trade_prices = async (ids: number[]) => {
  const data = await gw2.tradingPostQuery(ids);
  const type = 'gauge';

  let help = 'Trading post buy price for items (demand)';
  let name = 'gw2_trading_post_buy_price';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(
        `${d.buys.price.gold}.${d.buys.price.silver}${d.buys.price.copper}`,
      ),
      labels: [{name: d.name}],
    });
  });

  help = 'Trading post sell price for items (supply)';
  name = 'gw2_trading_post_sell_price';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(
        `${d.sells.price.gold}.${d.sells.price.silver}${d.sells.price.copper}`,
      ),
      labels: [{name: d.name}],
    });
  });

  help = 'Trading post buy price for items (demand)';
  name = 'gw2_trading_post_buy_price_coin';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(`${d.buys.coin}`),
      labels: [{name: d.name}],
    });
  });

  help = 'Trading post sell price for items (supply)';
  name = 'gw2_trading_post_sell_price_coin';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(`${d.sells.coin}`),
      labels: [{name: d.name}],
    });
  });

  help = 'Trading post buys quantity for items (demand)';
  name = 'gw2_trading_post_buy_quantity';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(`${d.buys.quantity}`),

      labels: [{name: d.name}],
    });
  });

  help = 'Trading post sells quantity for items (supply)';
  name = 'gw2_trading_post_sell_quantity';
  prom.logMetric({help, type, name});
  data.forEach(d => {
    prom.logMetric({
      name,
      value: prom.value(`${d.sells.quantity}`),
      labels: [{name: d.name}],
    });
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
server.listen(config.port);

console.log('Server started', `http://localhost:${config.port}/metrics`)

server.on('request', async (req, res) => {
  if (req.url !== '/metrics') {
    res.writeHead(500);
    res.end();
    return;
  }

  prom.metricReport = '';

  try {
    await Promise.all([
      ...metricTasks.map(prom => prom.func()),
      ...(!!config.tradingPostIds
        ? [gw2_trade_prices(config.tradingPostIds)]
        : []),
    ]);
    res.writeHead(200);
    res.end(`${prom.metricReport}`);
  } catch (error) {
    res.writeHead(500);
  }
});
