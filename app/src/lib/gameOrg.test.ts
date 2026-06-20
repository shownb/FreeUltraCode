import { describe, expect, it } from 'vitest';
import {
  DEFAULT_GAME_EXPERT_SETTINGS,
  normalizeGameExpertSettings,
  parseGameExpertCommand,
} from './gameExperts';
import {
  buildGameOrgTree,
  findGameOrgNode,
  flattenGameOrgNodes,
  type GameOrgNodeDefinition,
} from './gameOrg';

function gameOrgSettings() {
  return normalizeGameExpertSettings({
    ...DEFAULT_GAME_EXPERT_SETTINGS,
    enabled: true,
  });
}

describe('game organization tree', () => {
  it('places producer at the root and exposes director branches', () => {
    const tree = buildGameOrgTree(gameOrgSettings(), 'zh-CN');
    const labels = flattenGameOrgNodes(tree).map((node) => node.label);

    expect(tree.label).toBe('制作人');
    expect(tree.icon).toBe('producer');
    expect(labels).toContain('技术总监');
    expect(labels).toContain('美术总监');
    expect(labels).toContain('QA 负责人');
  });

  it('builds executable skill commands that route through game expert slash parsing', () => {
    const settings = gameOrgSettings();
    const tree = buildGameOrgTree(settings, 'zh-CN');
    const technicalDirector = findGameOrgNode(tree, 'technical-director');
    const featureSkill = technicalDirector?.skills.find(
      (skill) => skill.id === 'feature-development',
    );

    expect(technicalDirector?.icon).toBe('tech');
    expect(featureSkill?.commandText).toContain('/technical-director ');
    const parsed = parseGameExpertCommand(featureSkill?.commandText ?? '', settings);
    expect(parsed?.expertIds).toEqual(['technical-director']);
    expect(parsed?.task).toContain('发起功能开发');
  });

  it('localizes built-in organization labels and skills for English UI', () => {
    const tree = buildGameOrgTree(gameOrgSettings(), 'en-US');
    const technicalDirector = findGameOrgNode(tree, 'technical-director');
    const featureSkill = technicalDirector?.skills.find(
      (skill) => skill.id === 'feature-development',
    );

    expect(tree.label).toBe('Producer');
    expect(technicalDirector?.label).toBe('Technical Director');
    expect(technicalDirector?.summary).toContain('engineering architecture');
    expect(featureSkill?.label).toBe('Start Feature Development');
    expect(featureSkill?.commandText).toContain('/technical-director ');
    expect(featureSkill?.commandText).toContain('Start feature development');
  });

  it('keeps user-customized organization text unchanged when locale changes', () => {
    const definition: GameOrgNodeDefinition = {
      id: 'technical-director',
      label: 'Tech Owner',
      icon: 'tech',
      summary: 'Custom summary',
      role: 'Custom role',
      expertIds: ['technical-director'],
      skills: [
        {
          id: 'feature-development',
          label: 'Custom feature kickoff',
          summary: 'Custom skill summary',
          prompt: 'Custom prompt.',
        },
      ],
    };

    const tree = buildGameOrgTree(gameOrgSettings(), 'en-US', definition);

    expect(tree.label).toBe('Tech Owner');
    expect(tree.summary).toBe('Custom summary');
    expect(tree.role).toBe('Custom role');
    expect(tree.skills[0]?.label).toBe('Custom feature kickoff');
    expect(tree.skills[0]?.commandText).toContain('Custom prompt.');
  });

  it('keeps art style changes attached to the art director branch', () => {
    const tree = buildGameOrgTree(gameOrgSettings(), 'zh-CN');
    const artDirector = findGameOrgNode(tree, 'art-director');

    expect(artDirector?.icon).toBe('art');
    expect(artDirector?.skills.some((skill) => skill.id === 'style-change')).toBe(
      true,
    );
    expect(artDirector?.children.map((child) => child.label)).toEqual(
      expect.arrayContaining([
        '2D 美术 / 概念',
        '角色美术',
        '场景美术',
        'UI 设计',
        'VFX / Shader',
      ]),
    );
  });

  it('builds the org tree from caller-provided editable definitions', () => {
    const definition: GameOrgNodeDefinition = {
      id: 'custom-root',
      label: '自定义负责人',
      icon: 'team',
      summary: '完全自定义的组织根节点。',
      role: '按用户保存的配置工作。',
      skills: [],
      children: [
        {
          id: 'custom-role',
          label: '自定义岗位',
          icon: 'tools',
          skills: [
            {
              id: 'custom-skill',
              label: '自定义 Skill',
              summary: '用户配置的 Skill。',
              prompt: '执行用户配置的 Skill。',
            },
          ],
        },
      ],
    };

    const tree = buildGameOrgTree(gameOrgSettings(), 'zh-CN', definition);

    expect(tree.label).toBe('自定义负责人');
    expect(tree.skills).toEqual([]);
    expect(findGameOrgNode(tree, 'custom-role')?.skills[0]?.label).toBe(
      '自定义 Skill',
    );
    expect(findGameOrgNode(tree, 'custom-role')?.skills[0]?.commandText).toContain(
      '/游戏专家 执行用户配置的 Skill。',
    );
  });
});
