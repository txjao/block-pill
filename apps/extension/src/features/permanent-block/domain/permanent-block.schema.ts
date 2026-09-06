import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import {
  PERMANENT_BLOCK_RULE_ID_END,
  PERMANENT_BLOCK_RULE_ID_START,
} from './permanent-block.constants';

export const permanentBlockSchema = z.object({
  hostname: hostnameSchema,
  ruleId: z.number().int().min(PERMANENT_BLOCK_RULE_ID_START).max(PERMANENT_BLOCK_RULE_ID_END),
  createdAt: z.number().finite().nonnegative(),
});
