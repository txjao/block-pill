import { z } from 'zod';
import { hostnameSchema } from '../../../shared/site/hostname.schema';

export const permanentBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('permanent-block/list') }),
  z.object({
    type: z.literal('permanent-block/add'),
    hostname: hostnameSchema,
  }),
]);

export type PermanentBlockRequest = z.input<typeof permanentBlockRequestSchema>;
export type ParsedPermanentBlockRequest = z.output<typeof permanentBlockRequestSchema>;
