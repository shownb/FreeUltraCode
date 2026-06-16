import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultBlueprint } from '@/core/defaultBlueprint';
import {
  ACTIVE_PROVIDER_BY_KIND_STORAGE,
  PROVIDERS_STORAGE,
  type Provider,
} from '@/lib/apiConfig';
import { ACTIVE_GATEWAY_SELECTION_STORAGE } from '@/lib/gatewayConfig';
import { workflowDefaultGatewaySelection } from '@/lib/modelGateway/resolver';
import { defaultComposer } from '@/store/sampleSessions';
import { useStore } from '@/store/useStore';
import SettingsModal from './SettingsModal';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

async function renderSettingsModal(): Promise<{
  container: HTMLDivElement;
  onClose: ReturnType<typeof vi.fn>;
  cleanup: () => Promise<void>;
}> {
  const onClose = vi.fn();
  useStore.setState({
    locale: 'zh-CN',
    workflow: defaultBlueprint('Current workflow'),
    composer: defaultComposer,
  });

  const container = document.createElement('div');
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  await act(async () => {
    root.render(<SettingsModal onClose={onClose} />);
  });

  return {
    container,
    onClose,
    cleanup: async () => {
      await act(async () => {
        root.unmount();
      });
      container.remove();
    },
  };
}

async function clickButtonByText(container: HTMLElement, text: string): Promise<void> {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button'),
  ).find((item) => item.textContent?.trim() === text);
  expect(button).toBeInstanceOf(HTMLButtonElement);
  await act(async () => {
    button?.click();
  });
}

function findButtonContaining(
  container: HTMLElement,
  text: string,
): HTMLButtonElement {
  const button = Array.from(
    container.querySelectorAll<HTMLButtonElement>('button'),
  ).find((item) => item.textContent?.includes(text));
  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button!;
}

function modelPickerButton(container: HTMLElement): HTMLButtonElement {
  const button = container.querySelector<HTMLButtonElement>(
    'button[data-model-picker="default-channel-model"]',
  );
  expect(button).toBeInstanceOf(HTMLButtonElement);
  return button!;
}

async function openModelPicker(container: HTMLElement): Promise<void> {
  const button = modelPickerButton(container);
  if (button.getAttribute('aria-expanded') === 'true') return;
  await act(async () => {
    button.click();
  });
}

async function clickAddModel(container: HTMLElement): Promise<void> {
  await openModelPicker(container);
  const button = container.querySelector<HTMLButtonElement>(
    'button[data-model-picker-add="default-channel-model"]',
  );
  expect(button).toBeInstanceOf(HTMLButtonElement);
  await act(async () => {
    button?.click();
  });
}

async function clickDeleteModel(
  container: HTMLElement,
  model: string,
): Promise<void> {
  await openModelPicker(container);
  const button = container.querySelector<HTMLButtonElement>(
    `button[data-model-picker-delete="${model}"]`,
  );
  expect(button).toBeInstanceOf(HTMLButtonElement);
  await act(async () => {
    button?.click();
  });
}

function optionLabels(container: HTMLElement): string[] {
  const labels = Array.from(
    container.querySelectorAll<HTMLElement>('[data-model-picker-option]'),
  ).map((option) => option.getAttribute('data-model-picker-option') ?? '');
  const add = container.querySelector<HTMLElement>(
    '[data-model-picker-add="default-channel-model"]',
  );
  if (add) labels.push(add.textContent?.trim() ?? '');
  return labels;
}

function providerCardForModelPicker(container: HTMLElement): HTMLElement {
  let current = modelPickerButton(container).parentElement;
  while (current) {
    if (
      current.classList.contains('rounded-lg') &&
      current.classList.contains('bg-bg-alt')
    ) {
      return current;
    }
    current = current.parentElement;
  }
  throw new Error('Provider card not found');
}

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
  vi.restoreAllMocks();
});

describe('SettingsModal programming model selection', () => {
  it('keeps the modal open when the backdrop is clicked', async () => {
    const view = await renderSettingsModal();

    try {
      const backdrop = view.container.firstElementChild as HTMLDivElement;
      await act(async () => {
        backdrop.click();
      });

      expect(view.onClose).not.toHaveBeenCalled();

      const dialog = view.container.querySelector<HTMLElement>(
        '[aria-labelledby="settings-title"]',
      );
      const closeButton = dialog?.querySelector<HTMLButtonElement>(
        'button[aria-label="关闭"]',
      );
      expect(closeButton).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        closeButton?.click();
      });

      expect(view.onClose).toHaveBeenCalledTimes(1);
    } finally {
      await view.cleanup();
    }
  });

  it('shows a global save action with saved feedback', async () => {
    const view = await renderSettingsModal();

    try {
      expect(view.container.textContent).toContain('配置已同步');

      await clickButtonByText(view.container, '保存');

      expect(view.container.textContent).toContain('已保存');
    } finally {
      await view.cleanup();
    }
  });

  it('adds and deletes manual default-channel models without duplicates', async () => {
    const provider: Provider = {
      id: 'provider-glm5',
      kind: 'anthropic',
      name: 'GLM5',
      apiKey: 'sk-test',
      baseUrl: 'https://node-hk.sssaicode.com',
      model: 'glm-5',
    };
    window.localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify([provider]));
    window.localStorage.setItem(
      ACTIVE_PROVIDER_BY_KIND_STORAGE,
      JSON.stringify({ anthropic: provider.id }),
    );

    const view = await renderSettingsModal();

    try {
      await clickButtonByText(view.container, '编程渠道');
      await openModelPicker(view.container);

      expect(providerCardForModelPicker(view.container).className).not.toContain(
        'overflow-hidden',
      );
      expect(optionLabels(view.container)).toEqual(['glm-5', '添加模型']);

      const prompt = vi.spyOn(window, 'prompt').mockReturnValue('glm-5.2');
      await clickAddModel(view.container);

      expect(modelPickerButton(view.container).textContent).toContain('glm-5.2');
      await openModelPicker(view.container);
      expect(optionLabels(view.container)).toEqual([
        'glm-5.2',
        'glm-5',
        '添加模型',
      ]);

      prompt.mockReturnValue(' GLM-5.2 ');
      await clickAddModel(view.container);

      await openModelPicker(view.container);
      const finalLabels = optionLabels(view.container);
      expect(
        finalLabels.filter((label) => label.toLowerCase() === 'glm-5.2'),
      ).toHaveLength(1);
      expect(finalLabels.at(-1)).toBe('添加模型');

      prompt.mockReturnValue('glm-5.3');
      await clickAddModel(view.container);

      expect(modelPickerButton(view.container).textContent).toContain('glm-5.3');
      await openModelPicker(view.container);
      expect(optionLabels(view.container)).toEqual([
        'glm-5.3',
        'glm-5.2',
        'glm-5',
        '添加模型',
      ]);

      const storedProviders = JSON.parse(
        window.localStorage.getItem(PROVIDERS_STORAGE) ?? '[]',
      ) as Provider[];
      expect(storedProviders[0].models).toEqual([
        'glm-5.3',
        'glm-5.2',
        'glm-5',
      ]);

      await clickDeleteModel(view.container, 'glm-5.2');

      expect(optionLabels(view.container)).toEqual([
        'glm-5.3',
        'glm-5',
        '添加模型',
      ]);

      await clickDeleteModel(view.container, 'glm-5.3');

      expect(modelPickerButton(view.container).textContent).toContain('glm-5');
      expect(optionLabels(view.container)).toEqual(['glm-5', '添加模型']);
    } finally {
      await view.cleanup();
    }
  });

  it('switches the Settings default channel while a workflow is running without rebinding the active session', async () => {
    const providers: Provider[] = [
      {
        id: 'provider-packy',
        kind: 'anthropic',
        name: 'PackyCode',
        apiKey: 'sk-packy',
        baseUrl: 'https://packy.example/v1',
        transport: 'cli',
        model: 'packy-code',
      },
      {
        id: 'provider-sss',
        kind: 'anthropic',
        name: 'SSSAiCode',
        apiKey: 'sk-sss',
        baseUrl: 'https://sss.example/v1',
        transport: 'cli',
        model: 'claude-opus-4-8',
      },
    ];
    window.localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(providers));
    window.localStorage.setItem(
      ACTIVE_PROVIDER_BY_KIND_STORAGE,
      JSON.stringify({ anthropic: 'provider-packy' }),
    );

    const view = await renderSettingsModal();

    try {
      useStore.setState({ mode: 'running' });
      await clickButtonByText(view.container, '编程渠道');

      await act(async () => {
        findButtonContaining(view.container, 'PackyCode').click();
      });
      await act(async () => {
        findButtonContaining(view.container, 'SSSAiCode').click();
      });

      expect(findButtonContaining(view.container, 'SSSAiCode')).toBeTruthy();
      expect(
        JSON.parse(window.localStorage.getItem(ACTIVE_GATEWAY_SELECTION_STORAGE)!),
      ).toEqual({
        adapter: 'claude-code',
        modelClass: 'claude-opus-4-8',
        providerId: 'provider-sss',
        channelId: 'default',
      });
      expect(workflowDefaultGatewaySelection(useStore.getState().workflow)).toEqual({
        adapter: 'claude-code',
        modelClass: 'sonnet',
      });
    } finally {
      await view.cleanup();
    }
  });

  it('moves the closed channel selector display to the newly picked default while running', async () => {
    const providers: Provider[] = [
      {
        id: 'provider-packy',
        kind: 'anthropic',
        name: 'PackyCode',
        apiKey: 'sk-packy',
        baseUrl: 'https://packy.example/v1',
        transport: 'cli',
        model: 'packy-code',
      },
      {
        id: 'provider-deepseek',
        kind: 'anthropic',
        name: 'DeepSeek',
        apiKey: 'sk-deepseek',
        baseUrl: 'https://deepseek.example/v1',
        transport: 'cli',
        model: 'deepseek-v4-pro',
      },
    ];
    window.localStorage.setItem(PROVIDERS_STORAGE, JSON.stringify(providers));
    window.localStorage.setItem(
      ACTIVE_PROVIDER_BY_KIND_STORAGE,
      JSON.stringify({ anthropic: 'provider-packy' }),
    );

    const view = await renderSettingsModal();

    try {
      useStore.setState({ mode: 'running' });
      await clickButtonByText(view.container, '编程渠道');

      // The closed channel selector is the trigger that opens the listbox.
      const trigger = () =>
        view.container.querySelector<HTMLButtonElement>(
          'div.relative > button[type="button"]',
        )!;

      // Open, then pick DeepSeek.
      await act(async () => {
        trigger().click();
      });
      await act(async () => {
        const option = Array.from(
          view.container.querySelectorAll<HTMLButtonElement>(
            'button[role="option"]',
          ),
        ).find((item) => item.textContent?.includes('DeepSeek'));
        expect(option).toBeInstanceOf(HTMLButtonElement);
        option!.click();
      });

      // Listbox closed, and the trigger now shows DeepSeek (selection moved).
      expect(
        view.container.querySelector('button[role="option"]'),
      ).toBeNull();
      expect(trigger().textContent).toContain('DeepSeek');
      expect(trigger().textContent).not.toContain('PackyCode');
    } finally {
      await view.cleanup();
    }
  });
});
