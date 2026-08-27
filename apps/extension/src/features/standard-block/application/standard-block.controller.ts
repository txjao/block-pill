import type { StandardBlockService } from '../domain/standard-block.service';
import type {
  StandardBlock,
  StandardBlockSnapshot,
  TemporaryAccessMinutes,
} from '../domain/standard-block.types';

export class StandardBlockController {
  constructor(private readonly service: StandardBlockService) {}

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
    return this.service.grantTemporaryAccess(hostname, minutes, globalCooldownMilliseconds);
  }

  synchronize(): Promise<void> {
    return this.service.synchronize();
  }
}
