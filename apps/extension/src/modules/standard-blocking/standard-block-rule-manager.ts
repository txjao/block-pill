import type { StandardBlock } from "./standard-block";

export interface StandardBlockRuleManager {
  replaceAll(blocks: StandardBlock[]): Promise<void>;
}
