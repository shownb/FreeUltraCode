import type { IRGraph } from './ir';

export const START_USER_INPUTS_PARAM = 'userInputs' as const;

const START_INPUT_PARAM_KEYS = [
  START_USER_INPUTS_PARAM,
  'inputs',
  'requirements',
  'requirement',
  'input',
  'prompt',
  'description',
] as const;

function textFromObject(value: Record<string, unknown>): string {
  const candidate =
    value.text ??
    value.content ??
    value.prompt ??
    value.answer ??
    value.value;
  if (candidate == null) return '';
  return textFromValue(candidate);
}

function textFromValue(value: unknown): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (typeof value === 'object' && !Array.isArray(value)) {
    return textFromObject(value as Record<string, unknown>);
  }
  return '';
}

function listFromValue(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(textFromValue);
  return [textFromValue(value)];
}

function compactInputs(inputs: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const input of inputs) {
    const text = input.trim();
    if (!text || seen.has(text)) continue;
    seen.add(text);
    out.push(text);
  }
  return out;
}

/**
 * Read Start-node user inputs from the canonical `userInputs` field, while
 * tolerating older/AI-produced aliases such as `inputs` or `requirements`.
 */
export function readStartUserInputs(
  params: Record<string, unknown> | undefined,
): string[] {
  if (!params) return [];
  if (params[START_USER_INPUTS_PARAM] != null) {
    return compactInputs(listFromValue(params[START_USER_INPUTS_PARAM]));
  }
  for (const key of START_INPUT_PARAM_KEYS.slice(1)) {
    if (params[key] == null) continue;
    return compactInputs(listFromValue(params[key]));
  }
  return [];
}

function startParamsWithInputs(
  params: Record<string, unknown>,
  inputs: readonly string[],
): Record<string, unknown> {
  const next = { ...params };
  for (const key of START_INPUT_PARAM_KEYS) delete next[key];
  return { ...next, [START_USER_INPUTS_PARAM]: compactInputs(inputs) };
}

/** Append requirement/user-input entries to the first Start node in a graph. */
export function appendStartUserInputs(
  graph: IRGraph,
  additions: readonly string[],
): IRGraph {
  const nextAdditions = compactInputs(additions);
  if (nextAdditions.length === 0) return graph;

  const startNode = graph.nodes.find((node) => node.type === 'start');
  if (!startNode) return graph;

  const merged = compactInputs([
    ...readStartUserInputs(startNode.params),
    ...nextAdditions,
  ]);
  const current = readStartUserInputs(startNode.params);
  if (
    merged.length === current.length &&
    merged.every((value, index) => value === current[index])
  ) {
    return graph;
  }

  return {
    ...graph,
    nodes: graph.nodes.map((node) =>
      node.id === startNode.id
        ? {
            ...node,
            params: startParamsWithInputs(node.params ?? {}, merged),
          }
        : node,
    ),
  };
}
