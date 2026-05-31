import { describe, expect, it } from 'vitest';
import { EXEC, type IRGraph } from './ir';
import { emitClaudeScript } from './emitter';

function buildWorkflow(): IRGraph {
  return {
    version: 1,
    meta: { name: 'gateway emission', adapter: 'claude-code' },
    nodes: [
      {
        id: 'n_start',
        type: 'start',
        label: 'Start',
        params: {},
      },
      {
        id: 'n_agent',
        type: 'agent',
        label: 'Agent',
        params: {
          prompt: 'Do work',
          gateway: {
            modelClass: 'opus',
            providerId: 'prov_1',
            channelId: 'chan_1',
          },
        },
      },
      {
        id: 'n_end',
        type: 'end',
        label: 'End',
        params: {},
      },
    ],
    edges: [
      {
        id: 'e_1',
        from: { node: 'n_start', port: 'exec_out' },
        to: { node: 'n_agent', port: 'exec_in' },
        kind: EXEC,
      },
      {
        id: 'e_2',
        from: { node: 'n_agent', port: 'exec_out' },
        to: { node: 'n_end', port: 'exec_in' },
        kind: EXEC,
      },
    ],
  };
}

describe('emitter gateway compatibility', () => {
  it('emits the legacy model option from a node gateway override', () => {
    const script = emitClaudeScript(buildWorkflow());

    expect(script).toContain("model: 'opus'");
    expect(script).toContain(
      "gateway: { modelClass: 'opus', providerId: 'prov_1', channelId: 'chan_1' }",
    );
    expect(script).toContain(
      '// @route provider=prov_1 channel=chan_1 modelClass=opus',
    );
  });

  it('emits branch and stage gateway routes inside agent options', () => {
    const workflow = buildWorkflow();
    workflow.nodes[1] = {
      id: 'n_parallel',
      type: 'parallel',
      label: 'Parallel',
      params: {
        branches: [
          {
            prompt: 'Branch work',
            gateway: { modelClass: 'haiku', channelId: 'cli_fast' },
          },
        ],
      },
    };

    const script = emitClaudeScript(workflow);

    expect(script).toContain("model: 'haiku'");
    expect(script).toContain(
      "gateway: { modelClass: 'haiku', channelId: 'cli_fast' }",
    );
  });
});
