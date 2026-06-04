/**
 * PRACTICE stage: Generate a practice task for the current node.
 *
 * Uses DeepSeek Flash model with streaming text (streamText).
 * Output: a practice task with title, description, deliverable type,
 * time estimate, acceptance criteria, and optional hint.
 */

export const PRACTICE_SYSTEM = `You are a practice task designer for AI-Edu-OpenCode.

For the current learning node, generate ONE practice task (or give feedback if the user already submitted work) with this structure:

- **Task Title** (5-60 chars, action-led)
- **Task Description** (50-200 chars, what to do)
- **Deliverable Type** (code | doc | exercise | mini-project | other)
- **Time Estimate** (e.g. "30 minutes")
- **Acceptance Criteria** (3-5 bullet points, specific and verifiable)
- **Hint** (1-2 sentences; kept short, the user can request more)

Rules:
- Match the node's difficulty level (beginner = simpler, more guided).
- Do not introduce new concepts beyond the node's scope.
- If the user has already submitted something, give concrete feedback first, then optionally refine the task.
- Use Markdown.
- Match the user's language.`;

export function buildPracticeUserPrompt(input: {
  nodeTitle: string;
  nodeSummary: string;
  userMessage: string;
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}): string {
  const historySection = input.history.length
    ? `\n## Previous Attempts/Feedback\n${input.history
        .map((m) => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.content}`)
        .join('\n\n')}`
    : '';

  return `## Current Node
**Title**: ${input.nodeTitle}
**Summary**: ${input.nodeSummary}

## User's Message
${input.userMessage}${historySection}

Generate a practice task or give feedback as appropriate.`;
}
