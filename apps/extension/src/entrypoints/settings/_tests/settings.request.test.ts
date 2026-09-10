import { describe, expect, it } from 'vitest';
import { readSettingsRequest } from '@/entrypoints/settings/settings.request';

describe('settings request', () => {
  it('opens a permanent confirmation with a normalized hostname', () => {
    expect(
      readSettingsRequest(
        '?section=blocking&tab=permanent&hostname=WWW.Example.com&confirm=permanent',
      ),
    ).toEqual({
      section: 'blocking',
      tab: 'permanent',
      mode: undefined,
      highlightedHostname: undefined,
      permanentHostname: 'example.com',
      openPermanentConfirmation: true,
    });
  });

  it('rejects unknown navigation values and invalid hostnames', () => {
    expect(
      readSettingsRequest('?section=unknown&tab=other&hostname=localhost'),
    ).toEqual({
      section: 'blocking',
      tab: 'flexible',
      mode: undefined,
      highlightedHostname: undefined,
      permanentHostname: undefined,
      openPermanentConfirmation: false,
    });
  });

  it('selects an anti mode from the URL', () => {
    expect(readSettingsRequest('?section=anti&mode=anti-porn').mode).toBe(
      'anti-porn',
    );
  });
});
