import type { PermanentBlock } from './permanent-block.types';

export interface PermanentBlockRuleManager {
  replaceAll(blocks: PermanentBlock[]): Promise<void>;
}
