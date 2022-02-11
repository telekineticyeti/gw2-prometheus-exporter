# Guild Wars 2 Prometheus Exporter

Exports data scraped from the Guild Wars 2 API, for ingestion by Prometheus.

## Configuration

Configuration is optional, however you will get more value out of the app by providing some values below.
Place a `.env` file in the repository directory containing your configured variables in `key=value` format.

```bash
port=8080 # The port that the internal webserver should use (optional, defaults to 8080)
gw2_api_key=YOUR-API-KEY # Your GW2 API key (optional)
tradingpost_ids=19976 # Comma-seperated list of item IDs to scrape trading post data for (optional)
gem_exchange_count=400 # The number of gems to be considered for the coin to gem exchange rate (default 400, optional)
```

## Accessing exported metrics

Once deployed using your preferred method below, metrics are accessed on the host machine's port 8080 via `/metrics` subpath. E.g: http://localhost:8080/metrics

Example output with `tradingpost_ids` environment variable set to `19976,24502`:

```txt
# HELP gw2_coin_to_gem_value The amount of copper coins required to purchase a single gem.
# Type gw2_coin_to_gem_value gauge
gw2_coin_to_gem_value 2832
# HELP gw2_exchange_rate The current exchange rate in gold coins for 400 gems.
# Type gw2_exchange_rate gauge
gw2_exchange_rate 113
gw2_trading_post_buy_price{name="Mystic Coin"} 1.69e+0
gw2_trading_post_sell_price{name="Mystic Coin"} 1.76e+0
gw2_trading_post_buy_quantity{name="Mystic Coin"} 2.879272e+6
gw2_trading_post_sell_quantity{name="Mystic Coin"} 5.6064e+4
gw2_trading_post_buy_price{name="Silver Doubloon"} 8.3e-1
gw2_trading_post_sell_price{name="Silver Doubloon"} 8.9e-1
gw2_trading_post_buy_quantity{name="Silver Doubloon"} 8.887e+3
gw2_trading_post_sell_quantity{name="Silver Doubloon"} 1.1349e+4
```

## Build and run with NodeJS

```bash
# Install dependencies
$ npm install

# Run the development server
$ npm run start

# Run the deployment server
$ npm run deploy
```

## Building the Docker image

```bash
$ docker build . -t gw2-prometheus-export
```

## Running the Docker image

Environment variable configuration is provided via `-e` flags in docker create command.

```docker
docker create \
 --name=gw2Exporter \
 -e port=8080 `# The port that the internal webserver should use (optional, defaults to 8080)` \
 -e gw2_api_key=YOUR-API-KEY `# Your GW2 API key (optional)` \
 -e tradingpost_ids=19976 `# Comma-seperated list of item IDs to scrape trading post data for (optional)` \
 -e gem_exchange_count=400 `# The number of gems to be considered for the coin to gem exchange rate (default 400, optional)` \
 -p 8080:8080/tcp `# Http` \
 --restart unless-stopped \
 gw2-prometheus-export
```

## Docker compose

Environment variable configuration provided yaml environment list.

```yaml
---
version: '2'
services:
  gw2Exporter:
    image: gw2-prometheus-export
    container_name: gw2Exporter
    restart: unless-stopped
    environment:
      - port # The port that the internal webserver should use (optional, defaults to 8080)
      - gw2_api_key=YOUR-API-KEY # Your GW2 API key (optional)
      - tradingpost_ids=19976 # Comma-seperated list of item IDs to scrape trading post data for (optional)
      - gem_exchange_count=400 # The number of gems to be considered for the coin to gem exchange rate (default 400, optional)
    ports:
      - 8080:8080/tcp # WebUI
```
