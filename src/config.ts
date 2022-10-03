const port =
  process.env.port && !isNaN(parseInt(process.env.port))
    ? parseInt(process.env.port)
    : 8080;

const apiKeys = process.env.gw2_api_key
  ?.split(',')
  .filter(k => k.trim() !== '')
  .map(k => k.trim());

const tradingPostIds = process.env.tradingpost_ids
  ?.split(',')
  .filter(id => !isNaN(parseInt(id.trim())))
  .map(id => parseInt(id.trim()));

const config = {
  port,
  apiKeys,
  tradingPostIds,
};

export default config;
