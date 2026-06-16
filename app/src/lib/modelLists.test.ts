import { afterEach, describe, expect, it, vi } from 'vitest';
import { FREE_CHANNELS } from './freeChannels';
import {
  addCachedModel,
  addCachedModels,
  freeChannelModelCacheKey,
  freeChannelModelOptions,
  getCachedModels,
  providerModelCacheKey,
  providerModelOptions,
  removeCachedModel,
  refreshFreeChannelModels,
  refreshProviderModels,
} from './modelLists';

const tauriMocks = vi.hoisted(() => ({
  listLocalModels: vi.fn(),
  listRemoteModels: vi.fn(),
}));

vi.mock('@/lib/tauri', () => ({
  listLocalModels: tauriMocks.listLocalModels,
  listRemoteModels: tauriMocks.listRemoteModels,
  tauriAvailable: () => false,
}));

afterEach(() => {
  window.localStorage.clear();
  tauriMocks.listLocalModels.mockReset();
  tauriMocks.listRemoteModels.mockReset();
});

describe('manual model cache', () => {
  it('adds provider models to the cached option list without duplicates', () => {
    const provider = {
      kind: 'anthropic' as const,
      apiKey: 'sk-test',
      baseUrl: 'https://relay.example/v1',
      model: undefined,
    };
    const key = providerModelCacheKey(provider);

    addCachedModel(key, ' custom-model ');
    addCachedModel(key, 'custom-model');
    addCachedModel(key, 'second-model');

    expect(getCachedModels(key)?.models).toEqual([
      'second-model',
      'custom-model',
    ]);
    expect(providerModelOptions(provider)).toEqual([
      'second-model',
      'custom-model',
    ]);
  });

  it('includes provider-persisted models in the option list', () => {
    const provider = {
      kind: 'anthropic' as const,
      apiKey: 'sk-test',
      baseUrl: 'https://relay.example/v1',
      model: 'glm-5.3',
      models: ['glm-5.3', 'glm-5.2', ' GLM-5.2 '],
    };

    expect(providerModelOptions(provider)).toEqual(['glm-5.3', 'glm-5.2']);
  });

  it('makes manually added free-channel models selectable', () => {
    const channel = FREE_CHANNELS.find((item) => item.id === 'groq')!;

    addCachedModel(freeChannelModelCacheKey(channel.id), 'groq-custom');

    expect(freeChannelModelOptions(channel)).toContain('groq-custom');
  });

  it('adds multiple cached models atomically and removes them by name', () => {
    const provider = {
      kind: 'anthropic' as const,
      apiKey: 'sk-test',
      baseUrl: 'https://relay.example/v1',
      model: undefined,
    };
    const key = providerModelCacheKey(provider);

    addCachedModels(key, ['glm-5.3', 'glm-5.2']);

    expect(getCachedModels(key)?.models).toEqual(['glm-5.3', 'glm-5.2']);

    removeCachedModel(key, ' GLM-5.3 ');

    expect(getCachedModels(key)?.models).toEqual(['glm-5.2']);
  });

  it('keeps manual provider models when remote fetch succeeds', async () => {
    const provider = {
      kind: 'anthropic' as const,
      apiKey: 'sk-test',
      baseUrl: 'https://relay.example/v1',
      model: 'saved-model',
      models: ['persisted-model'],
    };
    const key = providerModelCacheKey(provider);
    addCachedModel(key, 'manual-model');
    tauriMocks.listRemoteModels.mockResolvedValueOnce({
      models: ['remote-model', 'manual-model'],
      url: 'https://relay.example/v1/models',
    });

    const result = await refreshProviderModels(provider);

    expect(result.models).toEqual([
      'remote-model',
      'manual-model',
      'persisted-model',
    ]);
    expect(getCachedModels(key)?.models).toEqual([
      'remote-model',
      'manual-model',
      'persisted-model',
    ]);
    expect(providerModelOptions(provider)).toEqual([
      'saved-model',
      'persisted-model',
      'remote-model',
      'manual-model',
    ]);
  });

  it('keeps manual free-channel models when remote fetch succeeds', async () => {
    const channel = FREE_CHANNELS.find((item) => item.id === 'groq')!;
    const key = freeChannelModelCacheKey(channel.id);
    addCachedModel(key, 'groq-manual');
    tauriMocks.listRemoteModels.mockResolvedValueOnce({
      models: ['groq-remote', 'groq-manual'],
      url: 'https://api.groq.com/openai/v1/models',
    });

    const result = await refreshFreeChannelModels(channel);

    expect(result.models).toEqual(['groq-remote', 'groq-manual']);
    expect(getCachedModels(key)?.models).toEqual([
      'groq-remote',
      'groq-manual',
    ]);
  });
});
