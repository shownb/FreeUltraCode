import { afterEach, describe, expect, it } from 'vitest';
import {
  ACTIVE_PROVIDER_STORAGE,
  PROVIDERS_STORAGE,
  addProvider,
  getActiveProvider,
  getActiveProviderId,
  listProviders,
  readApiKey,
  readBaseUrl,
  type Provider,
} from './apiConfig';

function seedProviders(entries: unknown[], activeId?: string): void {
  window.localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(entries));
  if (activeId === undefined) {
    window.localStorage.removeItem(ACTIVE_PROVIDER_STORAGE);
    return;
  }
  window.localStorage.setItem(ACTIVE_PROVIDER_STORAGE, activeId);
}

afterEach(() => {
  window.localStorage.clear();
});

describe('apiConfig provider compatibility', () => {
  it('falls back to the first stored provider when active id is missing', () => {
    seedProviders([
      {
        id: 'p_1',
        kind: 'anthropic',
        name: 'Primary',
        apiKey: '  sk-test-primary  ',
        baseUrl: 'https://proxy.example/v1/',
      },
      {
        id: 'p_2',
        kind: 'anthropic',
        name: 'Secondary',
        apiKey: 'sk-test-secondary',
        baseUrl: '',
      },
    ]);

    expect(getActiveProviderId()).toBe('p_1');
    expect(getActiveProvider()?.id).toBe('p_1');
    expect(readApiKey()).toBe('sk-test-primary');
    expect(readBaseUrl()).toBe('https://proxy.example/v1/');
  });

  it('normalizes legacy stored records and ignores dangling active ids', () => {
    seedProviders(
      [
        {
          id: 'legacy_1',
          adapter: 'claude-code',
          name: 'Claude',
          apiKey: 'legacy-key',
          baseUrl: 'https://api.anthropic.com',
        },
      ],
      'missing-id',
    );

    expect(getActiveProviderId()).toBe('legacy_1');
    expect(readApiKey()).toBe('legacy-key');
    expect(readBaseUrl()).toBe('https://api.anthropic.com');
    expect(listProviders()[0]).toMatchObject({
      id: 'legacy_1',
      kind: 'anthropic',
      name: 'Claude',
    } satisfies Partial<Provider>);
  });

  it('keeps the resolved active provider stable when adding after a missing active id', () => {
    seedProviders([
      {
        id: 'p_1',
        kind: 'anthropic',
        name: 'Primary',
        apiKey: 'sk-test-primary',
        baseUrl: '',
      },
    ]);

    addProvider({
      kind: 'anthropic',
      name: 'Secondary',
      apiKey: 'sk-test-secondary',
      baseUrl: '',
    });

    expect(getActiveProviderId()).toBe('p_1');
  });
});
