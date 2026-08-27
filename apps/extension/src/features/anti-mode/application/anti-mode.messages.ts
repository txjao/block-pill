import { z } from 'zod';
import type { AntiModeController } from './anti-mode.controller';
import type { AntiModeConfig } from '../domain/anti-mode.types';

const mode = z.enum(['anti-porn', 'anti-bet']);

const antiModeRequestSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('anti-mode/list') }),
  z.object({
    type: z.literal('anti-mode/activate'),
    mode,
    permanent: z.boolean(),
    durationValue: z.number().positive().optional(),
    durationUnit: z.enum(['days', 'months', 'years']).optional(),
    goals: z.array(z.string()),
    hobbies: z.array(z.string()),
    philosophicalKnowledge: z.boolean(),
    importFrom: mode.optional(),
  }),
  z.object({ type: z.literal('anti-mode/deactivate'), mode }),
  z.object({ type: z.literal('anti-mode/add-domain'), mode, hostname: z.string() }),
  z.object({
    type: z.literal('anti-mode/grant-access'),
    mode,
    hostname: z.string(),
    minutes: z.union([z.literal(1), z.literal(5), z.literal(15)]),
  }),
  z.object({ type: z.literal('incognito/status') }),
  z.object({ type: z.literal('incognito/open-settings') }),
  z.object({ type: z.literal('incognito/set-control'), blocked: z.boolean() }),
  z.object({
    type: z.literal('incognito/suspend'),
    minutes: z.union([z.literal(1), z.literal(5), z.literal(15)]),
  }),
]);

export type AntiModeRequest = z.infer<typeof antiModeRequestSchema>;
export type AntiModeResponse =
  | { ok: true; configs: AntiModeConfig[]; activeUntil?: number }
  | {
      ok: true;
      incognitoAllowed: boolean;
      blocked: boolean;
      controlEnabled: boolean;
      suspendedUntil?: number;
      lockedByAntiMode: boolean;
    }
  | { ok: false; message: string; permissionRequired?: boolean };

export function parseAntiModeRequest(message: unknown): AntiModeRequest | undefined {
  const result = antiModeRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleAntiModeRequest(
  controller: AntiModeController,
  request: Exclude<AntiModeRequest, { type: `incognito/${string}` }>,
): Promise<AntiModeResponse> {
  try {
    if (request.type === 'anti-mode/activate') {
      return { ok: true, configs: await controller.activate(request) };
    }
    if (request.type === 'anti-mode/deactivate') {
      return { ok: true, configs: await controller.deactivate(request.mode) };
    }
    if (request.type === 'anti-mode/add-domain') {
      return { ok: true, configs: await controller.addDomain(request.mode, request.hostname) };
    }
    if (request.type === 'anti-mode/grant-access') {
      const result = await controller.grantAccess(request.mode, request.hostname, request.minutes);
      return { ok: true, configs: result.configs, activeUntil: result.activeUntil };
    }
    return { ok: true, configs: await controller.list() };
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : 'Não foi possível atualizar o modo anti.',
    };
  }
}
