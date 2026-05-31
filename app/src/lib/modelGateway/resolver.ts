import type { IRGraph, IRNode } from '@/core/ir';
import { runtimeAdapterLabel, type RuntimeAdapterId } from '@/lib/adapters';
import {
  getActiveProviderId,
  isProviderBaseUrlValid,
  providerBaseUrlHost,
  type ProviderKind,
} from '@/lib/apiConfig';
import {
  getCliRuntimeSnapshot,
  isCliAdapterAvailable,
} from '@/lib/cliConfig';
import {
  getDefaultGatewaySelection,
  getExplicitActiveGatewaySelection,
  listGatewayProviders,
  setActiveGatewaySelection,
} from '@/lib/gatewayConfig';
import {
  DEFAULT_GATEWAY_SELECTION,
  MODEL_CLASSES,
  type GatewayProvider,
  type GatewayRunOption,
  type GatewaySelection,
  type ModelClass,
  type NodeGatewayOverride,
  type ResolvedGatewayRoute,
} from './types';

const DEFAULT_MODEL_BY_CLASS: Record<string, string> = {
  sonnet: 'claude-sonnet-4-20250514',
  opus: 'claude-opus-4-20250514',
  haiku: 'claude-3-5-haiku-latest',
};

export function modelClassFromModelId(model: unknown): ModelClass {
  if (typeof model !== 'string') return DEFAULT_GATEWAY_SELECTION.modelClass;
  const lower = model.toLowerCase();
  if (lower.includes('haiku')) return 'haiku';
  if (lower.includes('opus')) return 'opus';
  if (lower.includes('sonnet')) return 'sonnet';
  return model;
}

export function normalizeGatewaySelection(
  value: Partial<GatewaySelection> | null | undefined,
): GatewaySelection {
  const adapter = normalizeAdapter(value?.adapter);
  return {
    adapter,
    modelClass:
      typeof value?.modelClass === 'string' && value.modelClass
        ? value.modelClass
        : DEFAULT_GATEWAY_SELECTION.modelClass,
    providerId: value?.providerId || undefined,
    channelId: value?.channelId || undefined,
  };
}

export function workflowGatewaySelection(
  workflow: IRGraph,
  legacyModel?: string,
): GatewaySelection {
  const current = getExplicitActiveGatewaySelection();
  if (current) {
    return normalizeGatewaySelection({
      ...current,
      modelClass: current.modelClass || modelClassFromModelId(legacyModel),
    });
  }

  const defaults = workflow.meta.gateway?.defaults;
  if (defaults) return normalizeGatewaySelection(defaults);
  const active = getDefaultGatewaySelection();
  return normalizeGatewaySelection({
    ...active,
    adapter: normalizeAdapter(workflow.meta.adapter ?? active.adapter),
    modelClass: active.modelClass ?? modelClassFromModelId(legacyModel),
  });
}

/**
 * Resolve the workflow's own preferred selection, preferring the workflow's
 * pinned defaults and only falling back to the current global/default choice
 * when the workflow has never been pinned.
 */
export function workflowDefaultGatewaySelection(
  workflow: IRGraph,
  legacyModel?: string,
): GatewaySelection {
  const defaults = workflow.meta.gateway?.defaults;
  if (defaults) {
    return normalizeGatewaySelection({
      ...defaults,
      modelClass: defaults.modelClass || modelClassFromModelId(legacyModel),
    });
  }

  const active = getExplicitActiveGatewaySelection() ?? getDefaultGatewaySelection();
  return normalizeGatewaySelection({
    ...active,
    adapter: normalizeAdapter(workflow.meta.adapter ?? active.adapter),
    modelClass: active.modelClass ?? modelClassFromModelId(legacyModel),
  });
}

export function withWorkflowGatewaySelection(
  workflow: IRGraph,
  selection: GatewaySelection,
): IRGraph {
  const normalized = normalizeGatewaySelection(selection);
  setActiveGatewaySelection(normalized);
  return {
    ...workflow,
    meta: {
      ...workflow.meta,
      adapter: normalized.adapter,
      gateway: {
        ...(workflow.meta.gateway ?? {}),
        defaults: normalized,
      },
    },
  };
}

/**
 * Drop the workflow's pinned gateway defaults so model resolution falls back to
 * the Settings-active provider. Pairs with clearActiveGatewaySelection() to put
 * the composer into the "inherit global selection" state.
 */
export function withoutWorkflowGatewayDefaults(workflow: IRGraph): IRGraph {
  if (!workflow.meta.gateway?.defaults && workflow.meta.adapter === undefined) {
    return workflow;
  }
  const meta = { ...workflow.meta };
  delete meta.adapter;
  if (meta.gateway) {
    const gateway = { ...meta.gateway };
    delete gateway.defaults;
    meta.gateway = gateway;
  }
  return { ...workflow, meta };
}

export function normalizeGatewayWorkflow(
  workflow: IRGraph,
  legacyModel?: string,
): IRGraph {
  const defaults = workflowGatewaySelection(workflow, legacyModel);
  let changed = !workflow.meta.gateway?.defaults;
  const nodes = workflow.nodes.map((node) => {
    const normalized = normalizeGatewayParams(node.params);
    if (normalized === node.params) return node;
    changed = true;
    return { ...node, params: normalized };
  });
  if (!changed && workflow.meta.adapter === defaults.adapter) return workflow;
  return {
    ...workflow,
    meta: {
      ...workflow.meta,
      adapter: defaults.adapter,
      gateway: {
        ...(workflow.meta.gateway ?? {}),
        defaults,
      },
    },
    nodes,
  };
}

function normalizeGatewayParams(
  params: Record<string, unknown>,
): Record<string, unknown> {
  let next: Record<string, unknown> | null = null;
  const ensureNext = () => {
    next ??= { ...params };
    return next;
  };

  if (params.model === 'sonnet' && !hasGatewayObject(params.gateway)) {
    delete ensureNext().model;
  }

  for (const key of ['branches', 'stages'] as const) {
    const value = (next ?? params)[key];
    const normalized = normalizeGatewaySpecList(value);
    if (normalized !== value) ensureNext()[key] = normalized;
  }

  return next ?? params;
}

function normalizeGatewaySpecList(value: unknown): unknown {
  if (!Array.isArray(value)) return value;
  let next: unknown[] | null = null;
  value.forEach((item, index) => {
    if (
      typeof item !== 'object' ||
      item === null ||
      Array.isArray(item) ||
      (item as Record<string, unknown>).model !== 'sonnet' ||
      hasGatewayObject((item as Record<string, unknown>).gateway)
    ) {
      return;
    }
    next ??= [...value];
    const spec = { ...(item as Record<string, unknown>) };
    delete spec.model;
    next[index] = spec;
  });
  return next ?? value;
}

function hasGatewayObject(value: unknown): boolean {
  return typeof value === 'object' && value !== null;
}

export function nodeGatewayOverride(
  nodeOrParams: IRNode | Record<string, unknown>,
): NodeGatewayOverride | undefined {
  const rawParams = 'params' in nodeOrParams ? nodeOrParams.params : nodeOrParams;
  const params =
    typeof rawParams === 'object' && rawParams !== null
      ? (rawParams as Record<string, unknown>)
      : {};
  const rawGateway = params.gateway;
  const gateway =
    typeof rawGateway === 'object' && rawGateway !== null
      ? (rawGateway as Record<string, unknown>)
      : {};
  const override: NodeGatewayOverride = {};
  if (typeof gateway.modelClass === 'string') {
    override.modelClass = gateway.modelClass;
  }
  if (typeof gateway.providerId === 'string') {
    override.providerId = gateway.providerId || undefined;
  }
  if (typeof gateway.channelId === 'string') {
    override.channelId = gateway.channelId || undefined;
  }
  if (!override.modelClass && typeof params.model === 'string') {
    override.modelClass = modelClassFromModelId(params.model);
  }
  return Object.values(override).some(Boolean) ? override : undefined;
}

export function nodeParamsWithGatewayOverride(
  params: Record<string, unknown>,
  override: NodeGatewayOverride | null,
): Record<string, unknown> {
  const next = { ...params };
  delete next.model;
  delete next.gateway;

  const gateway = compactNodeGatewayOverride(override);
  if (!gateway) return next;

  return {
    ...next,
    ...(gateway.modelClass ? { model: gateway.modelClass } : {}),
    gateway,
  };
}

export function mergeGatewaySelection(
  global: GatewaySelection,
  override?: NodeGatewayOverride,
): GatewaySelection {
  if (!override) return normalizeGatewaySelection(global);
  const providerId =
    override.providerId !== undefined
      ? override.providerId
      : override.channelId
        ? undefined
        : global.providerId;
  return normalizeGatewaySelection({
    ...global,
    modelClass: override.modelClass ?? global.modelClass,
    providerId,
    channelId: override.channelId ?? global.channelId,
  });
}

export function resolveGatewayRoute(
  workflow: IRGraph,
  override?: NodeGatewayOverride,
): ResolvedGatewayRoute {
  const workflowSelection = workflowDefaultGatewaySelection(workflow);
  const selection = mergeGatewaySelection(workflowSelection, override);
  const source: ResolvedGatewayRoute['source'] = override ? 'node' : 'global';
  const providers = listGatewayProviders();
  const provider = resolveProvider(providers, selection);
  const channel = provider
    ? selection.channelId
      ? provider.channels.find(
          (candidate) => candidate.id === selection.channelId,
        )
      : provider.channels[0]
    : undefined;

  if (!provider || !channel) {
    return cliFallbackRoute(selection, source);
  }

  const model = resolveChannelModel(provider, channel, selection.modelClass);
  const baseUrl = (channel.route.baseUrl ?? channel.baseUrl ?? '').trim();
  const apiKey = (channel.apiKey ?? '').trim();
  const route: ResolvedGatewayRoute = {
    selection: {
      ...selection,
      providerId: provider.id,
      channelId: channel.id,
    },
    adapter: provider.adapter,
    modelClass: selection.modelClass,
    model,
    providerId: provider.id,
    providerName: provider.name,
    channelId: channel.id,
    channelName: channel.name,
    transport: channel.route.transport,
    mode:
      channel.route.transport === 'anthropic' ||
      channel.route.transport === 'openai-compatible'
        ? 'direct'
        : 'cli',
    apiKey,
    baseUrl,
    label: `${runtimeAdapterLabel(provider.adapter)} · ${provider.name} · ${channel.name} · ${selection.modelClass}`,
    source,
  };
  const env = gatewayRouteEnv(route);
  return env ? { ...route, env } : route;
}

export function listGatewayRunOptions(): GatewayRunOption[] {
  const providers = listGatewayProviders();
  const options: GatewayRunOption[] = [];
  const cliRuntime = getCliRuntimeSnapshot();

  for (const provider of providers) {
    for (const channel of provider.channels) {
      if (!gatewayChannelAvailable(provider, channel)) continue;
      if (provider.adapter === 'claude-code') {
        // Claude exposes three model tiers; surface one option per tier.
        for (const modelClass of MODEL_CLASSES) {
          const selection = {
            adapter: provider.adapter,
            modelClass: modelClass.id,
            providerId: provider.id,
            channelId: channel.id,
          };
          options.push({
            id: selectionKey(selection),
            label: `${provider.name} · ${channel.name} · ${modelClass.label}`,
            hint: gatewayChannelHint(channel),
            selection,
            transport: channel.route.transport,
            providerName: provider.name,
            channelName: channel.name,
          });
        }
      } else {
        // Codex / Gemini have no Claude-style tiers — one option per channel,
        // using the channel's own model (e.g. gpt-5.5).
        const model = (channel.model ?? channel.route.model ?? '').trim();
        const selection = {
          adapter: provider.adapter,
          modelClass: model || 'default',
          providerId: provider.id,
          channelId: channel.id,
        };
        options.push({
          id: selectionKey(selection),
          label: `${provider.name} · ${channel.name}`,
          hint: gatewayChannelHint(channel),
          selection,
          transport: channel.route.transport,
          providerName: provider.name,
          channelName: channel.name,
        });
      }
    }
  }

  const cliCandidates = cliRuntime.candidates.filter(
    (candidate) => candidate.status === 'available',
  );
  for (const candidate of cliCandidates) {
    const adapter = normalizeAdapter(candidate.adapter);
    const channelName =
      candidate.source === 'custom' ? 'Custom CLI' : 'System CLI';
    if (adapter === 'claude-code') {
      for (const modelClass of MODEL_CLASSES) {
        const selection = {
          adapter,
          modelClass: modelClass.id,
          channelId: candidate.id,
        };
        options.push({
          id: selectionKey(selection),
          label: `${runtimeAdapterLabel(adapter)} · ${candidate.command} · ${modelClass.label}`,
          hint: candidate.path ?? candidate.command,
          selection,
          transport: 'cli',
          channelName,
        });
      }
    } else {
      // Codex / Gemini system CLI: one entry; the model comes from the CLI's
      // own config, so no Claude tier is shown.
      const selection = { adapter, modelClass: 'default', channelId: candidate.id };
      options.push({
        id: selectionKey(selection),
        label: `${runtimeAdapterLabel(adapter)} · ${candidate.command}`,
        hint: candidate.path ?? candidate.command,
        selection,
        transport: 'cli',
        channelName,
      });
    }
  }

  return options;
}

function compactNodeGatewayOverride(
  override: NodeGatewayOverride | null,
): NodeGatewayOverride | undefined {
  if (!override) return undefined;
  const gateway: NodeGatewayOverride = {
    ...(override.modelClass ? { modelClass: override.modelClass } : {}),
    ...(override.providerId ? { providerId: override.providerId } : {}),
    ...(override.channelId ? { channelId: override.channelId } : {}),
  };
  return Object.values(gateway).some(Boolean) ? gateway : undefined;
}

export function selectionKey(selection: GatewaySelection): string {
  return [
    selection.adapter,
    selection.modelClass,
    selection.providerId ?? '',
    selection.channelId ?? '',
  ].join('|');
}

export function bestAvailableSelection(
  current: GatewaySelection,
  options: GatewayRunOption[],
): GatewaySelection {
  const currentKey = selectionKey(current);
  return (
    options.find((option) => option.id === currentKey)?.selection ??
    options.find((option) => option.selection.adapter === current.adapter)
      ?.selection ??
    options[0]?.selection ??
    current
  );
}

export function selectionFromKey(key: string): GatewaySelection | null {
  const [adapter, modelClass, providerId, channelId] = key.split('|');
  if (!adapter || !modelClass) return null;
  return normalizeGatewaySelection({
    adapter: normalizeAdapter(adapter),
    modelClass,
    providerId: providerId || undefined,
    channelId: channelId || undefined,
  });
}

export function gatewayRouteEnv(
  route: Pick<
    ResolvedGatewayRoute,
    'transport' | 'adapter' | 'apiKey' | 'baseUrl' | 'model'
  >,
): Record<string, string> | undefined {
  const env: Record<string, string> = {};
  if (route.transport === 'anthropic') {
    if (route.apiKey) {
      env.ANTHROPIC_API_KEY = route.apiKey;
      env.ANTHROPIC_AUTH_TOKEN = route.apiKey;
    }
    if (route.baseUrl) env.ANTHROPIC_BASE_URL = route.baseUrl;
    if (route.model) env.ANTHROPIC_MODEL = route.model;
  } else if (route.transport === 'openai-compatible') {
    if (route.apiKey) env.OPENAI_API_KEY = route.apiKey;
    if (route.baseUrl) env.OPENAI_BASE_URL = route.baseUrl;
    if (route.model) env.OPENAI_MODEL = route.model;
  } else if (route.transport === 'cli') {
    // CLI adapters (codex / gemini) read credentials from their own config or
    // env. Inject the selected channel's key + base url so the local CLI can
    // reach a relay (e.g. PackyCode) without re-running cc-switch. The exact
    // var a given CLI honours is version-specific; we set the common ones.
    if (route.adapter === 'codex') {
      if (route.apiKey) env.OPENAI_API_KEY = route.apiKey;
      if (route.baseUrl) env.OPENAI_BASE_URL = route.baseUrl;
    } else if (route.adapter === 'gemini') {
      if (route.apiKey) {
        env.GEMINI_API_KEY = route.apiKey;
        env.GOOGLE_API_KEY = route.apiKey;
      }
      if (route.baseUrl) env.GOOGLE_GEMINI_BASE_URL = route.baseUrl;
    }
  }
  return Object.keys(env).length > 0 ? env : undefined;
}

function adapterToProviderKind(adapter: string): ProviderKind {
  if (adapter === 'codex') return 'codex';
  if (adapter === 'gemini') return 'gemini';
  return 'anthropic';
}

function resolveProvider(
  providers: GatewayProvider[],
  selection: GatewaySelection,
): GatewayProvider | undefined {
  if (selection.providerId) {
    const selected = providers.find(
      (provider) => provider.id === selection.providerId,
    );
    if (selected) return selected;
  }
  // No (or stale) channel pinned → fall back to this category's default
  // provider, then to the first provider of the adapter. This is what makes a
  // per-category default (set in Settings) actually drive resolution.
  const activeId = getActiveProviderId(
    adapterToProviderKind(selection.adapter),
  );
  if (activeId) {
    const active = providers.find((provider) => provider.id === activeId);
    if (active && active.adapter === selection.adapter) return active;
  }
  return providers.find((provider) => provider.adapter === selection.adapter);
}

function gatewayChannelAvailable(
  provider: GatewayProvider,
  channel: GatewayProvider['channels'][number],
): boolean {
  const transport = channel.route.transport;
  if (transport === 'anthropic' || transport === 'openai-compatible') {
    const apiKey = (channel.apiKey ?? '').trim();
    const baseUrl = (channel.route.baseUrl ?? channel.baseUrl ?? '').trim();
    return apiKey.length > 0 && isProviderBaseUrlValid(baseUrl);
  }
  if (transport === 'cli') {
    return isCliAdapterAvailable(provider.adapter, getCliRuntimeSnapshot());
  }
  return false;
}

function gatewayChannelHint(
  channel: GatewayProvider['channels'][number],
): string {
  const transport = channel.route.transport;
  if (transport === 'anthropic' || transport === 'openai-compatible') {
    const baseUrl = channel.route.baseUrl ?? channel.baseUrl ?? '';
    return `${transport === 'anthropic' ? 'Anthropic API' : 'OpenAI-compatible'} · ${providerBaseUrlHost(baseUrl)}`;
  }
  return transport;
}

function resolveChannelModel(
  provider: GatewayProvider,
  channel: GatewayProvider['channels'][number],
  modelClass: ModelClass,
): string | undefined {
  return (
    channel.route.models?.[modelClass] ??
    channel.models?.[modelClass] ??
    channel.route.model ??
    channel.model ??
    (provider.adapter === 'claude-code'
      ? DEFAULT_MODEL_BY_CLASS[modelClass] ?? modelClass
      : modelClass)
  );
}

function cliFallbackRoute(
  selection: GatewaySelection,
  source: ResolvedGatewayRoute['source'],
): ResolvedGatewayRoute {
  const adapter = normalizeAdapter(selection.adapter);
  const model =
    adapter === 'claude-code'
      ? DEFAULT_MODEL_BY_CLASS[selection.modelClass] ?? selection.modelClass
      : selection.modelClass;
  return {
    selection: { ...selection, adapter },
    adapter,
    modelClass: selection.modelClass,
    model,
    providerId: selection.providerId,
    channelId: selection.channelId,
    transport: 'cli',
    mode: 'cli',
    label: `${runtimeAdapterLabel(adapter)} CLI · ${selection.modelClass}`,
    source,
  };
}

function normalizeAdapter(value: unknown): RuntimeAdapterId {
  if (value === 'codex' || value === 'gemini') return value;
  return 'claude-code';
}
