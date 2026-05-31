import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it } from 'vitest';
import AIDock from './AIDock';
import PromptPanel from './PromptPanel';
import { defaultComposer, samplePromptGroups } from '@/store/sampleSessions';
import { useStore } from '@/store/useStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

function resetStoreForPromptLock(
  mode: 'design' | 'running',
  composerDraft = '',
  composerFocusVersion = 0,
): void {
  useStore.setState({
    mode,
    selectedNodeId: null,
    aiStreaming: false,
    aiEditingSessions: [],
    locale: 'zh-CN',
    promptAutoTranslate: false,
    promptGroups: samplePromptGroups,
    composer: defaultComposer,
    composerDraft,
    composerFocusVersion,
    messages: [],
    workspaceHistory: [],
    runningSessionProgress: {},
  });
}

async function renderPanels(): Promise<{
  container: HTMLDivElement;
  cleanup: () => Promise<void>;
}> {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  await act(async () => {
    root.render(
      <>
        <AIDock />
        <PromptPanel />
      </>,
    );
  });

  return {
    container,
    cleanup: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

function buttonByText(container: HTMLElement, text: string): HTMLButtonElement {
  const button = Array.from(container.querySelectorAll('button')).find((item) =>
    item.textContent?.includes(text),
  );
  if (!button) throw new Error(`Missing button containing text: ${text}`);
  return button;
}

function aiInput(container: HTMLElement): HTMLTextAreaElement {
  const input = container.querySelector('textarea');
  if (!input) throw new Error('Missing AI input textarea');
  return input;
}

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('PromptPanel running lock', () => {
  it('ignores direct append requests while the workflow is running', () => {
    resetStoreForPromptLock('running', 'existing draft', 7);

    useStore.getState().appendComposerDraft('grill-me');

    expect(useStore.getState().composerDraft).toBe('existing draft');
    expect(useStore.getState().composerFocusVersion).toBe(7);
  });

  it('disables prompt entries while keeping other panel controls usable', async () => {
    resetStoreForPromptLock('running', 'existing draft', 7);
    const view = await renderPanels();

    try {
      const editButton = buttonByText(view.container, '编辑');
      const groupToggle = buttonByText(view.container, '互动澄清');
      const promptEntry = buttonByText(view.container, '拷问我');

      expect(editButton.disabled).toBe(false);
      expect(groupToggle.disabled).toBe(false);
      expect(promptEntry.disabled).toBe(true);

      editButton.focus();
      expect(document.activeElement).toBe(editButton);

      await act(async () => {
        promptEntry.click();
      });

      expect(useStore.getState().composerDraft).toBe('existing draft');
      expect(useStore.getState().composerFocusVersion).toBe(7);
      expect(document.activeElement).toBe(editButton);
    } finally {
      await view.cleanup();
    }
  });

  it('keeps design-mode prompt insertion and input focus working', async () => {
    resetStoreForPromptLock('design', 'existing draft', 7);
    const view = await renderPanels();

    try {
      const promptEntry = buttonByText(view.container, '拷问我');
      const input = aiInput(view.container);

      expect(promptEntry.disabled).toBe(false);
      expect(input.disabled).toBe(false);

      await act(async () => {
        promptEntry.click();
      });

      expect(useStore.getState().composerDraft).toBe(
        'existing draft\ngrill-me',
      );
      expect(useStore.getState().composerFocusVersion).toBe(8);
      expect(input.value).toBe('existing draft\ngrill-me');
      expect(document.activeElement).toBe(input);
    } finally {
      await view.cleanup();
    }
  });
});
