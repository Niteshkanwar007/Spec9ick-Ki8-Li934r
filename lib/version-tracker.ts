import { WorkflowStep, LinearComment } from './types';
import { STEP_DISPLAY_NAMES } from './workflow-constants';

/**
 * Scans Linear comments on an issue to find existing versions of a given step.
 * Matches headers like:
 * "### [Spec9ick-Ki8-Li934r] Specification (v1)"
 * "### [Spec9ick-Ki8-Li934r] Clarifications (v2)"
 */
export function getStepVersions(comments: LinearComment[], step: WorkflowStep): number[] {
  const stepDisplayName = STEP_DISPLAY_NAMES[step];
  // Regex to match e.g. [Spec9ick-Ki8-Li934r] Specification (v2)
  const regex = new RegExp(`\\[Spec9ick-Ki8-Li934r\\]\\s+${stepDisplayName}\\s+\\(v(\\d+)\\)`, 'i');

  const versions: number[] = [];
  for (const comment of comments || []) {
    const match = comment.body.match(regex);
    if (match && match[1]) {
      const v = parseInt(match[1], 10);
      if (!isNaN(v)) {
        versions.push(v);
      }
    }
  }

  return versions.sort((a, b) => a - b);
}

/**
 * Returns the next version number for a step.
 * If no previous versions exist, returns 1.
 * If v1, v2 exist, returns 3.
 */
export function getNextStepVersion(comments: LinearComment[], step: WorkflowStep): number {
  const existing = getStepVersions(comments, step);
  if (existing.length === 0) {
    return 1;
  }
  return existing[existing.length - 1] + 1;
}

/**
 * Formats standard header for a step comment
 */
export function formatCommentHeader(
  step: WorkflowStep,
  version: number,
  stepNumber: number,
  nextCommand: string | null
): string {
  const displayName = STEP_DISPLAY_NAMES[step];
  const nextInfo = nextCommand
    ? `> **Stage**: ${stepNumber} / 7 · **Next Step**: \`${nextCommand}\` (copied to clipboard)\n`
    : `> **Stage**: ${stepNumber} / 7 · **Workflow Complete** 🚀\n`;

  return `### [Spec9ick-Ki8-Li934r] ${displayName} (v${version})\n${nextInfo}\n`;
}
