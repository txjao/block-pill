import {
  AntiModeController,
  AntiModeService,
  ChromeAntiModeRepository,
  ChromeAntiModeRuleManager,
} from '@/features/anti-mode';
import {
  ChromePermanentBlockRepository,
  ChromePermanentBlockRuleManager,
  PermanentBlockController,
  PermanentBlockService,
} from '@/features/permanent-block';
import {
  ChromeStandardBlockRepository,
  ChromeStandardBlockRuleManager,
  ChromeStandardBlockSettingsRepository,
  StandardBlockController,
  StandardBlockService,
} from '@/features/standard-block';
import type { Clock } from '@/shared/current-time/domain';
import { systemClock } from '@/shared/current-time/infrastructure';

export interface ChromeBrowserContext {
  antiMode: AntiModeController;
  clock: Clock;
  permanentBlock: PermanentBlockController;
  standardBlock: StandardBlockController;
}

export function createChromeBrowserContext(): ChromeBrowserContext {
  const standardBlock = new StandardBlockController(
    new StandardBlockService(
      new ChromeStandardBlockRepository(),
      new ChromeStandardBlockRuleManager(),
      systemClock,
    ),
    new ChromeStandardBlockSettingsRepository(),
  );

  const permanentBlock = new PermanentBlockController(
    new PermanentBlockService(
      new ChromePermanentBlockRepository(),
      new ChromePermanentBlockRuleManager(),
      systemClock,
    ),
  );

  const antiMode = new AntiModeController(
    new AntiModeService(
      new ChromeAntiModeRepository(),
      new ChromeAntiModeRuleManager(),
      systemClock,
    ),
  );

  return {
    antiMode,
    clock: systemClock,
    permanentBlock,
    standardBlock,
  };
}
