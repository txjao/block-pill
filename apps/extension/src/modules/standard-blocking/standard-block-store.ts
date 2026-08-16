import type { StandardBlock } from "./standard-block";

export interface StandardBlockStore {
  getAll(): Promise<StandardBlock[]>;
  setAll(blocks: StandardBlock[]): Promise<void>;
}
