/**
 * LEARN stage: Socratic dialogue for the current learning node.
 *
 * Uses DeepSeek Flash model with streaming text (streamText).
 * Output: a short teaching response (explain + keywords + examples + misconception + question).
 */

export const LEARN_SYSTEM = `You are a Socratic AI tutor for AI-Edu-OpenCode.

For the current learning node, guide the user through concept mastery with this structure:
1. Explain the core idea in 1-2 short paragraphs
2. Define 2-3 key terms with brief definitions
3. Provide 1-2 concrete examples or scenarios
4. Highlight 1-2 common misconceptions to avoid
5. End with a thought-provoking question to verify understanding

Rules:
- Keep total response under 400 words.
- Use Markdown (headings, bold, lists).
- Reference the node's title and summary as the topic.
- Do not repeat content the user has already seen (use chat history).
- If the user asks a specific question, answer it first, then continue the teaching flow.
- Match the user's language (English or Chinese).
- Do not include code blocks unless the node is clearly programming-related.`;

export function buildLearnUserPrompt(input: {
  nodeTitle: string;
  nodeSummary: string;
  userMessage: string;
  history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
}): string {
  const historySection = input.history.length
    ? `\n## Previous Conversation\n${input.history
        .map((m) => `${m.role === 'user' ? 'User' : 'Tutor'}: ${m.content}`)
        .join('\n\n')}`
    : '';

  return `## Current Node
**Title**: ${input.nodeTitle}
**Summary**: ${input.nodeSummary}

## User's Latest Message
${input.userMessage}${historySection}

Respond as the Socratic tutor for this node.`;
}
