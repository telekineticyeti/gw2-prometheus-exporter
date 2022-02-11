declare namespace gw2 {
  /**
   * Interface for the current coins to gems exchange rate.
   */
  interface APIExchangeRateCoins {
    /**
     * The number of coins you required for a single gem.
     */
    coins_per_gem: number;
    /**
     * The number of gems you get for the specified quantity of coins.
     */
    quantity: number;
  }

  interface APITradingPostPrices {
    id: number;
    whitelisted: boolean;
    buys: {
      quantity: number;
      unit_price: number;
    };
    sells: {
      quantity: number;
      unit_price: number;
    };
  }

  interface APIItem {
    id: number;
    description: string;
    name: string;
    type: string;
    level: number;
    rarity: string;
    vendor_value: number;
    game_types: ItemGameTypes[];
    flags: ItemFlags[];
    chat_link: string;
    icon: string;
  }

  type ItemFlags = 'NoSalvage' | 'NoSell';

  type ItemGameTypes = 'Activity' | 'Wvw' | 'Dungeon' | 'Pve';

  interface FriendlyCoinQuantity {
    gold: number;
    silver: number;
    copper: number;
  }

  interface ExchangeRateCoins extends FriendlyCoinQuantity {
    quantity: number;
  }

  interface TradingPostItem {
    buys: {
      quantity: number;
      price: FriendlyCoinQuantity;
    };
    sells: {
      quantity: number;
      price: FriendlyCoinQuantity;
    };
  }
}
