import { z } from 'zod';
import type { PermanentBlock } from '../domain/permanent-block.types';
import type { PermanentBlockController } from './permanent-block.controller';

const permanentBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('permanent-block/list') }),
  z.object({
    type: z.literal('permanent-block/add'),
    hostname: z.string(),
  }),
]);

export type PermanentBlockRequest = z.infer<typeof permanentBlockRequestSchema>;
export type PermanentBlockResponse =
  { ok: true; blocks: PermanentBlock[] } | { ok: false; message: string };

export function parsePermanentBlockRequest(message: unknown): PermanentBlockRequest | undefined {
  const result = permanentBlockRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handlePermanentBlockRequest(
  controller: PermanentBlockController,
  request: PermanentBlockRequest,
): Promise<PermanentBlockResponse> {
  try {
    if (request.type === 'permanent-block/add') {
      await controller.add(request.hostname);
    }

    return { ok: true, blocks: await controller.list() };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar os bloqueios permanentes.',
    };
  }
}
