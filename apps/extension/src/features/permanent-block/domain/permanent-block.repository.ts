import type { PermanentBlock } from './permanent-block.types';

export interface PermanentBlockRepository {
  getAll(): Promise<PermanentBlock[]>;
  setAll(blocks: PermanentBlock[]): Promise<void>;
}
