import { describe, expect, it } from 'vitest';
import {
  MAXIMUM_COOLDOWN_MS,
  MINIMUM_COOLDOWN_MS,
} from '@/features/standard-block/domain/standard-block.constants';
import { standardBlockSettingsSchema } from '@/features/standard-block/domain/standard-block.settings.schema';

describe('standard block settings schema', () => {
  it('accepts the cooldown boundaries', () => {
    expect(
      standardBlockSettingsSchema.parse({
        globalCooldownMilliseconds: MINIMUM_COOLDOWN_MS,
      }),
    ).toEqual({ globalCooldownMilliseconds: MINIMUM_COOLDOWN_MS });
    expect(
      standardBlockSettingsSchema.parse({
        globalCooldownMilliseconds: MAXIMUM_COOLDOWN_MS,
      }),
    ).toEqual({ globalCooldownMilliseconds: MAXIMUM_COOLDOWN_MS });
  });

  it('rejects cooldowns outside the domain boundaries', () => {
    expect(
      standardBlockSettingsSchema.safeParse({
        globalCooldownMilliseconds: MINIMUM_COOLDOWN_MS - 1,
      }).success,
    ).toBe(false);
  });
});
