import {
  validateCooldownMilliseconds,
  type StandardBlockService,
} from '@/features/standard-block/domain/standard-block.service';
import type { StandardBlockSettingsRepository } from '@/features/standard-block/domain/standard-block.settings-repository';
import type {
  StandardBlock,
  StandardBlockSnapshot,
  StandardBlockSettings,
  TemporaryAccessMinutes,
} from '@/features/standard-block/domain/standard-block.types';

export class StandardBlockController {
  constructor(
    private readonly service: StandardBlockService,
    private readonly settingsRepository: StandardBlockSettingsRepository,
  ) {}

  list(): Promise<StandardBlock[]> {
    return this.service.list();
  }

  add(hostname: string, cooldownMilliseconds?: number): Promise<StandardBlock> {
    return this.service.add(hostname, cooldownMilliseconds);
  }

  remove(hostname: string): Promise<void> {
    return this.service.remove(hostname);
  }

  setDomainCooldown(hostname: string, cooldownMilliseconds?: number) {
    return this.service.setDomainCooldown(hostname, cooldownMilliseconds);
  }

  addAllowedSubdomain(hostname: string, subdomain: string) {
    return this.service.addAllowedSubdomain(hostname, subdomain);
  }

  getStatus(hostname: string): Promise<StandardBlockSnapshot> {
    return this.service.getStatus(hostname);
  }

  requestAccess(
    hostname: string,
    minutes: TemporaryAccessMinutes,
    globalCooldownMilliseconds?: number,
  ): Promise<StandardBlockSnapshot> {
    return this.service.grantTemporaryAccess(
      hostname,
      minutes,
      globalCooldownMilliseconds,
    );
  }

  getSettings(): Promise<StandardBlockSettings> {
    return this.settingsRepository.get();
  }

  async updateSettings(
    globalCooldownMilliseconds: number,
  ): Promise<StandardBlockSettings> {
    const settings = {
      globalCooldownMilliseconds: validateCooldownMilliseconds(
        globalCooldownMilliseconds,
      ),
    };
    await this.settingsRepository.set(settings);
    return settings;
  }

  synchronize(): Promise<void> {
    return this.service.synchronize();
  }
}
