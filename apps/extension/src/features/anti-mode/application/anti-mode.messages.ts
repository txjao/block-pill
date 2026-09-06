import type { AntiModeController } from './anti-mode.controller';
import type { AntiModeConfig } from '@/features/anti-mode/domain/anti-mode.types';
import { ANTI_MODE_MESSAGE_TYPE } from './anti-mode.messages.constants';
import {
  antiModeRequestSchema,
  type ParsedAntiModeRequest,
} from './anti-mode.messages.schema';

export type {
  AntiModeRequest,
  ParsedAntiModeRequest,
} from './anti-mode.messages.schema';
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

export function parseAntiModeRequest(
  message: unknown,
): ParsedAntiModeRequest | undefined {
  const result = antiModeRequestSchema.safeParse(message);
  return result.success ? result.data : undefined;
}

export async function handleAntiModeRequest(
  controller: AntiModeController,
  request: Extract<
    ParsedAntiModeRequest,
    {
      type: (typeof ANTI_MODE_MESSAGE_TYPE)[keyof typeof ANTI_MODE_MESSAGE_TYPE];
    }
  >,
): Promise<AntiModeResponse> {
  try {
    if (request.type === ANTI_MODE_MESSAGE_TYPE.activate) {
      return { ok: true, configs: await controller.activate(request) };
    }
    if (request.type === ANTI_MODE_MESSAGE_TYPE.deactivate) {
      return { ok: true, configs: await controller.deactivate(request.mode) };
    }
    if (request.type === ANTI_MODE_MESSAGE_TYPE.addDomain) {
      return {
        ok: true,
        configs: await controller.addDomain(request.mode, request.hostname),
      };
    }
    if (request.type === ANTI_MODE_MESSAGE_TYPE.grantAccess) {
      const result = await controller.grantAccess(
        request.mode,
        request.hostname,
        request.minutes,
      );
      return {
        ok: true,
        configs: result.configs,
        activeUntil: result.activeUntil,
      };
    }
    return { ok: true, configs: await controller.list() };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? error.message
          : 'Não foi possível atualizar o modo anti.',
    };
  }
}
