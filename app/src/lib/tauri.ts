import type { IRGraph } from '@/core/ir';
import { runShellPayload } from '@/lib/shellConfig';

/**
 * CONTRACT: thin, browser-safe bridge to the Tauri Rust backend.
 *
 * Every export degrades gracefully when running outside the desktop shell
 * (plain Vite dev / browser): IPC modules are dynamically imported so the web
 * build never resolves them at load time, and the no-backend / no-key paths
 * throw well-known error codes the caller can branch on.
 *
 *   tauriAvailable() -> boolean
 *   isTauri()        -> boolean (alias)
 *   aiEditGraph(currentIr, instruction, apiKey?) -> Promise<IRGraph>
 *       throws Error('NO_BACKEND')  when not in Tauri
 *       throws Error('NO_API_KEY')  when in Tauri but no key was supplied
 *   runWorkflow(script, adapter) -> Promise<string>   (stdout/stderr summary)
 *   cancelAiCli(runId) -> Promise<void>               best-effort process kill
 *   onWorkflowLog(cb)  -> Promise<UnlistenFn>          ('workflow-log' lines)
 *   onWorkflowNode(cb) -> Promise<UnlistenFn>          ('workflow-node' updates)
 */

/** Per-node runtime status pushed from the backend over 'workflow-node'. */
export type WorkflowNodeState = 'idle' | 'running' | 'success' | 'error';

/** Payload of a 'workflow-node' event. */
export interface WorkflowNodeEvent {
  nodeId: string;
  state: WorkflowNodeState;
}

export type CliPlatform = 'windows' | 'macos' | 'linux';

export interface ModelCliCandidate {
  adapter: string;
  command: string;
  path?: string | null;
  source: string;
  available: boolean;
  status: string;
  hint?: string | null;
  error?: string | null;
  platform: CliPlatform;
}

export interface ModelCliScanResult {
  scannedAtMs: number;
  platform: CliPlatform;
  candidates: ModelCliCandidate[];
  error?: string | null;
}

export interface CliPathValidation {
  path: string;
  normalizedPath: string;
  platform: CliPlatform;
  fileName: string;
}

/** Disposer returned by the event listeners. */
export type UnlistenFn = () => void;

/**
 * True when running inside the Tauri desktop shell. Wraps the SDK's own
 * detection and never throws (older/edge runtimes may lack the global).
 */
export function tauriAvailable(): boolean {
  try {
    return (
      typeof window !== 'undefined' &&
      typeof (window as { __TAURI__?: unknown; __TAURI_INTERNALS__?: unknown })
        .__TAURI_INTERNALS__ !== 'undefined'
    );
  } catch {
    return false;
  }
}

/** Alias for {@link tauriAvailable}. */
export function isTauri(): boolean {
  return tauriAvailable();
}

/** Dynamically load the `invoke` IPC entrypoint (Tauri-only). */
async function getInvoke() {
  const { invoke } = await import('@tauri-apps/api/core');
  return invoke;
}

/** Dynamically load the `listen` event API (Tauri-only). */
async function getListen() {
  const { listen } = await import('@tauri-apps/api/event');
  return listen;
}

/**
 * Ask the backend to rewrite the current graph from a natural-language
 * instruction. Returns the new IRGraph. The Rust side calls the Anthropic
 * Messages API when `apiKey` is present; otherwise it returns an error and the
 * caller should fall back to the local intent engine.
 */
export async function aiEditGraph(
  currentIr: IRGraph,
  instruction: string,
  apiKey?: string,
): Promise<IRGraph> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  if (!apiKey) {
    throw new Error('NO_API_KEY');
  }
  const invoke = await getInvoke();
  const resultJson = await invoke<string>('ai_edit_graph', {
    currentIrJson: JSON.stringify(currentIr),
    instruction,
    apiKey,
  });
  return JSON.parse(resultJson) as IRGraph;
}

/**
 * Run a prompt through the locally-installed agent CLI (e.g. `claude -p`) using
 * the machine's own env/credentials — no API key required. Returns the CLI's
 * stdout (the assistant reply). Throws Error('NO_BACKEND') outside the desktop
 * shell (the browser cannot spawn processes).
 */
export interface CliOpts {
  /** Model tier for the CLI (`--model`), e.g. 'haiku' | 'sonnet' | 'opus'. */
  model?: string;
  /** Resolved CLI executable/path selected in Settings. Omit for adapter default. */
  cliCommand?: string;
  /** Working directory for the agent (the run's workspace). */
  cwd?: string;
  /** Permission mode: 'full' | 'readonly' | 'ask' (from the AIDock dropdown). */
  permission?: string;
  /** Per-call environment overrides used by the model gateway route. */
  env?: Record<string, string>;
  /** Per-call hard timeout override, in seconds. Backend keeps the larger of env/default and this value. */
  timeoutSeconds?: number;
  /** Per-call no-progress timeout override, in seconds. Backend keeps the larger of env/default and this value. */
  idleTimeoutSeconds?: number;
  /** Stable id used to stream progress and cancel the process from the UI. */
  runId?: string;
  /** Live progress callback — receives streamed text/tool-use chunks. */
  onProgress?: (text: string) => void;
  /**
   * Claude session id for context continuity (claude adapter only). With
   * `resume: false` the call creates this session; with `resume: true` it
   * continues it, inheriting the earlier call's warm context.
   */
  sessionId?: string;
  /** Continue `sessionId` instead of creating it. */
  resume?: boolean;
}

let __cliSeq = 0;

export async function aiEditViaCli(
  prompt: string,
  adapter: string,
  opts: CliOpts = {},
): Promise<string> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  __cliSeq += 1;
  const runId = opts.runId ?? `cli_${Date.now()}_${__cliSeq}`;

  // Subscribe to per-run progress events (best-effort; the final result is
  // returned regardless of whether any progress chunks arrive).
  let unlisten: UnlistenFn | undefined;
  if (opts.onProgress) {
    const listen = await getListen();
    unlisten = await listen<{ runId: string; text: string }>(
      'ai-cli-progress',
      (event) => {
        if (event.payload?.runId === runId) opts.onProgress!(event.payload.text);
      },
    );
  }

  try {
    const invoke = await getInvoke();
    return await invoke<string>('ai_cli', {
      prompt,
      adapter,
      cliCommand: opts.cliCommand ?? null,
      model: opts.model ?? null,
      cwd: opts.cwd ?? null,
      permission: opts.permission ?? null,
      envVars: opts.env ?? null,
      timeoutSeconds: opts.timeoutSeconds ?? null,
      idleTimeoutSeconds: opts.idleTimeoutSeconds ?? null,
      runId,
      sessionId: opts.sessionId ?? null,
      resume: opts.resume ?? null,
      shell: runShellPayload(),
    });
  } finally {
    unlisten?.();
  }
}

/** Open an external URL via the OS default browser (web: new tab). */
export async function openExternal(url: string): Promise<void> {
  if (!tauriAvailable()) {
    if (typeof window !== 'undefined') window.open(url, '_blank', 'noopener');
    return;
  }
  const invoke = await getInvoke();
  await invoke('open_external', { url });
}

/** Best-effort cancellation for an in-flight local agent CLI invocation. */
export async function cancelAiCli(runId: string): Promise<void> {
  if (!tauriAvailable()) return;
  const invoke = await getInvoke();
  await invoke('cancel_ai_cli', { runId });
}

/**
 * Run an emitted script through the given CLI adapter (claude-code/codex/
 * gemini). Returns a combined stdout/stderr summary string. Throws
 * Error('NO_BACKEND') outside the desktop shell.
 */
export async function runWorkflow(
  script: string,
  adapter: string,
  cliCommand?: string,
): Promise<string> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  const invoke = await getInvoke();
  return invoke<string>('run_workflow', {
    script,
    adapter,
    cliCommand: cliCommand ?? null,
    shell: runShellPayload(),
  });
}

/** Scan PATH for supported local model CLIs. Desktop-only. */
export async function scanModelClis(): Promise<ModelCliScanResult> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  const invoke = await getInvoke();
  return invoke<ModelCliScanResult>('scan_model_clis');
}

/** Validate a user-selected CLI executable path. Desktop-only. */
export async function validateCliPath(path: string): Promise<CliPathValidation> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  const invoke = await getInvoke();
  return invoke<CliPathValidation>('validate_cli_path', { path });
}

/**
 * Validate a user-selected *launch shell* executable path. Unlike
 * {@link validateCliPath} this intentionally ALLOWS shells (cmd/powershell/
 * sh/zsh/...), which the model-CLI validator rejects. Returns the normalized
 * absolute path. Desktop-only.
 */
export async function validateShellPath(path: string): Promise<string> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  const invoke = await getInvoke();
  return invoke<string>('validate_shell_path', { path });
}

/** Provider runtime family recovered from cc-switch (maps to ProviderKind). */
export type ImportedProviderKind = 'anthropic' | 'codex' | 'gemini';

/** One provider recovered from the local cc-switch database. */
export interface ImportedProvider {
  /** Runtime family: claude rows → 'anthropic', plus 'codex' / 'gemini'. */
  kind: ImportedProviderKind;
  name: string;
  apiKey: string;
  baseUrl: string;
  model?: string;
  /** The cc-switch row id (used to match the active one). */
  ccId: string;
}

/** Currently-active cc-switch provider id per runtime family. */
export interface CcSwitchActivePointers {
  anthropic?: string;
  codex?: string;
  gemini?: string;
}

/** Result of importing providers from cc-switch. */
export interface CcSwitchImportResult {
  providers: ImportedProvider[];
  /** cc-switch row ids that are currently active there, per family. */
  active?: CcSwitchActivePointers;
}

/**
 * Import all supported providers (Claude / Codex / Gemini) from the local
 * cc-switch SQLite database.
 * Desktop-only: throws Error('NO_BACKEND') outside the Tauri shell.
 */
export async function importCcSwitchClaude(): Promise<CcSwitchImportResult> {
  if (!tauriAvailable()) {
    throw new Error('NO_BACKEND');
  }
  const invoke = await getInvoke();
  const json = await invoke<string>('import_cc_switch_claude');
  return JSON.parse(json) as CcSwitchImportResult;
}

/**
 * Subscribe to streamed log lines emitted during a run ('workflow-log').
 * No-op disposer when no backend is present.
 */
export async function onWorkflowLog(
  cb: (line: string) => void,
): Promise<UnlistenFn> {
  if (!tauriAvailable()) {
    return () => {};
  }
  const listen = await getListen();
  return listen<string>('workflow-log', (event) => cb(event.payload));
}

/**
 * Subscribe to per-node state updates during a run ('workflow-node').
 * No-op disposer when no backend is present.
 */
export async function onWorkflowNode(
  cb: (event: WorkflowNodeEvent) => void,
): Promise<UnlistenFn> {
  if (!tauriAvailable()) {
    return () => {};
  }
  const listen = await getListen();
  return listen<WorkflowNodeEvent>('workflow-node', (event) =>
    cb(event.payload),
  );
}
