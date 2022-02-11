const port =
  process.env.port && !isNaN(parseInt(process.env.port))
    ? parseInt(process.env.port)
    : 8080;

const apiKey = process.env.gw2_api_key;

const tradingPostIds = process.env.tradingpost_ids
  ?.split(',')
  .filter(id => !isNaN(parseInt(id.trim())))
  .map(id => parseInt(id.trim()));

const config = {
  port,
  apiKey,
  tradingPostIds,
};

export default config;
