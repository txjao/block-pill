import { describe, expect, it } from 'vitest';
import {
  resolveReturnUrl,
  hasStandardBlock,
} from '../view/blocked-page/standard-block.return-url';
import { parseHostname } from '@/shared/web-address/domain';

const context = {
  hostname: 'example.com',
  attemptedHostname: 'docs.example.com',
  originalUrl: 'https://docs.example.com/article?q=test#section',
};
const block = {
  hostname: parseHostname('example.com'),
  ruleId: 1,
  createdAt: 0,
  allowedSubdomains: [],
  temporaryAccess: { usedMinutes: 0 },
};

describe('return after removing a standard block', () => {
  it('preserves the original path and query', () => {
    expect(resolveReturnUrl('example.com', context)).toBe(context.originalUrl);
  });
  it('falls back to the attempted subdomain for old contexts', () => {
    expect(
      resolveReturnUrl('example.com', { ...context, originalUrl: undefined }),
    ).toBe('https://docs.example.com');
  });
  it.each([
    'javascript:alert(1)',
    'https://example.com.attacker.test/a',
    'https://user:pass@example.com',
  ])('rejects unsafe original URL %s', (originalUrl) => {
    expect(resolveReturnUrl('example.com', { ...context, originalUrl })).toBe(
      'https://docs.example.com',
    );
  });
  it('ignores stale context for another domain', () => {
    expect(resolveReturnUrl('other.example', context)).toBe(
      'https://other.example',
    );
  });
  it('returns only after all matching standard blocks are absent or excepted', () => {
    expect(hasStandardBlock(context.originalUrl, [block])).toBe(true);
    expect(hasStandardBlock(context.originalUrl, [])).toBe(false);
    expect(
      hasStandardBlock(context.originalUrl, [
        { ...block, allowedSubdomains: [parseHostname('docs.example.com')] },
      ]),
    ).toBe(false);
  });
});
