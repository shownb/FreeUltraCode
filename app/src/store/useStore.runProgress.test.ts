import { describe, expect, it } from 'vitest';
import { selectRunProgress } from './runProgress';

describe('run progress selector', () => {
  it('derives 80% from four completed and one incomplete runnable node', () => {
    expect(
      selectRunProgress(
        {
          n1: 'success',
          n2: 'success',
          n3: 'success',
          n4: 'success',
        },
        ['n1', 'n2', 'n3', 'n4', 'n5'],
      ),
    ).toEqual({
      completed: 4,
      incomplete: 1,
      percent: 80,
    });
  });

  it('returns unknown progress when there are no runnable nodes', () => {
    expect(selectRunProgress({}, [])).toEqual({
      completed: 0,
      incomplete: 0,
      percent: null,
    });
  });

  it('returns 0% when runnable nodes exist but none are complete', () => {
    expect(
      selectRunProgress(
        {
          n1: 'running',
          n2: 'idle',
          n3: 'error',
        },
        ['n1', 'n2', 'n3'],
      ),
    ).toEqual({
      completed: 0,
      incomplete: 3,
      percent: 0,
    });
  });

  it('returns 100% when every runnable node is complete', () => {
    expect(
      selectRunProgress(
        {
          n1: 'success',
          n2: 'success',
        },
        ['n1', 'n2'],
      ),
    ).toEqual({
      completed: 2,
      incomplete: 0,
      percent: 100,
    });
  });
});
