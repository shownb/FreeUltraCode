export type ComposerMode = 'design' | 'running';

export interface ComposerDraftAppendResult {
  draft: string;
  focusVersionDelta: 0 | 1;
}

export function isPromptEntryDisabled(mode: ComposerMode): boolean {
  return mode === 'running';
}

export function shouldRefocusComposerAfterAppend(mode: ComposerMode): boolean {
  return mode !== 'running';
}

export function appendComposerDraftState(
  currentDraft: string,
  addition: string,
  locked: boolean,
): ComposerDraftAppendResult {
  const trimmedAddition = addition.trim();
  if (!trimmedAddition || locked) {
    return { draft: currentDraft, focusVersionDelta: 0 };
  }

  const nextDraft =
    currentDraft.trim().length === 0
      ? trimmedAddition
      : currentDraft.endsWith('\n')
        ? `${currentDraft}${trimmedAddition}`
        : `${currentDraft}\n${trimmedAddition}`;

  return { draft: nextDraft, focusVersionDelta: 1 };
}
