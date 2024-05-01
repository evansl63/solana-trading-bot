import { Filter, FilterResult } from './pool-filters';
import { Connection } from '@solana/web3.js';
import { LiquidityPoolKeysV4 } from '@raydium-io/raydium-sdk';
import { logger } from '../helpers';
import axios from 'axios';

export class RiskLevelFilter implements Filter {
  constructor(private readonly connection: Connection) {}

  async execute(poolKeys: LiquidityPoolKeysV4): Promise<FilterResult> {
    try {
      const tokenAddress = poolKeys.baseMint.toBase58();
      const response = await axios.get(`https://api.rugcheck.xyz/v1/tokens/${tokenAddress}/report`);
      const data = response.data;

      if (data.risks.some((risk: any) => risk.level === 'danger')) {
        return { ok: false, message: 'RiskLevel -> Token has a danger risk level' };
      }

      return { ok: true };
    } catch (error) {
      logger.error({ mint: poolKeys.baseMint }, `Failed to check token risk level`);
    }

    return { ok: false, message: 'RiskLevel -> Failed to check token risk level' };
  }
}