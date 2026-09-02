import {SKILLS_INVESTIGADAS} from './registro';
import type {DecisionSkill, SkillInvestigada} from './tipos';

export function porDecision(decision: DecisionSkill): SkillInvestigada[] {
  return SKILLS_INVESTIGADAS.filter((s) => s.decision === decision);
}

export function porId(id: string): SkillInvestigada | undefined {
  return SKILLS_INVESTIGADAS.find((s) => s.id === id);
}

/** Lo único listo para integrar sin más investigación -- decision='usar'. */
export function listasParaUsar(): SkillInvestigada[] {
  return porDecision('usar');
}
