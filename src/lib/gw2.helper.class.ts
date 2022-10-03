import fetch from 'node-fetch';

enum urls {
  dailyAchievements = 'https://api.guildwars2.com/v2/achievements/daily',
  exchangeRateCoins = 'https://api.guildwars2.com/v2/commerce/exchange/coins',
  exchangeRateGems = 'https://api.guildwars2.com/v2/commerce/exchange/gems',
  tradingPost = 'https://api.guildwars2.com/v2/commerce/prices',
  items = 'https://api.guildwars2.com/v2/items',
  account = 'https://api.guildwars2.com/v2/account',
  characters = 'https://api.guildwars2.com/v2/characters',
}

class GuildWars2Helper {
  // Returns the current coins to gem exchange rate for a single gem.
  get coinToGemValue(): Promise<number> {
    return (async () => {
      try {
        const res = await fetch(`${urls.exchangeRateCoins}?quantity=1000000`);
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

  /**
   *
   * @param ids ID numbers of items to query
   * @returns Promise gw2.TradingPostItem[]
   */
  public async tradingPostQuery(ids: number[]): Promise<gw2.TradingPostItem[]> {
    try {
      // Resolve item Names
      const namesRes = await fetch(`${urls.items}?ids=${ids.join(',')}`);
      const namesJson: gw2.APIItem[] = await namesRes.json();
      // Resolve item Trading Post details
      const tradesRes = await fetch(`${urls.tradingPost}?ids=${ids.join(',')}`);
      const tradesJson: gw2.APITradingPostPrices[] = await tradesRes.json();

      return tradesJson.map((tj, idx) => ({
        name: namesJson[idx].name,
        buys: {
          quantity: tj.buys.quantity,
          price: this.friendlyCoinValue(tj.buys.unit_price),
        },
        sells: {
          quantity: tj.sells.quantity,
          price: this.friendlyCoinValue(tj.sells.unit_price),
        },
      }));
    } catch (error) {
      throw new Error();
    }
  }

  public async itemQuery(id: number): Promise<gw2.APIItem> {
    try {
      const res = await fetch(`${urls.items}/${id}`);
      return (await res.json()) as gw2.APIItem;
    } catch (error) {
      throw new Error();
    }
  }

  public async accountQuery(key: string): Promise<gw2.APIAccount> {
    try {
      const res = await fetch(`${urls.account}?access_token=${key}`);
      return await res.json();
    } catch (error) {
      throw new Error();
    }
  }

  public async characterList(key: string): Promise<string[]> {
    try {
      const res = await fetch(`${urls.characters}?access_token=${key}`);
      return await res.json();
    } catch (error) {
      throw new Error();
    }
  }

  public async character(
    key: string,
    character: string,
  ): Promise<gw2.APICharacter> {
    try {
      const res = await fetch(
        `${urls.characters}/${character}?access_token=${key}`,
      );
      return await res.json();
    } catch (error) {
      throw new Error();
    }
  }
}

export default GuildWars2Helper;
