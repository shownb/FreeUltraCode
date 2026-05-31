import {
  importProviders,
  type Provider,
} from '@/lib/apiConfig';
import {
  importCcSwitchClaude,
  isTauri,
  type ImportedProvider,
} from '@/lib/tauri';
import { historyStore } from '@/store/history/store';
import type {
  CcSwitchAutoImportRecord,
  CcSwitchAutoImportStatus,
} from '@/store/history/types';

export interface CcSwitchImportOutcome {
  status: CcSwitchAutoImportStatus;
  importedCount: number;
  skippedCount: number;
  reason?: string;
}

export interface CcSwitchImportOptions {
  /**
   * Manual imports preserve existing Settings behavior by promoting the active
   * Claude provider from cc-switch. Startup import leaves existing defaults
   * alone and only fills missing category defaults through importProviders().
   */
  promoteActiveAnthropic?: boolean;
}

type ProviderDraft = Omit<Provider, 'id'>;

let autoImportInFlight = false;

function importedProviderDraft(provider: ImportedProvider): ProviderDraft {
  return {
    kind: provider.kind,
    name: provider.name,
    apiKey: provider.apiKey,
    baseUrl: provider.baseUrl,
    model: provider.model,
  };
}

function normalizeErrorReason(error: unknown): string {
  if (error instanceof Error) {
    return error.message.trim() || error.name || 'Unknown error';
  }
  if (typeof error === 'string') return error.trim() || 'Unknown error';
  try {
    const json = JSON.stringify(error);
    if (json) return json;
  } catch {
    /* fall through */
  }
  return String(error).trim() || 'Unknown error';
}

function isMissingCcSwitchSource(reason: string): boolean {
  const normalized = reason.toLowerCase();
  return (
    reason.includes('未找到 cc-switch') ||
    normalized.includes('cc-switch database not found') ||
    normalized.includes('not found')
  );
}

function autoImportRecord(
  attemptedAt: string,
  outcome: CcSwitchImportOutcome,
): CcSwitchAutoImportRecord {
  return {
    version: 1,
    attemptedAt,
    status: outcome.status,
    importedCount: outcome.importedCount,
    ...(outcome.reason ? { reason: outcome.reason } : {}),
  };
}

function autoImportStartedRecord(attemptedAt: string): CcSwitchAutoImportRecord {
  return {
    version: 1,
    attemptedAt,
    status: 'failed',
    reason: 'Auto-import attempt started but did not complete.',
  };
}

function logAutoImport(
  phase: string,
  message: string,
  details?: unknown,
  level: 'info' | 'warn' = 'info',
): void {
  const prefix = `[cc-switch:auto-import] ${phase}: ${message}`;
  if (details === undefined) {
    console[level](prefix);
    return;
  }
  console[level](prefix, details);
}

export async function importCcSwitchProviders(
  options: CcSwitchImportOptions = {},
): Promise<CcSwitchImportOutcome> {
  if (!isTauri()) {
    return {
      status: 'no-source',
      importedCount: 0,
      skippedCount: 0,
      reason: 'NO_BACKEND',
    };
  }

  try {
    const result = await importCcSwitchClaude();
    const providers = Array.isArray(result.providers) ? result.providers : [];
    if (providers.length === 0) {
      return {
        status: 'empty',
        importedCount: 0,
        skippedCount: 0,
      };
    }

    const activeAnthropic = options.promoteActiveAnthropic
      ? result.active?.anthropic
      : undefined;
    const activeMatch = activeAnthropic
      ? (incoming: ProviderDraft) =>
          providers.some(
            (provider) =>
              provider.ccId === activeAnthropic &&
              provider.name === incoming.name &&
              provider.apiKey === incoming.apiKey,
          )
      : undefined;
    const { imported, skipped } = importProviders(
      providers.map(importedProviderDraft),
      activeMatch,
    );

    return {
      status: 'imported',
      importedCount: imported,
      skippedCount: skipped,
    };
  } catch (error) {
    const reason = normalizeErrorReason(error);
    if (reason === 'NO_BACKEND' || isMissingCcSwitchSource(reason)) {
      return {
        status: 'no-source',
        importedCount: 0,
        skippedCount: 0,
        reason,
      };
    }
    return {
      status: 'failed',
      importedCount: 0,
      skippedCount: 0,
      reason,
    };
  }
}

export async function maybeRunCcSwitchAutoImportOnFirstRun(): Promise<void> {
  if (autoImportInFlight) {
    logAutoImport('detect', 'auto-import already in flight; skipping');
    return;
  }
  autoImportInFlight = true;
  try {
    logAutoImport('detect', 'checking first-run marker');
    const config = await historyStore.getConfig();
    if (config.ccSwitchAutoImport?.version === 1) {
      logAutoImport('detect', 'already attempted; skipping', {
        attemptedAt: config.ccSwitchAutoImport.attemptedAt,
        status: config.ccSwitchAutoImport.status,
      });
      return;
    }

    const attemptedAt = new Date().toISOString();
    const startedRecord = autoImportStartedRecord(attemptedAt);
    await historyStore.patchConfig({ ccSwitchAutoImport: startedRecord });
    logAutoImport('write', 'reserved first-run marker', startedRecord);

    logAutoImport('invoke', 'reading providers from cc-switch', {
      attemptedAt,
    });
    const outcome = await importCcSwitchProviders();
    logAutoImport(
      'parse',
      `cc-switch import resolved as ${outcome.status}`,
      outcome,
      outcome.status === 'failed' ? 'warn' : 'info',
    );

    const record = autoImportRecord(attemptedAt, outcome);
    await historyStore.patchConfig({ ccSwitchAutoImport: record });
    logAutoImport('write', 'stored first-run marker', record);
  } catch (error) {
    logAutoImport(
      'failed',
      'unexpected startup import failure',
      normalizeErrorReason(error),
      'warn',
    );
  } finally {
    autoImportInFlight = false;
  }
}
