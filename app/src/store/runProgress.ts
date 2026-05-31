import type { NodeRunState } from './types';

export interface RunProgressSummary {
  completed: number;
  incomplete: number;
  percent: number | null;
}

export function selectRunProgress(
  runState: Record<string, NodeRunState>,
  runnableNodeIds: string[],
): RunProgressSummary {
  const total = runnableNodeIds.length;
  if (total <= 0) {
    return { completed: 0, incomplete: 0, percent: null };
  }

  const completed = runnableNodeIds.filter(
    (nodeId) => runState[nodeId] === 'success',
  ).length;
  const incomplete = Math.max(0, total - completed);
  const percent = Math.round((completed / (completed + incomplete)) * 100);

  return { completed, incomplete, percent };
}
