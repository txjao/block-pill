import { z } from 'zod';
import type { StandardBlock, StandardBlockSnapshot } from '../domain/standard-block.types';
import type { StandardBlockController } from './standard-block.controller';
import type { StandardBlockSettingsRepository } from '../domain/standard-block.settings-repository';
import type { StandardBlockSettings } from '../domain/standard-block.types';

const standardBlockRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('standard-blocking/list') }),
  z.object({
    type: z.literal('standard-blocking/add'),
    hostname: z.string(),
  }),
  z.object({
    type: z.literal('standard-blocking/remove'),
    hostname: z.string(),
  }),
  z.object({
    type: z.literal('standard-blocking/status'),
    hostname: z.string(),
  }),
  z.object({ type: z.literal('standard-blocking/context') }),
  z.object({
    type: z.literal('standard-blocking/request-access'),
    hostname: z.string(),
    minutes: z.union([z.literal(1), z.literal(5), z.literal(15)]),
  }),
  z.object({ type: z.literal('standard-blocking/settings') }),
  z.object({
    type: z.literal('standard-blocking/update-settings'),
    globalCooldownMilliseconds: z.number(),
  }),
  z.object({
    type: z.literal('standard-blocking/update-domain-cooldown'),
    hostname: z.string(),
    cooldownMilliseconds: z.number().nullable(),
  }),
  z.object({
    type: z.literal('standard-blocking/add-subdomain-exception'),
    hostname: z.string(),
    subdomain: z.string(),
  }),
]);

export type StandardBlockRequest = z.infer<typeof standardBlockRequestSchema>;

export type StandardBlockResponse =
  | { ok: true; blocks: StandardBlock[] }
  | { ok: true; snapshot: StandardBlockSnapshot }
  | { ok: true; context?: { hostname: string; attemptedHostname: string } }
  | { ok: true; settings: StandardBlockSettings; blocks: StandardBlock[] }
  | { ok: false; message: string };

export function parseStandardBlockRequest(message: unknown): StandardBlockRequest | undefined {
  const result = standardBlockRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleStandardBlockRequest(
  controller: StandardBlockController,
  request: StandardBlockRequest,
  settingsRepository: StandardBlockSettingsRepository,
): Promise<StandardBlockResponse> {
  try {
    const settings = await settingsRepository.get();
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
      await settingsRepository.set({
        globalCooldownMilliseconds: request.globalCooldownMilliseconds,
      });
      return {
        ok: true,
        settings: await settingsRepository.get(),
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
