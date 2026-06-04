/**
 * POST /api/node-progress
 * Body: { planId, nodeId, stage, status }
 *
 * Marks a node as in-progress / learned / practiced / mastered, and
 * recomputes the parent plan's status.
 */

import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/config';
import { markNodeStage } from '@/lib/ai/state-machine';

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const body = (await req.json()) as {
    planId?: string;
    nodeId?: string;
    stage?: 'learn' | 'practice';
    status?: 'in_progress' | 'learned' | 'practiced' | 'mastered';
  };

  const { planId, nodeId, stage, status } = body;
  if (!planId || !nodeId || !stage || !status) {
    return new NextResponse('Missing required fields', { status: 400 });
  }

  try {
    await markNodeStage({
      userId: session.user.id!,
      planId,
      nodeId,
      stage,
      status,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[node-progress] failed:', err);
    return new NextResponse(
      err instanceof Error ? err.message : 'Internal error',
      { status: 500 },
    );
  }
}
