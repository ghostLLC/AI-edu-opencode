/**
 * SSE 流式对话端点
 * POST /api/chat
 *
 * Accepts two payload shapes:
 * 1. Direct: { planId, stage, nodeId?, assessmentId?, userMessage, citation? }
 *    - used by the intake form and the assess submission form
 * 2. useChat: { messages: [...], planId, stage, nodeId?, assessmentId?, ... }
 *    - used by the @ai-sdk/react useChat hook for learn/practice
 *    - we extract the last user message's content as userMessage
 */

import { auth } from '@/lib/auth/config';
import { runStage } from '@/lib/ai/orchestrator';

interface ChatBody {
  planId?: string;
  stage?: 'intake' | 'learn' | 'practice' | 'assess';
  nodeId?: string;
  assessmentId?: string;
  userMessage?: string;
  citation?: { keyword: string; nodeId: string };
  // useChat shape
  messages?: Array<{ id: string; role: string; content: string }>;
}

function extractUserMessage(body: ChatBody): string {
  if (typeof body.userMessage === 'string' && body.userMessage.length > 0) {
    return body.userMessage;
  }
  if (Array.isArray(body.messages) && body.messages.length > 0) {
    const last = [...body.messages].reverse().find((m) => m.role === 'user');
    return last?.content ?? '';
  }
  return '';
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new Response('Unauthorized', { status: 401 });
  }

  const body = (await req.json()) as ChatBody;

  if (!body.stage) {
    return new Response('Missing stage', { status: 400 });
  }

  const userMessage = extractUserMessage(body);
  if (!userMessage) {
    return new Response('Missing userMessage', { status: 400 });
  }

  const result = await runStage({
    userId: session.user.id!,
    planId: body.planId ?? '',
    stage: body.stage,
    nodeId: body.nodeId,
    assessmentId: body.assessmentId,
    userMessage,
    citation: body.citation,
  });

  return result.toDataStreamResponse();
}
