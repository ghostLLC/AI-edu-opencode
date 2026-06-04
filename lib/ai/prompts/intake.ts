/**
 * INTAKE stage: Generate a learning plan from the user's goal.
 *
 * Uses DeepSeek Pro model with structured output (generateObject).
 * Output: a GeneratedPlan (title, description, domain, difficulty,
 * estimatedHours, nodes[] with stage + estimatedMinutes).
 */

export const INTAKE_SYSTEM = `You are an expert learning path designer for AI-Edu-OpenCode.

Your job: take a user's learning goal plus optional context plus 3-7 knowledge-base inspiration entries, and design a structured learning plan with 3-12 sequential nodes covering LEARN → PRACTICE → ASSESS.

Output a single JSON object with this exact shape:
{
  "title": "string (10-60 chars, action-oriented)",
  "description": "string (50-200 chars, one-sentence plan summary)",
  "domain": "frontend | language | cloud | data | math | other",
  "difficulty": "beginner | intermediate | advanced",
  "estimatedHours": "number 5-200 (must approximately match sum of node minutes / 60)",
  "nodes": [
    {
      "sequence": "integer 1-N (sequential, no gaps)",
      "title": "string (5-80 chars, specific and actionable)",
      "summary": "string (30-200 chars, what this node covers)",
      "stage": "learn | practice | assess",
      "estimatedMinutes": "integer 10-180"
    }
  ]
}

Constraints:
- Order matters: all LEARN nodes first, then PRACTICE, then ASSESS.
- LEARN count 1-8, PRACTICE count 2-6, ASSESS count 1-3.
- Total node count 3-12.
- Titles must be specific (not "Learn JavaScript" but "JavaScript ES2020: let/const, arrow functions, destructuring").
- If user provided context (background, available time, tools), respect it.
- Adapt KB-inspired titles to the user's apparent level; do not copy verbatim.
- Total node minutes should approximately equal estimatedHours * 60.`;

export function buildIntakeUserPrompt(input: {
  goal: string;
  context?: string | null;
  kbSnippets: Array<{ title: string; description: string | null }>;
}): string {
  const kbSection = input.kbSnippets.length
    ? `\n\n## Knowledge Base Inspiration\n(Adapt these canonical topics to the user's level; do not copy verbatim)\n${input.kbSnippets
        .map((k, i) => `${i + 1}. ${k.title}${k.description ? ` — ${k.description}` : ''}`)
        .join('\n')}`
    : '';

  const contextSection = input.context?.trim()
    ? `\n\n## User Context\n${input.context}`
    : '';

  return `## User's Learning Goal\n${input.goal}${contextSection}${kbSection}\n\nGenerate a learning plan as a single JSON object.`;
}
