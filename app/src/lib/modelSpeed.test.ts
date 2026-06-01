import { afterEach, describe, expect, it } from 'vitest';
import type { GatewaySelection } from '@/core/ir';
import {
  __resetModelSpeedForTests,
  effectiveGenerationConsensusPlan,
  effectiveRunConcurrency,
  modelSpeedProfile,
  recordModelCall,
  timeoutPolicyForSelection,
} from './modelSpeed';

afterEach(() => {
  __resetModelSpeedForTests();
});

describe('model speed policy', () => {
  it('enables multi-candidate generation for known fast tiers', () => {
    const selection: GatewaySelection = {
      adapter: 'claude-code',
      modelClass: 'haiku',
    };

    expect(modelSpeedProfile(selection).tier).toBe('fast');
    expect(effectiveGenerationConsensusPlan(5, selection)).toMatchObject({
      enabled: true,
      count: 5,
    });
    expect(effectiveRunConcurrency(4, selection)).toBe(4);
  });

  it('disables multi-candidate generation and relaxes timeouts for slow tiers', () => {
    const selection: GatewaySelection = {
      adapter: 'claude-code',
      modelClass: 'opus',
    };

    expect(modelSpeedProfile(selection).tier).toBe('slow');
    expect(effectiveGenerationConsensusPlan(3, selection)).toMatchObject({
      enabled: false,
      count: 1,
      concurrency: 1,
    });
    expect(effectiveRunConcurrency(4, selection)).toBe(1);

    const timeout = timeoutPolicyForSelection(selection, 'x'.repeat(12_000));
    expect(timeout.timeoutSeconds).toBeGreaterThan(1800);
    expect(timeout.idleTimeoutSeconds).toBeGreaterThan(300);
  });

  it('promotes a standard tier to fast after observed fast calls', () => {
    const selection: GatewaySelection = {
      adapter: 'claude-code',
      modelClass: 'sonnet',
      providerId: 'p1',
      channelId: 'c1',
    };

    expect(modelSpeedProfile(selection).tier).toBe('standard');
    recordModelCall(selection, {
      elapsedMs: 35_000,
      firstProgressMs: 4_000,
      ok: true,
    });

    expect(modelSpeedProfile(selection).tier).toBe('fast');
    expect(effectiveGenerationConsensusPlan(3, selection).enabled).toBe(true);
  });

  it('marks a route slow after repeated idle timeouts', () => {
    const selection: GatewaySelection = {
      adapter: 'claude-code',
      modelClass: 'sonnet',
    };

    recordModelCall(selection, {
      elapsedMs: 300_000,
      ok: false,
      failureCode: 'idle_timeout',
      idleTimeoutSeconds: 300,
    });
    recordModelCall(selection, {
      elapsedMs: 300_000,
      ok: false,
      failureCode: 'idle_timeout',
      idleTimeoutSeconds: 300,
    });

    expect(modelSpeedProfile(selection).tier).toBe('slow');
    expect(effectiveGenerationConsensusPlan(4, selection).enabled).toBe(false);
  });
});
