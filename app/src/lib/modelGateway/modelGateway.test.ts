import { beforeEach, describe, expect, it, vi } from 'vitest';
import { completeGatewayText } from './modelGateway';

const mocks = vi.hoisted(() => ({
  aiEditViaCli: vi.fn(),
  completeAnthropic: vi.fn(),
  completeOpenAICompatible: vi.fn(),
  isTauri: vi.fn(),
  primeCliRuntime: vi.fn(),
  resolveCliInvocation: vi.fn(),
}));

vi.mock('@/lib/tauri', () => ({
  aiEditViaCli: mocks.aiEditViaCli,
  isTauri: mocks.isTauri,
}));

vi.mock('@/lib/cliConfig', () => ({
  primeCliRuntime: mocks.primeCliRuntime,
  resolveCliInvocation: mocks.resolveCliInvocation,
}));

vi.mock('./adapters/anthropic', () => ({
  completeAnthropic: mocks.completeAnthropic,
}));

vi.mock('./adapters/openaiCompatible', () => ({
  completeOpenAICompatible: mocks.completeOpenAICompatible,
}));

describe('completeGatewayText', () => {
  beforeEach(() => {
    mocks.aiEditViaCli.mockReset();
    mocks.completeAnthropic.mockReset();
    mocks.completeOpenAICompatible.mockReset();
    mocks.isTauri.mockReset();
    mocks.primeCliRuntime.mockReset();
    mocks.resolveCliInvocation.mockReset();

    mocks.isTauri.mockReturnValue(true);
    mocks.primeCliRuntime.mockResolvedValue({ candidates: [] });
    mocks.resolveCliInvocation.mockResolvedValue({
      adapter: 'claude-code',
      command: 'claude',
      status: 'ready',
      source: 'system',
    });
    mocks.aiEditViaCli.mockResolvedValue('cli fallback');
  });

  it('falls back to Claude Code CLI when browser-direct Anthropic fetch fails', async () => {
    mocks.completeAnthropic.mockRejectedValue(new TypeError('Failed to fetch'));

    const route = {
      selection: {
        adapter: 'claude-code' as const,
        modelClass: 'sonnet' as const,
        providerId: 'relay_provider',
        channelId: 'default',
      },
      adapter: 'claude-code' as const,
      modelClass: 'sonnet' as const,
      model: 'kimi-for-coding',
      providerId: 'relay_provider',
      channelId: 'default',
      transport: 'anthropic' as const,
      mode: 'direct' as const,
      apiKey: 'sk-imported',
      baseUrl: 'https://api.kimi.com/coding/',
      label: 'Claude Code · Kimi',
      source: 'global' as const,
      env: {
        ANTHROPIC_API_KEY: 'sk-imported',
        ANTHROPIC_AUTH_TOKEN: 'sk-imported',
        ANTHROPIC_BASE_URL: 'https://api.kimi.com/coding/',
        ANTHROPIC_MODEL: 'kimi-for-coding',
      },
    };

    await expect(
      completeGatewayText({
        route,
        system: 'system prompt',
        userContent: 'user prompt',
      }),
    ).resolves.toBe('cli fallback');

    expect(mocks.aiEditViaCli).toHaveBeenCalledWith(
      'system prompt\n\nuser prompt',
      'claude-code',
      expect.objectContaining({
        cliCommand: 'claude',
        env: route.env,
        model: 'kimi-for-coding',
        permission: 'full',
      }),
    );
  });
});
