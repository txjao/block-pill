import type { AntiModeService } from '../domain/anti-mode.service';
import type {
  ActivateAntiModeInput,
  AntiAccessMinutes,
  AntiModeId,
} from '../domain/anti-mode.types';

export class AntiModeController {
  constructor(private readonly service: AntiModeService) {}

  list() {
    return this.service.list();
  }
  activate(input: ActivateAntiModeInput) {
    return this.service.activate(input);
  }
  deactivate(mode: AntiModeId) {
    return this.service.deactivate(mode);
  }
  addDomain(mode: AntiModeId, hostname: string) {
    return this.service.addDomain(mode, hostname);
  }
  grantAccess(mode: AntiModeId, hostname: string, minutes: AntiAccessMinutes) {
    return this.service.grantAccess(mode, hostname, minutes);
  }
  synchronize() {
    return this.service.synchronize();
  }
}
