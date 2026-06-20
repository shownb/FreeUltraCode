// GameSkill catalog: the single OOP source of truth for FreeUltraCode's own
// slash commands. Every app-introduced command is a `GameSkill` (or a subclass
// of it), so the standard six-part protocol
// (触发词 / 允许工具 / 步骤 / 输出格式 / 停止条件 / 验证方式) is authored and
// managed in one place. `slashCommands.ts` derives the runtime SLASH_COMMANDS
// data layer from this registry.
//
// CONTRACT: Generic prompt shortcuts (/help, /plan, /diagnose, /review,
// /explain, /test) are NOT GameSkills — they are generic CLI semantics, not
// introduced by this app — and stay defined directly in `slashCommands.ts`.
import type { Locale } from '@/lib/i18n';

export type LocalizedText = Partial<Record<Locale, string>>;

export type GameSkillCategory =
  | 'orchestration'
  | 'image'
  | 'sprite'
  | 'mesh'
  | 'music'
  | 'video'
  | 'speech'
  | 'worldmodel'
  | 'ui'
  | 'unreal'
  | 'session';

/** The standard six-part protocol every GameSkill must declare. */
export interface GameSkillProtocol {
  /** 触发词 */
  triggers: string;
  /** 允许工具 */
  allowedTools: string;
  /** 步骤 */
  steps: string[];
  /** 输出格式 */
  outputFormat: string;
  /** 停止条件 */
  stopConditions: string;
  /** 验证方式 */
  verification: string;
}

/** The runtime slash-command projection consumed by the data layer. */
export interface GameSkillCommand {
  name: string;
  label: LocalizedText;
  detail: LocalizedText;
  text: LocalizedText;
}

export interface GameSkillConfig {
  name: string;
  category: GameSkillCategory;
  label: LocalizedText;
  detail: LocalizedText;
  insertText?: LocalizedText;
  protocol: GameSkillProtocol;
}

const EMPTY_TEXT: LocalizedText = { 'zh-CN': '', 'en-US': '' };

/**
 * Base class for every FreeUltraCode-introduced slash command. Holds the
 * localized presentation fields plus the standard six-part protocol, and
 * projects itself into the runtime SLASH_COMMANDS shape via `toCommand()`.
 */
export class GameSkill {
  readonly name: string;
  readonly category: GameSkillCategory;
  readonly label: LocalizedText;
  readonly detail: LocalizedText;
  readonly insertText: LocalizedText;
  readonly protocol: GameSkillProtocol;

  constructor(config: GameSkillConfig) {
    this.name = config.name;
    this.category = config.category;
    this.label = config.label;
    this.detail = config.detail;
    this.insertText = config.insertText ?? EMPTY_TEXT;
    this.protocol = config.protocol;
  }

  /** Project into the runtime slash-command data shape. */
  toCommand(): GameSkillCommand {
    return {
      name: this.name,
      label: this.label,
      detail: this.detail,
      text: this.insertText,
    };
  }
}

export interface ModeStartConfig {
  name: string;
  category: GameSkillCategory;
  label: LocalizedText;
  detail: LocalizedText;
  /** Protocol with `verification` authored WITHOUT the mode-on suffix. */
  protocol: GameSkillProtocol;
}

/**
 * A mode-enter command. Appends the shared "模式已置为开启" verification suffix so
 * every `*-mode-start` skill validates the toggle the same way.
 */
export class ModeStartSkill extends GameSkill {
  constructor(config: ModeStartConfig) {
    super({
      name: config.name,
      category: config.category,
      label: config.label,
      detail: config.detail,
      insertText: EMPTY_TEXT,
      protocol: {
        ...config.protocol,
        verification: `${config.protocol.verification}；模式已置为开启。`,
      },
    });
  }
}

export interface ModeEndConfig {
  name: string;
  category: GameSkillCategory;
  modeNameZh: string;
  label: LocalizedText;
  detail: LocalizedText;
}

/**
 * A mode-exit command. Every `*-mode-end` skill shares the same protocol: it
 * only toggles mode state off and returns to AI coding, so all six parts are
 * derived automatically from the mode name.
 */
export class ModeEndSkill extends GameSkill {
  constructor(config: ModeEndConfig) {
    super({
      name: config.name,
      category: config.category,
      label: config.label,
      detail: config.detail,
      insertText: EMPTY_TEXT,
      protocol: {
        triggers: `${config.name}、退出${config.modeNameZh}`,
        allowedTools: '无（仅切换模式状态）',
        steps: [`关闭${config.modeNameZh}，回到 AI 编程。`],
        outputFormat: '模式已退出的确认。',
        stopConditions: '模式关闭即结束。',
        verification: '后续消息不再走该模式；模式状态为关闭。',
      },
    });
  }
}
