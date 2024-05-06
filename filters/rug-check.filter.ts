import { Filter, FilterResult } from './pool-filters';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';
import axios from 'axios';

export class RugCheckFilter implements Filter {
  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const response = await axios.get(`https://gmgn.ai/defi/quotation/v1/tokens/sol/${poolKeys.baseMint}`);
      const data = response.data;

      if (data.code === 0 && data.data && data.data.token && data.data.token.rug_ratio > 0.1) {
        return { ok: false, message: 'GMGN Check -> Token has a rug_ratio greater than 10%' };
      }

      if (data.code === 0 && data.data && data.data.token && data.data.is_show_alert == 'true') {
        return { ok: false, message: 'GMGN Check -> Token has a warning alert' };
      }

      if (data.code === 0 && data.data && data.data.token && data.data.token.burn_ratio < 0.8) {
        return { ok: false, message: 'GMGN Check -> Liquidity pool isnt burnt' };
      }

      if (data.code === 0 && data.data && data.data.token && data.data.token.top_10_holder_rate > 0.5) {
        return { ok: false, message: 'GMGN Check -> Top 10 holders greater than 50%' };
      }

      if (data.code === 0 && data.data && data.data.token && data.data.token.renounced_mint < 1) {
        return { ok: false, message: 'GMGN Check -> mint is not renounced' };
      }
      
      if (data.code === 0 && data.data && data.data.token && data.data.token.renounced_freeze_account < 1) {
        return { ok: false, message: 'GMGN Check -> blacklist is not frozen' };
      }

      if (data.code === 0 && data.data && data.data.token && data.data.token.buy_volume_1m < 1000) {
        return { ok: false, message: 'GMGN Check -> 5m buy volume is less than 1000' };
      }

      return { ok: true };
    } catch (error) {
      logger.error({ mint: poolKeys.baseMint }, 'GMGN Check -> Failed to check token details');
    }

    return { ok: false, message: 'GMGN Check -> Failed to check token details' };
  }
}