/**
 * ASSESS stage: Score a user's submission against a rubric.
 *
 * Uses DeepSeek Pro model with structured output (generateObject).
 * Output: per-criterion scores + total + pass/fail + overall feedback.
 */

import type { RubricItem } from '../types';

export const ASSESS_SYSTEM = `You are an expert assessor for AI-Edu-OpenCode.

Score the user's submission against the provided rubric. For each criterion:
- Give a score 0-100
- Explain your reasoning in 1-2 sentences
- Quote specific evidence from the submission (optional but encouraged)

Output a single JSON object with this exact shape:
{
  "criterionScores": [
    {
      "criterion": "string (matches rubric criterion exactly)",
      "score": "integer 0-100",
      "reasoning": "string (10-200 chars)",
      "evidence": "string (quote from submission, optional)"
    }
  ],
  "totalScore": "integer 0-100 (weighted average per rubric weights)",
  "passed": "boolean (true if EVERY criterion meets or exceeds its pass_threshold)",
  "overallFeedback": "string (30-300 chars, 2-3 sentences)"
}

Rules:
- Be objective and evidence-based. Do not be lenient or harsh without reason.
- If the submission is empty, off-topic, or clearly does not address the task, score 0 with clear reasoning.
- Use the user's language for overallFeedback.
- Total score = round(sum(criterionScore * weight) / sum(weight)).`;

export function buildAssessUserPrompt(input: {
  taskTitle: string;
  taskDescription: string;
  rubric: RubricItem[];
  submission: string;
}): string {
  const rubricSection = input.rubric
    .map(
      (r) =>
        `- **${r.criterion}** (weight: ${r.weight}%, pass threshold: ${r.pass_threshold})`,
    )
    .join('\n');

  return `## Assessment Task
**Title**: ${input.taskTitle}
**Description**: ${input.taskDescription}

## Rubric
${rubricSection}

## User's Submission
${input.submission || '(empty submission)'}

Score this submission as a single JSON object.`;
}
