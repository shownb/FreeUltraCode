import { afterEach, describe, expect, it } from 'vitest';
import type { IRGraph } from '@/core/ir';
import { setActiveGatewaySelection } from '@/lib/gatewayConfig';
import {
  resolveGatewayRoute,
  nodeGatewayOverride,
  mergeGatewaySelection,
  nodeParamsWithGatewayOverride,
  normalizeGatewayWorkflow,
  workflowDefaultGatewaySelection,
  workflowGatewaySelection,
} from './resolver';

function buildWorkflow(nodes: IRGraph['nodes']): IRGraph {
  return {
    version: 1,
    meta: { name: 'legacy workflow', adapter: 'claude-code' },
    nodes,
    edges: [],
  };
}

afterEach(() => {
  window.localStorage.clear();
});

describe('model gateway compatibility', () => {
  it('reads legacy params.model as a node model override', () => {
    expect(nodeGatewayOverride({ model: 'haiku' })).toEqual({
      modelClass: 'haiku',
    });
  });

  it('writes node overrides with the legacy model alias preserved', () => {
    expect(
      nodeParamsWithGatewayOverride(
        { prompt: 'a', model: 'sonnet' },
        {
          modelClass: 'opus',
          providerId: 'prov_1',
          channelId: 'chan_1',
        },
      ),
    ).toEqual({
      prompt: 'a',
      model: 'opus',
      gateway: {
        modelClass: 'opus',
        providerId: 'prov_1',
        channelId: 'chan_1',
      },
    });
  });

  it('removes node override fields when inheriting the global selection', () => {
    expect(
      nodeParamsWithGatewayOverride(
        {
          prompt: 'a',
          model: 'haiku',
          gateway: { modelClass: 'haiku', providerId: 'prov_1' },
        },
        null,
      ),
    ).toEqual({
      prompt: 'a',
    });
  });

  it('keeps provider-less channel overrides provider-less in the merged selection', () => {
    expect(
      mergeGatewaySelection(
        {
          adapter: 'claude-code',
          modelClass: 'sonnet',
          providerId: 'prov_1',
          channelId: 'chan_1',
        },
        {
          modelClass: 'haiku',
          channelId: 'cli_2',
        },
      ),
    ).toEqual({
      adapter: 'claude-code',
      modelClass: 'haiku',
      channelId: 'cli_2',
    });
  });

  it('uses the explicit global run selection before workflow defaults', () => {
    setActiveGatewaySelection({ adapter: 'codex', modelClass: 'opus' });
    const workflow = buildWorkflow([]);
    workflow.meta.gateway = {
      defaults: { adapter: 'claude-code', modelClass: 'haiku' },
    };

    expect(workflowGatewaySelection(workflow)).toEqual({
      adapter: 'codex',
      modelClass: 'opus',
    });
  });

  it('prefers workflow defaults when resolving the workflow-default selection', () => {
    setActiveGatewaySelection({ adapter: 'codex', modelClass: 'opus' });
    const workflow = buildWorkflow([]);
    workflow.meta.gateway = {
      defaults: { adapter: 'claude-code', modelClass: 'haiku' },
    };

    expect(workflowDefaultGatewaySelection(workflow)).toEqual({
      adapter: 'claude-code',
      modelClass: 'haiku',
    });
  });

  it('falls back to the current global selection when a workflow has no defaults', () => {
    setActiveGatewaySelection({ adapter: 'gemini', modelClass: 'haiku' });
    const workflow = buildWorkflow([]);
    delete workflow.meta.adapter;

    expect(workflowDefaultGatewaySelection(workflow)).toEqual({
      adapter: 'gemini',
      modelClass: 'haiku',
    });
  });

  it('resolves a route from workflow defaults before the current global selection', () => {
    setActiveGatewaySelection({ adapter: 'codex', modelClass: 'opus' });
    const workflow = buildWorkflow([]);
    workflow.meta.gateway = {
      defaults: { adapter: 'claude-code', modelClass: 'haiku' },
    };

    const route = resolveGatewayRoute(workflow);

    expect(route.selection).toEqual({
      adapter: 'claude-code',
      modelClass: 'haiku',
    });
  });

  it('keeps selected CLI channel ids on fallback routes', () => {
    const workflow = buildWorkflow([]);
    workflow.meta.gateway = {
      defaults: {
        adapter: 'codex',
        modelClass: 'opus',
        channelId: 'cli_custom_codex',
      },
    };

    const route = resolveGatewayRoute(workflow);

    expect(route.transport).toBe('cli');
    expect(route.channelId).toBe('cli_custom_codex');
    expect(route.selection.channelId).toBe('cli_custom_codex');
  });

  it('keeps non-sonnet legacy node models while migrating sonnet to inherit global', () => {
    const workflow = buildWorkflow([
      {
        id: 'n1',
        type: 'agent',
        label: 'Default model',
        params: { prompt: 'a', model: 'sonnet' },
      },
      {
        id: 'n2',
        type: 'agent',
        label: 'Explicit override',
        params: { prompt: 'b', model: 'haiku' },
      },
      {
        id: 'n3',
        type: 'agent',
        label: 'Gateway override',
        params: { prompt: 'c', model: 'sonnet', gateway: { modelClass: 'opus' } },
      },
    ]);

    const migrated = normalizeGatewayWorkflow(workflow, 'sonnet');

    expect(migrated.meta.gateway?.defaults?.modelClass).toBe('sonnet');
    expect(migrated.nodes[0].params).not.toHaveProperty('model');
    expect(migrated.nodes[1].params.model).toBe('haiku');
    expect(migrated.nodes[2].params.model).toBe('sonnet');
    expect(migrated.nodes[2].params.gateway).toEqual({ modelClass: 'opus' });
  });
});
