import type { PermanentBlock } from '../domain/permanent-block.types';
import type { PermanentBlockController } from './permanent-block.controller';
import {
  permanentBlockRequestSchema,
  type ParsedPermanentBlockRequest,
} from './permanent-block.messages.schema';

export type {
  PermanentBlockRequest,
  ParsedPermanentBlockRequest,
} from './permanent-block.messages.schema';
export type PermanentBlockResponse =
  { ok: true; blocks: PermanentBlock[] } | { ok: false; message: string };

export function parsePermanentBlockRequest(
  message: unknown,
): ParsedPermanentBlockRequest | undefined {
  const result = permanentBlockRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handlePermanentBlockRequest(
  controller: PermanentBlockController,
  request: ParsedPermanentBlockRequest,
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
