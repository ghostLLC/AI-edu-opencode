/**
 * Mark a node's progress after completing a stage.
 *
 * Idempotent: calls upsert on (userId, planId, nodeId) so re-marking is safe.
 * Also bumps the plan status to track forward motion.
 */

import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { learningPlans, nodeProgress, planNodes } from '@/lib/db/schema';

export type NodeStage = 'learn' | 'practice';

export async function markNodeStage(opts: {
  userId: string;
  planId: string;
  nodeId: string;
  stage: NodeStage;
  status: 'in_progress' | 'learned' | 'practiced' | 'mastered';
}): Promise<void> {
  const now = new Date();

  // Upsert node_progress row
  await db
    .insert(nodeProgress)
    .values({
      userId: opts.userId,
      planId: opts.planId,
      nodeId: opts.nodeId,
      stage: opts.stage,
      status: opts.status,
      startedAt: now,
      completedAt:
        opts.status === 'learned' ||
        opts.status === 'practiced' ||
        opts.status === 'mastered'
          ? now
          : null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [nodeProgress.userId, nodeProgress.planId, nodeProgress.nodeId],
      set: {
        stage: opts.stage,
        status: opts.status,
        completedAt:
          opts.status === 'learned' ||
          opts.status === 'practiced' ||
          opts.status === 'mastered'
            ? now
            : null,
        updatedAt: now,
      },
    });

  // Recompute plan status based on node progress
  await updatePlanStatusFromProgress(opts.planId);
}

async function updatePlanStatusFromProgress(planId: string): Promise<void> {
  // Load all nodes for this plan + all progress rows
  const [allNodes, progressRows] = await Promise.all([
    db.select().from(planNodes).where(eq(planNodes.planId, planId)),
    db.select().from(nodeProgress).where(eq(nodeProgress.planId, planId)),
  ]);

  if (allNodes.length === 0) return;

  const progressByNode = new Map(progressRows.map((p) => [p.nodeId, p]));

  const isNodeDone = (
    node: { id: string; content: unknown },
    p: { status: string } | undefined,
  ): boolean => {
    if (!p) return false;
    const nc = node.content as { stage?: string } | null;
    const ns = (nc?.stage ?? 'learn') as 'learn' | 'practice' | 'assess';
    if (ns === 'learn') return p.status === 'learned' || p.status === 'mastered';
    if (ns === 'practice') return p.status === 'practiced' || p.status === 'mastered';
    return p.status === 'mastered';
  };

  const allDone = allNodes.every((n) => isNodeDone(n, progressByNode.get(n.id)));

  // Compute in-progress stage: find the first stage that has unfinished work
  let status = 'in_learn';
  const stageOrder: Array<'learn' | 'practice' | 'assess'> = ['learn', 'practice', 'assess'];
  for (const stageName of stageOrder) {
    const stageNodes = allNodes.filter((n) => {
      const nc = n.content as { stage?: string } | null;
      return (nc?.stage ?? 'learn') === stageName;
    });
    if (stageNodes.length === 0) continue;
    const stageDone = stageNodes.every((n) => isNodeDone(n, progressByNode.get(n.id)));
    if (!stageDone) {
      status =
        stageName === 'learn'
          ? 'in_learn'
          : stageName === 'practice'
            ? 'in_practice'
            : 'in_assess';
      break;
    }
  }

  await db
    .update(learningPlans)
    .set({
      status: allDone ? 'completed' : status,
      completedAt: allDone ? new Date() : null,
      updatedAt: new Date(),
    })
    .where(eq(learningPlans.id, planId));
}
