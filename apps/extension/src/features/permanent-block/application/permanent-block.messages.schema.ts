import { z } from 'zod';
import { hostnameSchema } from '@/shared/web-address/domain';
import { PERMANENT_BLOCK_MESSAGE_TYPE } from './permanent-block.messages.constants';

export const permanentBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal(PERMANENT_BLOCK_MESSAGE_TYPE.list) }),
  z.object({
    type: z.literal(PERMANENT_BLOCK_MESSAGE_TYPE.add),
    hostname: hostnameSchema,
  }),
]);

export type PermanentBlockRequest = z.input<typeof permanentBlockRequestSchema>;
export type ParsedPermanentBlockRequest = z.output<typeof permanentBlockRequestSchema>;
