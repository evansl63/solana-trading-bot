import { Filter, FilterResult } from './pool-filters';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';
import axios from 'axios';

export class RugRatioFilter implements Filter {
  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const response = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/sol/${poolKeys.baseMint}`);
      const data = response.data;

      if (data.code === 0 && data.data && data.data.token && data.data.token.rug_ratio === 1) {
        return { ok: false, message: 'RugRatio -> Token has a rug_ratio of 1' };
      }

      return { ok: true };
    } catch (error) {
      logger.error({ mint: poolKeys.baseMint }, 'RugRatio -> Failed to check rug_ratio');
    }

    return { ok: false, message: 'RugRatio -> Failed to check rug_ratio' };
  }
}