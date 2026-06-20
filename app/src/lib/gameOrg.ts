import defaultGameOrgDefinition from '@/config/gameOrgDefaults.json';
import {
  gameExpertSlashCommand,
  getGameExpertCatalog,
  normalizeGameExpertSettings,
  type GameExpertDefinition,
  type GameExpertSettings,
} from './gameExperts';
import {
  localizedGameExpertName,
  localizedGameGroupLabel,
} from './gameExpertI18n';
import {
  localizedGameExpertRootCommand,
  localizeGameOrgNodeText,
  localizeGameOrgSkillText,
} from './gameOrgI18n';
import type { Locale } from './i18n';

export interface GameOrgSkillDefinition {
  id: string;
  label: string;
  summary: string;
  prompt: string;
  collaboratorExpertIds?: string[];
}

export interface GameOrgNodeDefinition {
  id: string;
  label: string;
  icon?: GameOrgNodeIcon;
  summary?: string;
  role?: string;
  expertIds?: string[];
  skills?: GameOrgSkillDefinition[];
  children?: GameOrgNodeDefinition[];
}

export const GAME_ORG_NODE_ICONS = [
  'producer',
  'design',
  'gameplay',
  'systems',
  'economy',
  'level',
  'narrative',
  'writing',
  'world',
  'tech',
  'client',
  'engine',
  'backend',
  'technical-art',
  'tools',
  'data',
  'art',
  'concept',
  'character',
  'environment',
  'ui',
  'vfx',
  'audio',
  'sound',
  'qa',
  'performance',
  'accessibility',
  'release',
  'community',
  'localization',
  'analytics',
  'team',
] as const;

export type GameOrgNodeIcon = (typeof GAME_ORG_NODE_ICONS)[number];

export interface ResolvedGameOrgSkill extends GameOrgSkillDefinition {
  commandText: string;
  collaboratorLabels: string[];
}

export interface ResolvedGameOrgNode {
  id: string;
  label: string;
  icon: GameOrgNodeIcon;
  summary: string;
  role: string;
  path: string[];
  expertIds: string[];
  experts: GameExpertDefinition[];
  groupLabels: string[];
  commandText: string | null;
  skills: ResolvedGameOrgSkill[];
  children: ResolvedGameOrgNode[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object' && !Array.isArray(value);
}

function trimString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

function optionalString(value: unknown): string | undefined {
  const trimmed = trimString(value);
  return trimmed ? trimmed : undefined;
}

function uniqueStrings(values: readonly string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const value of values) {
    const trimmed = value.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

function stringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return uniqueStrings(value.filter((item): item is string => typeof item === 'string'));
}

function isGameOrgNodeIcon(value: unknown): value is GameOrgNodeIcon {
  return (
    typeof value === 'string' &&
    (GAME_ORG_NODE_ICONS as readonly string[]).includes(value)
  );
}

export function normalizeGameOrgSkillDefinition(
  value: unknown,
  fallbackId: string,
): GameOrgSkillDefinition | null {
  if (!isRecord(value)) return null;

  const id = trimString(value.id) || fallbackId;
  const label = trimString(value.label) || id;
  const prompt =
    trimString(value.prompt) ||
    `请以${label}相关职责处理以下需求，并给出可执行建议、风险和验收标准。`;
  const summary = trimString(value.summary) || prompt;
  const collaboratorExpertIds = stringList(value.collaboratorExpertIds);

  return {
    id,
    label,
    summary,
    prompt,
    ...(collaboratorExpertIds.length > 0 ? { collaboratorExpertIds } : {}),
  };
}

export function normalizeGameOrgNodeDefinition(
  value: unknown,
  fallbackId = 'game-team',
): GameOrgNodeDefinition | null {
  if (!isRecord(value)) return null;

  const id = trimString(value.id) || fallbackId;
  const label = trimString(value.label) || id;
  const expertIds = stringList(value.expertIds);
  const rawChildren = Array.isArray(value.children) ? value.children : [];
  const children = rawChildren
    .map((child, index) => normalizeGameOrgNodeDefinition(child, `${id}-${index + 1}`))
    .filter((child): child is GameOrgNodeDefinition => Boolean(child));

  const hasSkillsProperty = Object.prototype.hasOwnProperty.call(value, 'skills');
  const rawSkills = Array.isArray(value.skills) ? value.skills : [];
  const skills = hasSkillsProperty
    ? rawSkills
        .map((skill, index) =>
          normalizeGameOrgSkillDefinition(skill, `${id}:skill-${index + 1}`),
        )
        .filter((skill): skill is GameOrgSkillDefinition => Boolean(skill))
    : undefined;

  return {
    id,
    label,
    ...(isGameOrgNodeIcon(value.icon) ? { icon: value.icon } : {}),
    ...(optionalString(value.summary) ? { summary: optionalString(value.summary) } : {}),
    ...(optionalString(value.role) ? { role: optionalString(value.role) } : {}),
    ...(expertIds.length > 0 ? { expertIds } : {}),
    ...(skills !== undefined ? { skills } : {}),
    ...(children.length > 0 ? { children } : {}),
  };
}

function createDefaultGameOrgDefinition(): GameOrgNodeDefinition {
  return {
    id: 'game-team',
    label: '游戏团队',
    icon: 'team',
    summary: '当前项目的游戏专家团队。',
    role: '按项目需求提供游戏开发协作。',
    skills: [],
    children: [],
  };
}

export function cloneGameOrgDefinition(
  definition: GameOrgNodeDefinition,
): GameOrgNodeDefinition {
  return {
    ...definition,
    expertIds: definition.expertIds ? [...definition.expertIds] : undefined,
    skills: definition.skills?.map((skill) => ({
      ...skill,
      collaboratorExpertIds: skill.collaboratorExpertIds
        ? [...skill.collaboratorExpertIds]
        : undefined,
    })),
    children: definition.children?.map(cloneGameOrgDefinition),
  };
}

export const DEFAULT_GAME_ORG_DEFINITION: GameOrgNodeDefinition =
  normalizeGameOrgNodeDefinition(defaultGameOrgDefinition, 'producer') ??
  createDefaultGameOrgDefinition();

const GAME_ORG_DEFINITION_STORAGE_KEY = 'freeultracode.gameOrgDefinition.v1';

function hasStorage(): boolean {
  return typeof window !== 'undefined' && !!window.localStorage;
}

export function loadGameOrgDefinition(): GameOrgNodeDefinition {
  if (!hasStorage()) return cloneGameOrgDefinition(DEFAULT_GAME_ORG_DEFINITION);
  try {
    const raw = window.localStorage.getItem(GAME_ORG_DEFINITION_STORAGE_KEY);
    if (!raw) return cloneGameOrgDefinition(DEFAULT_GAME_ORG_DEFINITION);
    return (
      normalizeGameOrgNodeDefinition(JSON.parse(raw), DEFAULT_GAME_ORG_DEFINITION.id) ??
      cloneGameOrgDefinition(DEFAULT_GAME_ORG_DEFINITION)
    );
  } catch {
    return cloneGameOrgDefinition(DEFAULT_GAME_ORG_DEFINITION);
  }
}

export function saveGameOrgDefinition(definition: GameOrgNodeDefinition): void {
  if (!hasStorage()) return;
  try {
    const normalized =
      normalizeGameOrgNodeDefinition(definition, DEFAULT_GAME_ORG_DEFINITION.id) ??
      DEFAULT_GAME_ORG_DEFINITION;
    window.localStorage.setItem(
      GAME_ORG_DEFINITION_STORAGE_KEY,
      JSON.stringify(normalized),
    );
  } catch {
    // Quota / serialization errors are non-fatal.
  }
}

export function resetGameOrgDefinition(): GameOrgNodeDefinition {
  const next = cloneGameOrgDefinition(DEFAULT_GAME_ORG_DEFINITION);
  if (hasStorage()) {
    try {
      window.localStorage.removeItem(GAME_ORG_DEFINITION_STORAGE_KEY);
    } catch {
      // non-fatal
    }
  }
  return next;
}

function expertLabel(
  expert: GameExpertDefinition | undefined,
  fallback: string,
  locale: Locale,
): string {
  return expert ? localizedGameExpertName(expert, locale) : fallback;
}

function fallbackSkill(node: ResolvedGameOrgNode, locale: Locale): GameOrgSkillDefinition {
  if (locale !== 'zh-CN') {
    return {
      id: `${node.id}:consult`,
      label: `Consult ${node.label}`,
      summary: node.summary,
      prompt: `Act as ${node.label} for the following request, and provide actionable recommendations, risks, and acceptance criteria within that role's scope.`,
      collaboratorExpertIds: node.expertIds,
    };
  }
  return {
    id: `${node.id}:consult`,
    label: `调用${node.label}`,
    summary: node.summary,
    prompt: `请以${node.label}身份处理以下需求，并给出职责内的可执行建议、风险和验收标准。`,
    collaboratorExpertIds: node.expertIds,
  };
}

function buildCommandText(
  expert: GameExpertDefinition | undefined,
  prompt: string,
): string {
  return `${expert ? gameExpertSlashCommand(expert) : '/游戏专家'} ${prompt}`.trim();
}

function resolveSkill(
  skill: GameOrgSkillDefinition,
  nodeId: string,
  primaryExpert: GameExpertDefinition | undefined,
  expertById: Map<string, GameExpertDefinition>,
  locale: Locale,
): ResolvedGameOrgSkill {
  const localized = localizeGameOrgSkillText(nodeId, skill.id, locale, skill);
  const collaboratorLabels = uniqueStrings(
    (skill.collaboratorExpertIds ?? [])
      .map((id) => expertById.get(id))
      .filter((expert): expert is GameExpertDefinition => Boolean(expert))
      .map((expert) => localizedGameExpertName(expert, locale)),
  );
  return {
    ...skill,
    ...localized,
    commandText: buildCommandText(primaryExpert, localized.prompt ?? skill.prompt),
    collaboratorLabels,
  };
}

function resolveNode(
  definition: GameOrgNodeDefinition,
  expertById: Map<string, GameExpertDefinition>,
  locale: Locale,
  parentPath: string[],
): ResolvedGameOrgNode {
  const primaryExpertForLabel = (definition.expertIds ?? [])
    .map((id) => expertById.get(id))
    .find((expert): expert is GameExpertDefinition => Boolean(expert));
  const localizedDefinition = localizeGameOrgNodeText(definition.id, locale, {
    label: definition.label,
    summary: definition.summary,
    role: definition.role,
  });
  const label =
    localizedDefinition.label ||
    expertLabel(primaryExpertForLabel, definition.id, locale);

  const expertIds = uniqueStrings(definition.expertIds ?? []).filter((id) =>
    expertById.has(id),
  );
  const experts = expertIds
    .map((id) => expertById.get(id))
    .filter((expert): expert is GameExpertDefinition => Boolean(expert));

  const children = (definition.children ?? []).map((child) =>
    resolveNode(child, expertById, locale, [...parentPath, label]),
  );

  const primaryExpert = experts[0];
  const path = [...parentPath, label];
  const summary =
    localizedDefinition.summary ??
    primaryExpert?.summary ??
    (locale === 'zh-CN'
      ? `${label} 的项目职责。`
      : `${label} project responsibilities.`);
  const role =
    localizedDefinition.role ??
    (locale === 'zh-CN' ? primaryExpert?.role : undefined) ??
    summary;
  const groupLabels = uniqueStrings(
    experts.map((expert) => localizedGameGroupLabel(expert.group, locale)),
  );

  const node: ResolvedGameOrgNode = {
    id: definition.id,
    label,
    icon: definition.icon ?? (children.length > 0 ? 'team' : 'gameplay'),
    summary,
    role,
    path,
    expertIds,
    experts,
    groupLabels,
    commandText: primaryExpert
      ? `${gameExpertSlashCommand(primaryExpert)} `
      : `${localizedGameExpertRootCommand(locale)} `,
    skills: [],
    children,
  };

  const skills =
    definition.skills !== undefined ? definition.skills : [fallbackSkill(node, locale)];
  node.skills = skills.map((skill) =>
    resolveSkill(skill, definition.id, primaryExpert, expertById, locale),
  );
  return node;
}

export function buildGameOrgTree(
  settings: GameExpertSettings,
  locale: Locale,
  definition: GameOrgNodeDefinition = DEFAULT_GAME_ORG_DEFINITION,
): ResolvedGameOrgNode {
  const normalized = normalizeGameExpertSettings(settings);
  const catalog = getGameExpertCatalog(normalized);
  const expertById = new Map(catalog.map((expert) => [expert.id, expert]));
  const rootDefinition =
    normalizeGameOrgNodeDefinition(definition, DEFAULT_GAME_ORG_DEFINITION.id) ??
    DEFAULT_GAME_ORG_DEFINITION;
  return resolveNode(rootDefinition, expertById, locale, []);
}

export function flattenGameOrgNodes(root: ResolvedGameOrgNode): ResolvedGameOrgNode[] {
  return [root, ...root.children.flatMap(flattenGameOrgNodes)];
}

export function findGameOrgNode(
  root: ResolvedGameOrgNode,
  id: string,
): ResolvedGameOrgNode | null {
  if (root.id === id) return root;
  for (const child of root.children) {
    const match = findGameOrgNode(child, id);
    if (match) return match;
  }
  return null;
}
