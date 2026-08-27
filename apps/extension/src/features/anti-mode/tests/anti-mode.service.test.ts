import { describe, expect, it } from 'vitest';
import type { Clock } from '../../../shared/time/clock';
import type { AntiModeRepository } from '../domain/anti-mode.repository';
import type { AntiModeRuleManager } from '../domain/anti-mode.rule-manager';
import {
  AntiModeCommitmentError,
  AntiModeDurationError,
  AntiModeService,
  convertAntiDuration,
} from '../domain/anti-mode.service';
import type { AntiModeConfig } from '../domain/anti-mode.types';

class Repository implements AntiModeRepository {
  configs: AntiModeConfig[] = [];
  async getAll() {
    return structuredClone(this.configs);
  }
  async setAll(configs: AntiModeConfig[]) {
    this.configs = structuredClone(configs);
  }
}

class Rules implements AntiModeRuleManager {
  configs: AntiModeConfig[] = [];
  async replaceAll(configs: AntiModeConfig[]) {
    this.configs = structuredClone(configs);
  }
}

const clock: Clock = { now: () => 1_000 };

describe('anti mode', () => {
  it('converte dias, meses e anos com limites fixos', () => {
    expect(convertAntiDuration(1, 'days')).toBe(86_400_000);
    expect(convertAntiDuration(2, 'months')).toBe(62 * 86_400_000);
    expect(convertAntiDuration(2, 'years')).toBe(732 * 86_400_000);
    expect(() => convertAntiDuration(733, 'days')).toThrow(AntiModeDurationError);
  });

  it('ativa os dois modos de forma independente e importa apenas o perfil', async () => {
    const repository = new Repository();
    const service = new AntiModeService(repository, new Rules(), clock);
    await service.activate({
      mode: 'anti-porn',
      permanent: false,
      durationValue: 31,
      durationUnit: 'days',
      goals: ['família'],
      hobbies: ['correr'],
      philosophicalKnowledge: true,
    });
    const configs = await service.activate({
      mode: 'anti-bet',
      permanent: false,
      durationValue: 7,
      durationUnit: 'days',
      goals: [],
      hobbies: [],
      philosophicalKnowledge: false,
      importFrom: 'anti-porn',
    });
    expect(configs.find((item) => item.id === 'anti-porn')?.commitmentEndsAt).toBe(
      1_000 + 31 * 86_400_000,
    );
    expect(configs.find((item) => item.id === 'anti-bet')?.goals).toEqual(['família']);
    expect(configs.find((item) => item.id === 'anti-bet')?.domains).toContain('bet365.com');
  });

  it('impede desativação durante o compromisso', async () => {
    const service = new AntiModeService(new Repository(), new Rules(), clock);
    await service.activate({
      mode: 'anti-porn',
      permanent: false,
      durationValue: 1,
      durationUnit: 'days',
      goals: [],
      hobbies: [],
      philosophicalKnowledge: false,
    });
    await expect(service.deactivate('anti-porn')).rejects.toBeInstanceOf(AntiModeCommitmentError);
  });

  it('libera somente domínios de gatilho por 1, 5 ou 15 minutos', async () => {
    const service = new AntiModeService(new Repository(), new Rules(), clock);
    await service.activate({
      mode: 'anti-porn',
      permanent: false,
      durationValue: 1,
      durationUnit: 'days',
      goals: [],
      hobbies: [],
      philosophicalKnowledge: false,
    });
    const result = await service.grantAccess('anti-porn', 'x.com', 5);
    expect(result.activeUntil).toBe(301_000);
    await expect(service.grantAccess('anti-porn', 'pornhub.com', 5)).rejects.toThrow(
      'não permite liberação',
    );
  });
});
