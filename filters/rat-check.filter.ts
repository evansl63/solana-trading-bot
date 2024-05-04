import { Filter, FilterResult } from './pool-filters';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';
import axios from 'axios';

export class RatTraderFilter implements Filter {
  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const response = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/top_holders/sol/${poolKeys.baseMint}?tag=rat_trader`);
      const data = response.data;

      if (data.code === 0 && data.data) {
        const ratTraders = data.data;
        const ratTraderPercentageSum = ratTraders.reduce((sum: number, holder: any) => sum + holder.amount_percentage, 0);

        if (ratTraderPercentageSum > 0.5) {
          return { ok: false, message: `RatTrader -> Rat traders hold ${(ratTraderPercentageSum * 100).toFixed(2)}% of the token supply` };
        }

        return { ok: true, message: 'RatTrader -> Rat traders hold less than 50% of the token supply' };
      }

      return { ok: false, message: 'RatTrader -> Unable to retrieve top holders data' };
    } catch (error) {
      logger.error({ mint: poolKeys.baseMint }, 'RatTrader -> Failed to check for rat traders');
    }

    return { ok: false, message: 'RatTrader -> Failed to check for rat traders' };
  }
}