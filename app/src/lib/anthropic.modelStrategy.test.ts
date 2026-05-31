import { describe, expect, it } from 'vitest';
import { modelStrategyGuidance, type ModelStrategy } from '@/lib/anthropic';

describe('modelStrategyGuidance', () => {
  it("returns '' for 'inherit' (no extra instruction)", () => {
    expect(modelStrategyGuidance('inherit')).toBe('');
  });

  const active: ModelStrategy[] = ['smart', 'prefer-better', 'prefer-cheaper'];

  it.each(active)('returns a non-empty block mentioning all tiers for %s', (s) => {
    const text = modelStrategyGuidance(s);
    expect(text.length).toBeGreaterThan(0);
    // Begins with a separator so it can be appended onto UNIFIED_SYSTEM.
    expect(text.startsWith('\n\n')).toBe(true);
    expect(text).toContain('haiku');
    expect(text).toContain('sonnet');
    expect(text).toContain('opus');
    // Claude-only caveat is present in every active strategy.
    expect(text).toContain('claude-code');
  });

  it("'prefer-cheaper' emphasizes cheaper/default-haiku", () => {
    const text = modelStrategyGuidance('prefer-cheaper');
    expect(text).toContain('更便宜');
    expect(text).toContain('默认用 haiku');
  });

  it("'prefer-better' emphasizes stronger/opus", () => {
    const text = modelStrategyGuidance('prefer-better');
    expect(text).toContain('更好');
    expect(text).toContain('opus');
  });

  it("'smart' emphasizes matching by difficulty/complexity", () => {
    const text = modelStrategyGuidance('smart');
    expect(text).toContain('智能匹配');
    expect(text).toMatch(/难度|复杂度/);
  });
});
