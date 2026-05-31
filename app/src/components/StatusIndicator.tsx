import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';

export type StatusTone =
  | 'running'
  | 'aiEditing'
  | 'success'
  | 'error'
  | 'interrupted';

interface StatusIndicatorProps {
  tone?: StatusTone | null;
  label?: string;
  className?: string;
}

type StaticStatusTone = Exclude<StatusTone, 'running'>;

function statusColorStyle(color: string): CSSProperties {
  return { '--owf-status-color': color } as CSSProperties;
}

const STATIC_TONE_STYLE: Record<StaticStatusTone, CSSProperties> = {
  aiEditing: statusColorStyle('var(--status-ai-edit)'),
  success: statusColorStyle('var(--status-success)'),
  error: statusColorStyle('var(--status-error)'),
  interrupted: statusColorStyle('var(--status-interrupted)'),
};

export default function StatusIndicator({
  tone = null,
  label,
  className,
}: StatusIndicatorProps) {
  const active = tone != null;

  return (
    <span
      aria-hidden={!active}
      aria-label={active ? label : undefined}
      className={cn('owf-status-slot', className)}
      data-status={tone ?? 'none'}
      role={active ? 'img' : undefined}
      title={active ? label : undefined}
    >
      {tone === 'running' ? (
        <span
          aria-hidden="true"
          className="owf-status-indicator owf-status-spinner"
        />
      ) : tone ? (
        <span
          aria-hidden="true"
          className="owf-status-indicator"
          style={STATIC_TONE_STYLE[tone]}
        />
      ) : null}
    </span>
  );
}
