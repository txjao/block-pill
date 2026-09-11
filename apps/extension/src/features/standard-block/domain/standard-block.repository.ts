import type { StandardBlock } from './standard-block.types';

export interface StandardBlockRepository {
  getAll(): Promise<StandardBlock[]>;
  setAll(blocks: StandardBlock[]): Promise<void>;
}
