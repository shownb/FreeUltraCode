import { DATA, type ConsensusStrategy, type IRGraph, type IRNode } from './ir';

/**
 * Free, deterministic complexity heuristic used at AUTHORING time (NOT during a
 * run) to decide whether an `agent` node should be upgraded to a `consensus`
 * node. Keeping it authoring-time means consensus stays a visible, first-class
 * node (the graph is the truth) and the exported script is portable — rather
 * than silently escalating an agent at run time.
 *
 * Signals (any one fires): long prompt, several sub-goals, multiple data inputs
 * (synthesising upstreams), or high-stakes keywords. Zero model calls.
 */
export interface ConsensusFit {
  fit: boolean;
  /** Suggested default strategy when upgrading. */
  strategy: ConsensusStrategy;
  /** Short human-readable reason (for the suggestion chip tooltip). */
  reason: string;
}

const HIGH_STAKES =
  /(审计|安全|架构|重构|审查|验证|评审|critical|security|architect|refactor|migrat|audit|review|verif)/i;
const ADVERSARIAL_HINT = /(安全|security|审计|audit|漏洞|vulnerab|风险|risk)/i;

/** Count rough sub-goals: list markers, conjunctions, and clause separators. */
function subGoalCount(text: string): number {
  const markers = text.match(/(\n\s*[-*]\s)|(\d+\s*[.、)])|[;；]| and |和|并且|然后|其次|最后/gi);
  return markers ? markers.length : 0;
}

/** Assess whether `node` (typically an agent) is complex enough to warrant consensus. */
export function assessConsensusFit(node: IRNode, workflow: IRGraph): ConsensusFit {
  const miss: ConsensusFit = { fit: false, strategy: 'multi-lens', reason: '' };
  if (node.type !== 'agent') return miss;

  const prompt = String(node.params.prompt ?? node.label ?? '');
  const len = prompt.trim().length;
  const goals = subGoalCount(prompt);
  const dataIns = workflow.edges.filter(
    (e) => e.kind === DATA && e.to.node === node.id,
  ).length;
  const stakes = HIGH_STAKES.test(prompt);

  const reasons: string[] = [];
  if (len > 600) reasons.push('提示较长');
  if (goals >= 3) reasons.push(`含 ${goals} 个子目标`);
  if (dataIns >= 2) reasons.push(`汇聚 ${dataIns} 路上游`);
  if (stakes) reasons.push('涉及高风险/审查类工作');

  if (reasons.length === 0) return miss;
  const strategy: ConsensusStrategy = ADVERSARIAL_HINT.test(prompt)
    ? 'adversarial'
    : 'multi-lens';
  return { fit: true, strategy, reason: reasons.join('、') };
}

/**
 * Distinct angles used when generating candidate blueprints by consensus (the
 * "tournament" pattern applied to AI 改图 itself): each candidate emphasises a
 * different design lens, then a judge merges the best. Candidate count = length.
 */
export const GENERATION_ANGLES = [
  '最小充分：用最小但完整的结构覆盖需求，避免过度设计与冗余节点。',
  '健壮性：重点覆盖边界、异常与失败回退，并补齐成功/验收标准节点。',
  '并行与质量：尽量并行化彼此独立的步骤；对关键/高风险步骤用 consensus 节点交叉验证。',
];

/** Pick `count` generation angles (cycling with a variation suffix when count exceeds the base set). */
export function generationAngles(count: number): string[] {
  const n = Math.max(2, Math.min(5, Math.floor(count) || 3));
  const out: string[] = [];
  for (let i = 0; i < n; i += 1) {
    out.push(
      i < GENERATION_ANGLES.length
        ? GENERATION_ANGLES[i]
        : `${GENERATION_ANGLES[i % GENERATION_ANGLES.length]}（再给一个取舍不同的版本 #${i + 1}）`,
    );
  }
  return out;
}

/** Generation-time consensus is on unless disabled via localStorage owf_gen_consensus=0. */
export function genConsensusEnabled(): boolean {
  try {
    if (typeof window !== 'undefined') {
      return window.localStorage.getItem('owf_gen_consensus') !== '0';
    }
  } catch {
    /* ignore */
  }
  return true;
}

/**
 * Heuristic: is an AI-改图 request complex enough to warrant multi-candidate
 * consensus generation? Free + deterministic (length / sub-goal markers /
 * high-stakes keywords). Simple requests stay single-call.
 */
export function isComplexGenerationRequest(text: string): boolean {
  if (!genConsensusEnabled()) return false;
  const t = text.trim();
  if (t.length > 200) return true;
  const goals = (t.match(/\n|(\d+\s*[.、)])|然后|以及|其次|最后|；|;/g) ?? []).length;
  if (goals >= 3) return true;
  return /(审计|安全|架构|重构|迁移|系统|全面|完整|端到端|多角度|交叉验证|大规模|migrat|architect|audit|security|refactor)/i.test(
    t,
  );
}

/** Default differentiated lens prompts seeded when converting an agent → consensus. */
export function defaultConsensusLenses(target: string): { prompt: string; schema?: string }[] {
  const t = target.trim();
  const base = t ? `\n\n目标：\n${t}` : '';
  return [
    { prompt: `从「正确性」角度审查并给出结论。${base}` },
    { prompt: `从「安全性 / 边界情况」角度审查并给出结论。${base}` },
    { prompt: `从「可行性 / 可复现性」角度审查并给出结论。${base}` },
  ];
}
