import { act } from 'react';
import type { ReactNode } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, describe, expect, it, vi } from 'vitest';
import GameTeamPanel from './GameTeamPanel';
import {
  DEFAULT_GAME_EXPERT_SETTINGS,
  normalizeGameExpertSettings,
} from '@/lib/gameExperts';
import { useStore } from '@/store/useStore';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT =
  true;

class ResizeObserverStub {
  observe(): void {}
  unobserve(): void {}
  disconnect(): void {}
}

(globalThis as { ResizeObserver?: typeof ResizeObserver }).ResizeObserver =
  ResizeObserverStub as typeof ResizeObserver;

async function renderGameTeamPanel(node: ReactNode = <GameTeamPanel />): Promise<{
  container: HTMLDivElement;
  cleanup: () => Promise<void>;
}> {
  useStore.setState({
    locale: 'zh-CN',
    composerDraft: '',
    composerDrafts: {},
    gameExpertSettings: normalizeGameExpertSettings({
      ...DEFAULT_GAME_EXPERT_SETTINGS,
      enabled: true,
    }),
  });

  const container = document.createElement('div');
  container.style.height = '760px';
  container.style.width = '440px';
  document.body.appendChild(container);
  const root: Root = createRoot(container);

  await act(async () => {
    root.render(node);
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

function setInputValue(
  element: HTMLInputElement | HTMLTextAreaElement,
  value: string,
): void {
  const prototype =
    element instanceof HTMLTextAreaElement
      ? HTMLTextAreaElement.prototype
      : HTMLInputElement.prototype;
  const setter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;
  setter?.call(element, value);
  element.dispatchEvent(new Event('input', { bubbles: true }));
}

afterEach(() => {
  window.localStorage.clear();
  document.body.innerHTML = '';
});

describe('GameTeamPanel', () => {
  it('renders a navigable blueprint organization canvas', async () => {
    const onOpenDetails = vi.fn();
    const view = await renderGameTeamPanel(
      <GameTeamPanel mode="organization" onOpenDetails={onOpenDetails} />,
    );

    try {
      expect(view.container.querySelector('[aria-label="组织架构蓝图"]')).not.toBeNull();
      expect(view.container.textContent).not.toContain('组织架构');
      expect(view.container.textContent).toContain('制作人');
      expect(view.container.textContent).toContain('直属总监');
      expect(view.container.textContent).toContain('玩法策划');
      expect(view.container.querySelectorAll('svg').length).toBeGreaterThan(8);

      const locateTechnicalDirector = view.container.querySelector<HTMLButtonElement>(
        '[aria-label="定位 技术总监"]',
      );
      expect(locateTechnicalDirector).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        locateTechnicalDirector?.click();
      });

      expect(window.localStorage.getItem('freeultracode.gameTeam.selectedNode.v1')).toBe(
        'technical-director',
      );

      const locateClientDevelopment = view.container.querySelector<HTMLButtonElement>(
        '[aria-label="定位 客户端开发"]',
      );
      expect(locateClientDevelopment).toBeInstanceOf(HTMLButtonElement);
      expect(
        view.container.querySelector('[aria-label="定位 引擎开发"]'),
      ).toBeInstanceOf(HTMLButtonElement);
      expect(
        view.container.querySelector('[aria-label="定位 技术美术"]'),
      ).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        locateClientDevelopment?.click();
      });

      expect(window.localStorage.getItem('freeultracode.gameTeam.selectedNode.v1')).toBe(
        'client-development',
      );
      expect(
        view.container.querySelector('[aria-label="定位 引擎开发"]'),
      ).toBeInstanceOf(HTMLButtonElement);

      const searchInput = view.container.querySelector<HTMLInputElement>(
        'input[aria-label="搜索组织岗位"]',
      );
      expect(searchInput).toBeInstanceOf(HTMLInputElement);

      await act(async () => {
        setInputValue(searchInput!, '技术总监');
      });

      const searchResult = Array.from(
        view.container.querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes('技术总监'));
      expect(searchResult).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        searchResult?.click();
      });

      expect(window.localStorage.getItem('freeultracode.gameTeam.selectedNode.v1')).toBe(
        'technical-director',
      );

      const technicalDirector = Array.from(
        view.container.querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes('技术总监'));
      expect(technicalDirector).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        technicalDirector?.click();
      });

      expect(onOpenDetails).toHaveBeenCalledWith('technical-director');
      expect(window.localStorage.getItem('freeultracode.gameTeam.selectedNode.v1')).toBe(
        'technical-director',
      );

      await act(async () => {
        technicalDirector?.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
      });

      expect(onOpenDetails).toHaveBeenCalledWith('technical-director');
    } finally {
      await view.cleanup();
    }
  });

  it('opens details when React Flow itself receives the node pointer press', async () => {
    const onOpenDetails = vi.fn();
    const view = await renderGameTeamPanel(
      <GameTeamPanel mode="organization" onOpenDetails={onOpenDetails} />,
    );

    try {
      const producerWrapper = view.container.querySelector<HTMLElement>(
        '.react-flow__node[data-id="producer"]',
      );
      expect(producerWrapper).toBeInstanceOf(HTMLElement);

      await act(async () => {
        producerWrapper?.dispatchEvent(
          new MouseEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            button: 0,
          }),
        );
      });

      expect(onOpenDetails).toHaveBeenCalledWith('producer');
      expect(window.localStorage.getItem('freeultracode.gameTeam.selectedNode.v1')).toBe(
        'producer',
      );
    } finally {
      await view.cleanup();
    }
  });

  it('renders team role details and inserts skill slash commands', async () => {
    window.localStorage.setItem(
      'freeultracode.gameTeam.selectedNode.v1',
      'technical-director',
    );
    const view = await renderGameTeamPanel();

    try {
      expect(view.container.textContent).toContain('技术总监');
      expect(view.container.textContent).not.toContain('组织架构');
      expect(view.container.querySelector('[role="tree"]')).toBeNull();

      expect(view.container.textContent).toContain('发起功能开发');

      const featureSkill = Array.from(
        view.container.querySelectorAll<HTMLButtonElement>('button'),
      ).find((button) => button.textContent?.includes('发起功能开发'));
      expect(featureSkill).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        featureSkill?.click();
      });

      expect(useStore.getState().composerDraft).toContain('/technical-director');
      expect(useStore.getState().composerDraft).toContain('发起功能开发');
    } finally {
      await view.cleanup();
    }
  });

  it('lets users add, edit, and delete org nodes and skills', async () => {
    const view = await renderGameTeamPanel();

    try {
      const buttons = () =>
        Array.from(view.container.querySelectorAll<HTMLButtonElement>('button'));
      const inputs = () =>
        Array.from(view.container.querySelectorAll<HTMLInputElement>('input'));
      const textareas = () =>
        Array.from(view.container.querySelectorAll<HTMLTextAreaElement>('textarea'));

      const addNode = buttons().find(
        (button) => button.getAttribute('aria-label') === '添加下级岗位',
      );
      expect(addNode).toBeInstanceOf(HTMLButtonElement);

      await act(async () => {
        addNode?.click();
      });

      const nodeId = inputs().find((input) => input.value.includes('-role'));
      const nodeLabel = inputs().find((input) => input.value === '新岗位');
      expect(nodeId).toBeInstanceOf(HTMLInputElement);
      expect(nodeLabel).toBeInstanceOf(HTMLInputElement);

      await act(async () => {
        setInputValue(nodeId!, 'custom-role');
        setInputValue(nodeLabel!, '自定义岗位');
      });

      const saveNode = buttons().find((button) => button.textContent?.includes('保存'));
      await act(async () => {
        saveNode?.click();
      });

      expect(view.container.textContent).toContain('自定义岗位');

      const addSkill = buttons().find(
        (button) => button.getAttribute('aria-label') === '新增 Skill',
      );
      await act(async () => {
        addSkill?.click();
      });

      const skillInputs = inputs();
      const skillId = skillInputs.find((input) => input.value.includes(':skill'));
      const skillLabel = skillInputs.find((input) => input.value === '新 Skill');
      expect(skillId).toBeInstanceOf(HTMLInputElement);
      expect(skillLabel).toBeInstanceOf(HTMLInputElement);

      await act(async () => {
        setInputValue(skillId!, 'custom-skill');
        setInputValue(skillLabel!, '自定义 Skill');
      });

      const skillPrompt = textareas().find((textarea) =>
        textarea.placeholder.includes('插入输入框'),
      );
      expect(skillPrompt).toBeInstanceOf(HTMLTextAreaElement);
      await act(async () => {
        setInputValue(skillPrompt!, '执行自定义 Skill。');
      });

      const saveSkill = buttons().filter((button) =>
        button.textContent?.includes('保存'),
      )[0];
      await act(async () => {
        saveSkill?.click();
      });

      expect(view.container.textContent).toContain('自定义 Skill');

      const editSkill = buttons().find(
        (button) => button.getAttribute('aria-label') === '编辑 自定义 Skill',
      );
      await act(async () => {
        editSkill?.click();
      });

      const editSkillLabel = inputs().find((input) => input.value === '自定义 Skill');
      expect(editSkillLabel).toBeInstanceOf(HTMLInputElement);
      await act(async () => {
        setInputValue(editSkillLabel!, '重命名 Skill');
      });

      const saveEditedSkill = buttons().find((button) =>
        button.textContent?.includes('保存'),
      );
      await act(async () => {
        saveEditedSkill?.click();
      });

      expect(view.container.textContent).toContain('重命名 Skill');

      const deleteSkill = buttons().find(
        (button) => button.getAttribute('aria-label') === '删除 重命名 Skill',
      );
      await act(async () => {
        deleteSkill?.click();
      });

      expect(view.container.textContent).not.toContain('重命名 Skill');
      expect(view.container.textContent).toContain('暂无 Skill');

      const deleteNode = buttons().find(
        (button) => button.getAttribute('aria-label') === '删除岗位',
      );
      await act(async () => {
        deleteNode?.click();
      });

      expect(view.container.textContent).not.toContain('自定义岗位');
    } finally {
      await view.cleanup();
    }
  });
});
