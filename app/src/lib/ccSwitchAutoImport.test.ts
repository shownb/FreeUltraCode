import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  getConfig: vi.fn(),
  importCcSwitchClaude: vi.fn(),
  importProviders: vi.fn(),
  isTauri: vi.fn(),
  patchConfig: vi.fn(),
}));

vi.mock('@/lib/apiConfig', () => ({
  importProviders: mocks.importProviders,
}));

vi.mock('@/lib/tauri', () => ({
  importCcSwitchClaude: mocks.importCcSwitchClaude,
  isTauri: mocks.isTauri,
}));

vi.mock('@/store/history/store', () => ({
  historyStore: {
    getConfig: mocks.getConfig,
    patchConfig: mocks.patchConfig,
  },
}));

import { maybeRunCcSwitchAutoImportOnFirstRun } from '@/lib/ccSwitchAutoImport';

const ccSwitchProvider = {
  kind: 'anthropic',
  name: 'Claude Team',
  apiKey: 'sk-cc-switch',
  baseUrl: 'https://proxy.example/v1',
  model: 'claude-sonnet-4',
  ccId: 'cc_anthropic_team',
} as const;

beforeEach(() => {
  vi.restoreAllMocks();
  mocks.getConfig.mockReset();
  mocks.importCcSwitchClaude.mockReset();
  mocks.importProviders.mockReset();
  mocks.isTauri.mockReset();
  mocks.patchConfig.mockReset();

  vi.spyOn(console, 'info').mockImplementation(() => undefined);
  vi.spyOn(console, 'warn').mockImplementation(() => undefined);

  mocks.isTauri.mockReturnValue(true);
  mocks.getConfig.mockResolvedValue({ schemaVersion: 1 });
  mocks.importCcSwitchClaude.mockResolvedValue({
    providers: [ccSwitchProvider],
    active: { anthropic: ccSwitchProvider.ccId },
  });
  mocks.importProviders.mockReturnValue({ imported: 1, skipped: 0 });
  mocks.patchConfig.mockImplementation(
    async (patch: Record<string, unknown>) => ({
      schemaVersion: 1,
      ...patch,
    }),
  );
});

describe('maybeRunCcSwitchAutoImportOnFirstRun', () => {
  it('imports cc-switch providers on first startup and records the one-shot marker', async () => {
    await maybeRunCcSwitchAutoImportOnFirstRun();

    expect(mocks.getConfig).toHaveBeenCalledTimes(1);
    expect(mocks.patchConfig).toHaveBeenCalledTimes(2);
    expect(mocks.patchConfig).toHaveBeenNthCalledWith(1, {
      ccSwitchAutoImport: expect.objectContaining({
        version: 1,
        status: 'failed',
        reason: expect.stringContaining('started'),
      }),
    });
    expect(mocks.importProviders).toHaveBeenCalledWith(
      [
        {
          kind: 'anthropic',
          name: 'Claude Team',
          apiKey: 'sk-cc-switch',
          baseUrl: 'https://proxy.example/v1',
          model: 'claude-sonnet-4',
        },
      ],
      undefined,
    );
    expect(mocks.patchConfig).toHaveBeenNthCalledWith(2, {
      ccSwitchAutoImport: expect.objectContaining({
        version: 1,
        status: 'imported',
        importedCount: 1,
      }),
    });
  });

  it('records cc-switch parsing failures without throwing or importing providers', async () => {
    mocks.importCcSwitchClaude.mockRejectedValue(
      new SyntaxError('Unexpected token in cc-switch data'),
    );

    await expect(maybeRunCcSwitchAutoImportOnFirstRun()).resolves.toBeUndefined();

    expect(mocks.importProviders).not.toHaveBeenCalled();
    expect(mocks.patchConfig).toHaveBeenCalledTimes(2);
    expect(mocks.patchConfig).toHaveBeenNthCalledWith(2, {
      ccSwitchAutoImport: expect.objectContaining({
        version: 1,
        status: 'failed',
        importedCount: 0,
        reason: expect.stringContaining('Unexpected token'),
      }),
    });
  });

  it('swallows history write failures after import so startup keeps running', async () => {
    mocks.patchConfig
      .mockResolvedValueOnce({
        schemaVersion: 1,
        ccSwitchAutoImport: {
          version: 1,
          attemptedAt: '2026-05-31T00:00:00.000Z',
          status: 'failed',
        },
      })
      .mockRejectedValueOnce(new Error('disk full'));

    await expect(maybeRunCcSwitchAutoImportOnFirstRun()).resolves.toBeUndefined();

    expect(mocks.importCcSwitchClaude).toHaveBeenCalledTimes(1);
    expect(mocks.importProviders).toHaveBeenCalledTimes(1);
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(
        '[cc-switch:auto-import] failed: unexpected startup import failure',
      ),
      'disk full',
    );
  });

  it('skips later startups once the auto-import marker exists', async () => {
    mocks.getConfig.mockResolvedValue({
      schemaVersion: 1,
      ccSwitchAutoImport: {
        version: 1,
        attemptedAt: '2026-05-31T00:00:00.000Z',
        status: 'imported',
        importedCount: 1,
      },
    });

    await maybeRunCcSwitchAutoImportOnFirstRun();

    expect(mocks.patchConfig).not.toHaveBeenCalled();
    expect(mocks.importCcSwitchClaude).not.toHaveBeenCalled();
    expect(mocks.importProviders).not.toHaveBeenCalled();
  });
});
