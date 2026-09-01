import type {
  StandardBlock,
  StandardBlockSettings,
  StandardBlockSnapshot,
} from '../domain/standard-block.types';
import type { StandardBlockController } from './standard-block.controller';
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
    if (request.type === 'standard-blocking/add') {
      await controller.add(request.hostname);
    } else if (request.type === 'standard-blocking/remove') {
      await controller.remove(request.hostname);
    } else if (request.type === 'standard-blocking/status') {
      return {
        ok: true,
        snapshot: await controller.getStatus(request.hostname),
      };
    } else if (request.type === 'standard-blocking/request-access') {
      return {
        ok: true,
        snapshot: await controller.requestAccess(
          request.hostname,
          request.minutes,
          settings.globalCooldownMilliseconds,
        ),
      };
    } else if (request.type === 'standard-blocking/update-settings') {
      return {
        ok: true,
        settings: await controller.updateSettings(request.globalCooldownMilliseconds),
        blocks: await controller.list(),
      };
    } else if (request.type === 'standard-blocking/update-domain-cooldown') {
      await controller.setDomainCooldown(
        request.hostname,
        request.cooldownMilliseconds ?? undefined,
      );
    } else if (request.type === 'standard-blocking/add-subdomain-exception') {
      await controller.addAllowedSubdomain(request.hostname, request.subdomain);
    } else if (request.type === 'standard-blocking/settings') {
      return { ok: true, settings, blocks: await controller.list() };
    }

    return { ok: true, blocks: await controller.list() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível atualizar os bloqueios.',
    };
  }
}
