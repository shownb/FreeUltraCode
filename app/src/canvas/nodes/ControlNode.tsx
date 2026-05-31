import { memo } from 'react';
import type { NodeProps } from '@xyflow/react';
import type { FlowNodeData } from '@/canvas/irToFlow';
import { readStartUserInputs } from '@/core/startInputs';
import { ExecIn, ExecOut } from './handles';
import { BADGE_BASE_STYLE, runStateVisual } from './runStateStyles';

/**
 * Control node — the `start` / `end` flow terminals.
 *
 * Pins:
 *   - start: exec out (▶) only — the script entry point.
 *   - end:   exec in (▶) only — the `return`.
 *
 * Accent tokens: `--accent-3` (start), `--accent-4` (end).
 */
function ControlNodeImpl({ data, selected }: NodeProps) {
  const d = data as FlowNodeData;
  const isStart = d.irType === 'start';
  const accent = isStart ? 'var(--accent-3)' : 'var(--accent-4)';
  const glyph = isStart ? '⏵' : '⏹';
  const startInputs = isStart ? readStartUserInputs(d.params) : [];
  const hasStartInputs = startInputs.length > 0;
  const previewInputs = startInputs.slice(0, 2);
  const hiddenInputCount = Math.max(0, startInputs.length - previewInputs.length);

  const run = runStateVisual(d.runState);
  const borderColor =
    run?.borderColor ?? (selected ? accent : 'var(--border)');
  const boxShadow = run?.boxShadow ?? (selected ? `0 0 0 1px ${accent}` : undefined);

  if (hasStartInputs) {
    return (
      <div
        className="relative inline-flex w-fit min-w-[220px] max-w-[320px] flex-col rounded-md border bg-panel font-sans shadow-md"
        style={{ borderColor, boxShadow }}
        title={startInputs.join('\n\n')}
      >
        <div
          className="flex items-center gap-2 rounded-t-md px-3 py-1.5 text-[11px] font-semibold uppercase tracking-wide"
          style={{ background: 'var(--panel-2)', color: accent }}
        >
          <span aria-hidden>{glyph}</span>
          <span className="min-w-0 flex-1 truncate">
            {d.label ?? 'Start'}
          </span>
          <span className="rounded bg-border-soft px-1.5 py-0.5 font-mono text-[10px] text-fg-faint">
            {startInputs.length}
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-1 px-3 py-2">
          {previewInputs.map((input, index) => (
            <div
              key={`${index}-${input.slice(0, 24)}`}
              className="truncate rounded bg-panel-2 px-2 py-1 text-[10px] leading-4 text-fg-dim"
            >
              {input.replace(/\s+/g, ' ')}
            </div>
          ))}
          {hiddenInputCount > 0 && (
            <div className="font-mono text-[10px] text-fg-faint">
              +{hiddenInputCount}
            </div>
          )}
        </div>

        <ExecOut id="exec_out" top={24} />

        {run && (
          <div
            aria-label={`run-state-${d.runState}`}
            style={{ ...BADGE_BASE_STYLE, ...run.badgeStyle }}
          >
            {run.badge}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="relative flex min-w-[110px] items-center gap-2 rounded-full border bg-panel px-4 py-2 font-sans shadow-md"
      style={{ borderColor, boxShadow }}
    >
      <span
        className="text-sm font-semibold"
        style={{ color: accent }}
        aria-hidden
      >
        {glyph}
      </span>
      <span className="text-sm font-medium" style={{ color: accent }}>
        {d.label ?? (isStart ? 'Start' : 'End')}
      </span>

      {/* Pins: start exposes exec_out only; end exposes exec_in only. */}
      {isStart ? <ExecOut id="exec_out" /> : <ExecIn id="exec_in" />}

      {/* Run-state corner badge */}
      {run && (
        <div
          aria-label={`run-state-${d.runState}`}
          style={{ ...BADGE_BASE_STYLE, ...run.badgeStyle }}
        >
          {run.badge}
        </div>
      )}
    </div>
  );
}

export default memo(ControlNodeImpl);
