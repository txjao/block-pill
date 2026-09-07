import { describe, expect, it } from 'vitest';
import { matchesHostname } from '@/shared/web-address/domain';

describe('matchesHostname', () => {
  it('reconhece o domínio exato e seus subdomínios', () => {
    expect(matchesHostname('https://example.com/path', 'example.com')).toBe(
      true,
    );
    expect(matchesHostname('https://news.example.com', 'example.com')).toBe(
      true,
    );
    expect(matchesHostname('https://www.example.com', 'example.com')).toBe(
      true,
    );
  });

  it('não confunde domínios parecidos', () => {
    expect(matchesHostname('https://notexample.com', 'example.com')).toBe(
      false,
    );
    expect(
      matchesHostname('https://example.com.evil.test', 'example.com'),
    ).toBe(false);
  });

  it('retorna falso quando o endereço é ausente ou inválido', () => {
    expect(matchesHostname(undefined, 'example.com')).toBe(false);
    expect(matchesHostname('chrome://extensions', 'example.com')).toBe(false);
  });
});
