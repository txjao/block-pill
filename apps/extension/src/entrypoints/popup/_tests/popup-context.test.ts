import { describe, expect, it } from 'vitest';
import type { StandardBlock } from '@/features/standard-block';
import {
  createSettingsPath,
  readCurrentHostname,
  resolvePopupSiteClassification,
} from '@/entrypoints/popup/popup-context';
import {
  createStimulatingDomainSet,
  isStimulatingHostname,
} from '@/entrypoints/popup/stimulating-sites';

const stimulating = createStimulatingDomainSet({
  version: 1,
  domains: ['social.example'],
});

function block(hostname: string): StandardBlock {
  return {
    hostname: hostname as StandardBlock['hostname'],
    ruleId: 1,
    createdAt: 1,
    allowedSubdomains: [],
    temporaryAccess: { usedMinutes: 0 },
  };
}

describe('popup context', () => {
  it('gives a standard block priority over the stimulating catalog', () => {
    expect(
      resolvePopupSiteClassification({
        currentUrl: 'https://feed.social.example/watch',
        standardBlocks: [block('social.example')],
        stimulatingDomains: stimulating,
      }),
    ).toEqual({ kind: 'paused', hostname: 'social.example' });
  });

  it('matches catalog subdomains using constant-time set lookups', () => {
    expect(isStimulatingHostname('feed.social.example', stimulating)).toBe(
      true,
    );
    expect(isStimulatingHostname('not-social.example', stimulating)).toBe(
      false,
    );
  });

  it('rejects duplicate normalized catalog entries', () => {
    expect(() =>
      createStimulatingDomainSet({
        version: 1,
        domains: ['social.example', 'www.social.example'],
      }),
    ).toThrow('duplicado');
  });

  it('reads the original hostname from a blocked extension page', () => {
    expect(
      readCurrentHostname(
        'chrome-extension://id/src/entrypoints/blocked/index.html?mode=standard&hostname=video.example',
      ),
    ).toBe('video.example');
  });

  it('builds an encoded settings route', () => {
    expect(
      createSettingsPath({
        section: 'blocking',
        tab: 'permanent',
        hostname: 'social.example',
        confirm: 'permanent',
      }),
    ).toBe(
      'src/entrypoints/settings/index.html?section=blocking&tab=permanent&hostname=social.example&confirm=permanent',
    );
  });
});
