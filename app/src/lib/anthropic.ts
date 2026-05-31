/**
 * CONTRACT: browser-direct, streaming client for the Anthropic Messages API.
 *
 * The previous AI path only worked inside the Tauri desktop shell (via the Rust
 * `ai_edit_graph` command) and was non-streaming. This module lets the plain
 * web/dev build call the model directly from the browser using the user's
 * locally-stored API key, streaming the response token-by-token so the "AI 返回"
 * panel shows live feedback.
 *
 *   streamAnthropic({ apiKey, system, userContent, model?, signal?, onDelta })
 *       -> Promise<string>   (the full concatenated text)
 *       throws Error('NO_API_KEY') when no key is supplied
 *       throws Error('HTTP <status>: <body>') on a non-2xx response
 *
 * Two system prompts are exported:
 *   - ADVISOR_SYSTEM: a workflow design consultant that returns Chinese prose
 *     analysis / suggestions (NO JSON).
 *   - EDITOR_SYSTEM: returns ONLY an IRGraph JSON object (mirrors the Rust
 *     prompt) — used by the "apply advice to graph" step.
 */

/** Default Anthropic model id (kept in sync with the Rust backend). */
export const DEFAULT_MODEL = 'claude-sonnet-4-20250514';

const API_URL = 'https://api.anthropic.com/v1/messages';

export interface StreamArgs {
  apiKey?: string;
  /** Optional custom Anthropic base URL (e.g. a proxy). Empty -> default. */
  baseUrl?: string;
  system: string;
  /** The user turn content. */
  userContent: string;
  model?: string;
  maxTokens?: number;
  /** Abort signal so a caller can cancel an in-flight stream. */
  signal?: AbortSignal;
  /** Invoked with each incremental text chunk as it streams in. */
  onDelta?: (chunk: string) => void;
}

/**
 * Stream a single-turn completion from the Anthropic Messages API. Resolves with
 * the full text once the stream ends; calls `onDelta` for each text delta.
 */
export async function streamAnthropic(args: StreamArgs): Promise<string> {
  const { apiKey, baseUrl, system, userContent, model, maxTokens, signal, onDelta } = args;
  if (!apiKey || !apiKey.trim()) throw new Error('NO_API_KEY');

  const res = await fetch(resolveEndpoint(baseUrl), {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey.trim(),
      'anthropic-version': '2023-06-01',
      // Required for direct browser (CORS) access to the Anthropic API.
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: model ?? DEFAULT_MODEL,
      max_tokens: maxTokens ?? 4096,
      stream: true,
      system,
      messages: [{ role: 'user', content: userContent }],
    }),
    signal,
  });

  if (!res.ok || !res.body) {
    const detail = await safeText(res);
    throw new Error(`HTTP ${res.status}: ${detail}`);
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let full = '';

  // Parse the Server-Sent Events stream. Each event is a block of lines; we
  // only care about `data:` lines carrying `content_block_delta` text deltas.
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('data:')) continue;
      const data = trimmed.slice(5).trim();
      if (!data || data === '[DONE]') continue;
      try {
        const evt = JSON.parse(data) as {
          type?: string;
          delta?: { type?: string; text?: string };
          error?: { message?: string };
        };
        if (evt.type === 'error') {
          throw new Error(evt.error?.message ?? 'stream error');
        }
        if (
          evt.type === 'content_block_delta' &&
          evt.delta?.type === 'text_delta' &&
          typeof evt.delta.text === 'string'
        ) {
          full += evt.delta.text;
          onDelta?.(evt.delta.text);
        }
      } catch {
        /* ignore malformed keep-alive / ping lines */
      }
    }
  }
  return full;
}

/**
 * Resolve the messages endpoint from an optional custom base URL. An empty
 * base falls back to the default Anthropic endpoint. Otherwise the trailing
 * slash is stripped and the correct `/v1/messages` suffix is appended:
 *   - already ends with `/messages` -> used as-is
 *   - ends with `/v1`               -> append `/messages`
 *   - anything else                 -> append `/v1/messages`
 */
function resolveEndpoint(baseUrl?: string): string {
  const raw = baseUrl?.trim();
  if (!raw) return API_URL;
  const base = raw.replace(/\/+$/, '');
  if (base.endsWith('/messages')) return base;
  if (base.endsWith('/v1')) return `${base}/messages`;
  return `${base}/v1/messages`;
}

async function safeText(res: Response): Promise<string> {
  try {
    return (await res.text()).slice(0, 500);
  } catch {
    return '<no body>';
  }
}

/** Strip a ```json fence (if any) and return the inner JSON payload. */
export function extractJsonObject(text: string): string {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fence) return fence[1].trim();
  // Otherwise take the outermost {...} span.
  const start = t.indexOf('{');
  const end = t.lastIndexOf('}');
  if (start !== -1 && end > start) return t.slice(start, end + 1);
  return t;
}

/**
 * Unified system prompt: the assistant both explains (Chinese prose) AND emits
 * the full updated IRGraph in a fenced ```json block for normal AI-input turns.
 * The caller streams the explanation to the user, hides the JSON, parses it,
 * and applies it to the blueprint. Pure conceptual questions may omit JSON, but
 * sendPrompt wraps ordinary input as a create/edit request, so those turns should
 * produce a blueprint rather than a markdown plan.
 */
export const UNIFIED_SYSTEM = `你是 OpenWorkflows 的工作流编辑助手。OpenWorkflows 把可视化蓝图编译成可运行的 Claude Code workflow 脚本（注入全局 agent/parallel/pipeline/phase/log/workflow，支持 branch/loop 嵌套）。

用户会给你当前蓝图的 IRGraph(JSON) 和一段意见/问题。请按以下格式回复：
1) 先用**简体中文**简要说明你将如何调整蓝图（2-5 句，面向用户，不要贴 JSON）。
2) 只要用户意见被表述为新建、修改、优化、规划、支持某功能、把需求落地到 workflow、或任何可转成步骤的任务，就必须在说明之后输出**修改后的完整 IRGraph**，包在一个 \`\`\`json 代码块里；如果用户只是问概念且完全不要求改图，才省略代码块。

默认把 AI 输入框里的内容视为“请把需求写入 workflow 蓝图”的编辑任务：
- 不要只输出 Markdown 计划、需求文档、TODO 列表、文件名或等待确认的话。
- 不要创建/修改本地文件，不要探索代码库；即使用户说“规划代码修改/支持这个功能”，也要把它转译成 workflow 蓝图中的 agent、branch、log、verify 等节点。
- 默认直接输出与任务复杂度匹配的蓝图。简单需求用最小充分结构，复杂需求再展开成多步流程；信息不足时先做保守假设，只有会影响正确性或结构的关键缺口，才写成澄清/验证节点。
- 蓝图的周全程度要和任务复杂度、风险、依赖关系匹配：简单问题不要为了“考虑周全”把图做大，复杂问题才增加并行、分支、回退和验收。
- 唯一例外：只有当需求在“最小改动”与“完整蓝图”之间真的存在结构性歧义，且这个选择会明显影响图的形态时，才可按下方交互协议发**一个**两选项 select（“直接改图（最小改动）” / “生成完整多步工作流蓝图”）让用户选择，然后立刻结束本回合；除此之外的一切情况都必须直接出蓝图，绝不只输出说明、计划或 TODO。
- 编辑时尽量保留已有 node id；新增节点和边用稳定、语义化 id，避免破坏现有结构。

IRGraph 结构（编译为真实可运行的 workflow，请严格遵守）：
- 外壳：{version, meta, nodes, edges, layout?}
- meta: {name, description?, adapter?, gateway?:{defaults?:{adapter, modelClass, providerId?, channelId?}}, schemaDefs?}（schemaDefs 把 schema 标识符名映射到其 JS 对象源码）
- node: {id, type, parent?, label?, binding?, params}；type ∈ start|end|agent|parallel|pipeline|phase|branch|loop|workflow|log|variable|codeblock；parent 为所在 branch/loop 节点 id（顶层省略）
- start.params.userInputs 用来合并记录用户的需求、补充说明和澄清回答；Start 节点在画布上只展示摘要。
- 如果已有 start.params.userInputs，请保留并追加新输入，不要覆盖旧内容。
- agent.params: {prompt, label?, agentType?, model?, gateway?, schema?, isolation?, phase?}（用 agentType 而非 agent；schema 是裸标识符名，须是 meta.schemaDefs 的键；model ∈ haiku|sonnet|opus；默认继承 meta.gateway.defaults，不要给新节点写 model:'sonnet'）
- parallel.params: {branches:[{prompt, agentType?, model?, schema?, label?}]}
- pipeline.params: {items, stages:[{prompt, agentType?, schema?}]}（items 是输入数组表达式名）
- branch.params/loop.params: {condition}；子节点是独立 node 且 parent 指向该 branch/loop id
- variable.params:{name,value,raw?} log.params:{message} workflow.params:{name} codeblock.params:{code}
- edges: {id, from:{node,port}, to:{node,port}, kind}，kind ∈ exec|data。start→…→end 用 exec 边连成执行流；branch/loop 用一条 exec 边连到首个子节点，子节点间 child→child；数据流用 data 边（不要在 prompt 里写 \${}）。编辑时尽量保留已有 node id。

**并发优化（重要）**：运行时按依赖图调度——一个节点只要它的所有上游（exec/data 边）都完成就会启动，因此**互相独立的步骤会并行执行**，能显著缩短整体耗时。所以：
- 若多个步骤彼此不依赖（不需要对方的输出），不要排成一条直线，而是从同一个上游各拉一条 exec 边形成**分叉**（如 start 同时连到 A、B、C 并行）；之后若需汇总，再用 data/exec 边把它们都连到下游的汇总节点。
- 只有当 B 确实需要 A 的产出时，才 A→B 串联（并加一条 A→B 的 data 边传递结果）。
- 一组同质并行子任务优先用 parallel 节点；有明确先后依赖的步骤用 pipeline 节点；其余独立步骤用分叉的 exec 拓扑。
- 别为了"看起来整齐"把本可并行的步骤强行串成一条线——那会让运行明显变慢。

代码块里必须是**单个合法 JSON 对象**，不含多余文字或注释。`;

/**
 * AI 改图时为每个节点自动选模型的策略。与 store 的 ComposerSettings.modelStrategy
 * 同义，单独在此导出以便 UNIFIED_SYSTEM 注入逻辑独立于 store 类型。
 */
export type ModelStrategy = 'inherit' | 'smart' | 'prefer-better' | 'prefer-cheaper';

/**
 * Build the extra system-prompt block injected after UNIFIED_SYSTEM, instructing
 * the model how to auto-assign per-node `model` tiers (haiku|sonnet|opus) for the
 * current turn.
 *
 * - 'inherit' returns '' (no extra instruction; preserves existing behavior).
 * - the other three return a Chinese instruction block beginning with "\n\n" so it
 *   can be concatenated directly onto UNIFIED_SYSTEM.
 */
export function modelStrategyGuidance(strategy: ModelStrategy): string {
  if (strategy === 'inherit') return '';

  const header =
    `\n\n【本回合启用「模型策略」】请覆盖上文 UNIFIED_SYSTEM 中“默认继承、不要给新节点写 model”的建议，` +
    `主动为每个 agent 节点、以及 parallel.params.branches[] 和 pipeline.params.stages[] 的每个子项设置 model 字段（值 ∈ haiku|sonnet|opus）。\n` +
    `模型档位（能力/成本由高到低）：\n` +
    `- opus：最强最贵，适合架构设计、复杂推理、安全审查、高风险决策。\n` +
    `- sonnet：均衡，适合常规实现、调试、代码审查。\n` +
    `- haiku：最快最便宜，适合简单、机械、确定性任务（格式化、抽取、汇总、日志、简单校验）。\n`;

  let rule = '';
  if (strategy === 'smart') {
    rule =
      `策略=智能匹配大模型：逐节点按难度匹配——简单任务→haiku，常规任务→sonnet，复杂或关键任务→opus。` +
      `根据每个节点的实际复杂度/难度做权衡，不要一刀切。\n`;
  } else if (strategy === 'prefer-better') {
    rule =
      `策略=尽量用更好的大模型：整体上调档位——非琐碎任务一律 opus，常规任务至少 sonnet，仅极简单任务才用 haiku。` +
      `优先保证质量与正确性。\n`;
  } else {
    // prefer-cheaper
    rule =
      `策略=尽量用更便宜的大模型：整体下调档位——默认用 haiku，仅当任务确实需要更强推理或关键正确性时才升到 sonnet，` +
      `极少数最关键的节点才用 opus。优先节省成本。\n`;
  }

  const footer =
    `请在中文说明里简要交代为哪些关键节点选择了更贵或更便宜的模型及其成本权衡，便于用户理解。\n` +
    `注意：模型档位仅对 Claude（claude-code 适配器）有效；若用户全局选择的是 Codex 或 Gemini 渠道，则忽略档位、不要写 model 字段。`;

  return header + rule + footer;
}
