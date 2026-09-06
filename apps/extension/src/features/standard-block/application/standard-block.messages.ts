import type {
  StandardBlock,
  StandardBlockSettings,
  StandardBlockSnapshot,
} from '@/features/standard-block/domain/standard-block.types';
import type { StandardBlockController } from './standard-block.controller';
import { STANDARD_BLOCK_MESSAGE_TYPE } from './standard-block.messages.constants';
import {
  standardBlockRequestSchema,
  type ParsedStandardBlockRequest,
} from './standard-block.messages.schema';

export type {
  ParsedStandardBlockRequest,
  StandardBlockRequest,
} from './standard-block.messages.schema';

export type StandardBlockResponse =
  | { ok: true; blocks: StandardBlock[] }
  | { ok: true; snapshot: StandardBlockSnapshot }
  | { ok: true; context?: { hostname: string; attemptedHostname: string } }
  | { ok: true; settings: StandardBlockSettings; blocks: StandardBlock[] }
  | { ok: false; message: string };

export function parseStandardBlockRequest(
  message: unknown,
): ParsedStandardBlockRequest | undefined {
  const result = standardBlockRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleStandardBlockRequest(
  controller: StandardBlockController,
  request: ParsedStandardBlockRequest,
): Promise<StandardBlockResponse> {
  try {
    const settings = await controller.getSettings();
    if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.add) {
      await controller.add(request.hostname);
    } else if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.remove) {
      await controller.remove(request.hostname);
    } else if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.status) {
      return {
        ok: true,
        snapshot: await controller.getStatus(request.hostname),
      };
    } else if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.requestAccess) {
      return {
        ok: true,
        snapshot: await controller.requestAccess(
          request.hostname,
          request.minutes,
          settings.globalCooldownMilliseconds,
        ),
      };
    } else if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.updateSettings) {
      return {
        ok: true,
        settings: await controller.updateSettings(
          request.globalCooldownMilliseconds,
        ),
        blocks: await controller.list(),
      };
    } else if (
      request.type === STANDARD_BLOCK_MESSAGE_TYPE.updateDomainCooldown
    ) {
      await controller.setDomainCooldown(
        request.hostname,
        request.cooldownMilliseconds ?? undefined,
      );
    } else if (
      request.type === STANDARD_BLOCK_MESSAGE_TYPE.addSubdomainException
    ) {
      await controller.addAllowedSubdomain(request.hostname, request.subdomain);
    } else if (request.type === STANDARD_BLOCK_MESSAGE_TYPE.settings) {
      return { ok: true, settings, blocks: await controller.list() };
    }

    return { ok: true, blocks: await controller.list() };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar os bloqueios.',
    };
  }
}
