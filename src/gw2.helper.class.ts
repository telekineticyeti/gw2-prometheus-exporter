import fetch from 'node-fetch';

enum gw2ApiUrls {
  dailyAchievements = 'https://api.guildwars2.com/v2/achievements/daily',
  exchangeRateCoins = 'https://api.guildwars2.com/v2/commerce/exchange/coins',
  exchangeRateGems = 'https://api.guildwars2.com/v2/commerce/exchange/gems',
  tradingPost = 'https://api.guildwars2.com/v2/commerce/prices',
  items = 'https://api.guildwars2.com/v2/items',
}

class GuildWars2Helper {
  // Returns the current coins to gem exchange rate for a single gem.
  get coinToGemValue(): Promise<number> {
    return (async () => {
      try {
        const res = await fetch(
          `${gw2ApiUrls.exchangeRateCoins}?quantity=1000000`,
        );
        const json = await res.json();
        // const json: gw2.APIExchangeRateCoins = await res.json();
        return (json as gw2.APIExchangeRateCoins).coins_per_gem;
      } catch (error) {
        return 0;
      }
    })();
  }

  public async getExchangeRateGems(
    quantity = 400,
  ): Promise<gw2.ExchangeRateCoins> {
    try {
      const totalCoin = quantity * (await this.coinToGemValue);
      const coin = this.friendlyCoinValue(totalCoin);
      return {
        quantity,
        gold: coin.gold,
        silver: coin.silver,
        copper: coin.copper,
      };
    } catch (error) {
      throw new Error(`${error}`);
    }
  }

  /**
   * Convert total copper coin coint to equivalent Gold / Silver / Copper amount
   * @param coins number of copper coins.
   */
  public friendlyCoinValue(coins: number): gw2.FriendlyCoinQuantity {
    const gold = Math.trunc(coins / 10000);
    const silver = Math.trunc((coins % 10000) / 100);
    const copper = coins % 100;
    return {gold, silver, copper};
  }

  public async tradingPostQuery(id: number): Promise<gw2.TradingPostItem> {
    try {
      const res = await fetch(`${gw2ApiUrls.tradingPost}/${id}`);
      const json: gw2.APITradingPostPrices = await res.json();
      // return (json as gw2.TradingPostItem).coins_per_gem;
      return {
        buys: {
          quantity: json.buys.quantity,
          price: this.friendlyCoinValue(json.buys.unit_price),
        },
        sells: {
          quantity: json.sells.quantity,
          price: this.friendlyCoinValue(json.sells.unit_price),
        },
      };
    } catch (error) {
      throw new Error();
    }
  }

  public async itemQuery(id: number): Promise<gw2.APIItem> {
    try {
      const res = await fetch(`${gw2ApiUrls.items}/${id}`);
      return (await res.json()) as gw2.APIItem;
    } catch (error) {
      throw new Error();
    }
  }
}

export default GuildWars2Helper;
