import type { StandardBlock } from './standard-block.types';

export interface StandardBlockRuleManager {
  replaceAll(blocks: StandardBlock[]): Promise<void>;
}
