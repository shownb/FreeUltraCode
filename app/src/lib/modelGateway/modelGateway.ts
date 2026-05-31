import { primeCliRuntime, resolveCliInvocation } from '@/lib/cliConfig';
import { aiEditViaCli, isTauri } from '@/lib/tauri';
import { completeAnthropic } from './adapters/anthropic';
import { completeOpenAICompatible } from './adapters/openaiCompatible';
import {
  mergeGatewaySelection,
  nodeGatewayOverride,
  resolveGatewayRoute,
} from './resolver';
import type {
  GatewaySelection,
  GatewayTextRequest,
  NodeGatewayOverride,
  ResolvedGatewayRoute,
} from './types';

export async function completeGatewayText(
  request: GatewayTextRequest,
): Promise<string> {
  if (request.route.transport === 'anthropic' && request.route.apiKey) {
    return completeAnthropic(request);
  }
  if (
    request.route.transport === 'openai-compatible' &&
    request.route.apiKey
  ) {
    return completeOpenAICompatible(request);
  }

  if (!isTauri()) {
    throw new Error(
      request.route.transport === 'simulator'
        ? 'SIMULATOR_ONLY'
        : 'NO_MODEL_GATEWAY_BACKEND',
    );
  }

  const cli = await resolveCliForRoute(request.route);
  const prompt = `${request.system}\n\n${request.userContent}`;
  return aiEditViaCli(prompt, request.route.adapter, {
    permission: request.permission ?? 'full',
    cwd: request.cwd,
    model: request.route.model,
    cliCommand: cli.command,
    // Inject the channel's credentials (e.g. a Codex relay key/base url) so the
    // local CLI targets the selected provider. See gatewayRouteEnv (cli branch).
    env: request.route.env,
  });
}

export { nodeGatewayOverride };

export function applyGatewayOverride(
  selection: GatewaySelection,
  override?: NodeGatewayOverride,
): GatewaySelection {
  return mergeGatewaySelection(selection, override);
}

export function resolveDirectGatewayRoute(
  selection: GatewaySelection,
): ResolvedGatewayRoute | null {
  const route = resolveGatewayRoute(selectionWorkflow(selection));
  if (
    (route.transport === 'anthropic' ||
      route.transport === 'openai-compatible') &&
    route.apiKey
  ) {
    return route;
  }
  return null;
}

export async function resolveCliGatewayRoute(
  selection: GatewaySelection,
): Promise<ResolvedGatewayRoute & { cliCommand: string }> {
  const route = resolveGatewayRoute(selectionWorkflow(selection));
  const cli = await resolveCliForRoute(route);
  return { ...route, cliCommand: cli.command };
}

async function resolveCliForRoute(route: ResolvedGatewayRoute) {
  if (route.channelId) {
    const runtime = await primeCliRuntime();
    const candidate = runtime.candidates.find(
      (item) =>
        item.id === route.channelId &&
        item.adapter === route.adapter &&
        item.status === 'available',
    );
    if (candidate) {
      return {
        adapter: route.adapter,
        command: candidate.path ?? candidate.command,
        status: 'ready' as const,
        source: candidate.source,
        candidate,
      };
    }
  }

  const cli = await resolveCliInvocation(route.adapter);
  if (cli.status === 'invalid') {
    throw new Error(cli.error ?? 'CLI 路径不可用，请重新选择。');
  }
  return cli;
}

function selectionWorkflow(selection: GatewaySelection) {
  return {
    version: 1,
    meta: {
      adapter: selection.adapter,
      gateway: { defaults: selection },
    },
    nodes: [],
    edges: [],
  };
}
