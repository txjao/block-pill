import { describe, expect, it } from 'vitest';
import manifest from '../manifest.json';

describe('manifesto da extensão', () => {
  it('usa a identidade Block Pill e Manifest V3', () => {
    expect(manifest.name).toBe('Block Pill');
    expect(manifest.manifest_version).toBe(3);
    expect(manifest.background.service_worker).toBe('background.js');
  });

  it('solicita somente as permissões necessárias aos ciclos de bloqueio', () => {
    expect(manifest.permissions).toEqual([
      'alarms',
      'storage',
      'declarativeNetRequest',
      'tabs',
      'webNavigation',
    ]);
    expect(manifest.host_permissions).toEqual(['http://*/*', 'https://*/*']);
    expect('content_scripts' in manifest).toBe(false);
  });

  it('expõe somente a página usada pelo redirecionamento', () => {
    expect(manifest.web_accessible_resources).toEqual([
      {
        resources: ['src/entrypoints/blocked/index.html'],
        matches: ['http://*/*', 'https://*/*'],
      },
    ]);
  });
});
