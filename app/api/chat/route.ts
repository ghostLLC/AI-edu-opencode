import { streamText } from 'ai';
import { auth } from '@/lib/auth/config';
import { runStage } from '@/lib/ai/orchestrator';
import { NextResponse } from 'next/server';

// SSE 流式对话端点
// POST /api/chat
// Body: { planId, stage, nodeId?, assessmentId?, userMessage, citation? }
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = (await req.json()) as {
    planId: string;
    stage: 'intake' | 'learn' | 'practice' | 'assess';
    nodeId?: string;
    assessmentId?: string;
    userMessage: string;
    citation?: { keyword: string; nodeId: string };
  };

  // 使用 orchestrator 的流式输出
  const result = await runStage({
    userId: session.user.id!,
    planId: body.planId,
    stage: body.stage,
    nodeId: body.nodeId,
    assessmentId: body.assessmentId,
    userMessage: body.userMessage,
    citation: body.citation,
  });

  return result.toDataStreamResponse();
}

// 用例: streamText import 留作将来直接在 route 里写简单对话
// 当前先走 orchestrator
void streamText;
