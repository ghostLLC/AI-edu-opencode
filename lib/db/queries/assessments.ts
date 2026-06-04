/**
 * Find-or-create an Assessment row for a given plan node.
 *
 * On first visit to the assess page for a node, we lazily create an
 * Assessment with a default task description (the node summary) and a
 * 3-criterion rubric. The user then submits work, and the orchestrator's
 * assess stage scores it against this rubric.
 */

import { and, eq } from 'drizzle-orm';
import { db } from '@/lib/db/client';
import { assessments, planNodes } from '@/lib/db/schema';
import type { RubricItem } from '@/lib/ai/types';

const DEFAULT_RUBRIC: RubricItem[] = [
  { criterion: 'Correctness', weight: 50, pass_threshold: 60 },
  { criterion: 'Completeness', weight: 30, pass_threshold: 60 },
  { criterion: 'Clarity', weight: 20, pass_threshold: 50 },
];

/**
 * Find-or-create an Assessment row for a given plan node.
 *
 * On first visit to the assess page for a node, we lazily create an
 * Assessment with a default task description (the node summary) and a
 * 3-criterion rubric. The user then submits work, and the orchestrator's
 * assess stage scores it against this rubric.
 *
 * Tracking note: assessments.nodeId does not exist as a column. For v1
 * we match by planId + task title (which is the node title). If a user
 * revisits the same node, the same assessment is reused.
 */
export async function findOrCreateAssessmentForNode(opts: {
  planId: string;
  nodeId: string;
  userId: string;
}): Promise<{ id: string; taskTitle: string; taskDescription: string }> {
  const { planId, nodeId, userId } = opts;

  const [node] = await db
    .select()
    .from(planNodes)
    .where(eq(planNodes.id, nodeId))
    .limit(1);

  if (!node) {
    throw new Error(`Plan node not found: ${nodeId}`);
  }

  const existingRows = await db
    .select()
    .from(assessments)
    .where(and(eq(assessments.planId, planId), eq(assessments.userId, userId)))
    .limit(50);

  const match = existingRows.find((a) => a.taskTitle === node.title);
  if (match) {
    return {
      id: match.id,
      taskTitle: match.taskTitle,
      taskDescription: match.taskDescription,
    };
  }

  const content = node.content as { paragraphs?: string[] } | null;
  const summary = content?.paragraphs?.[0] ?? node.title;

  const [created] = await db
    .insert(assessments)
    .values({
      planId,
      userId,
      taskTitle: node.title,
      taskDescription: `Complete the assessment for "${node.title}".\n\nReference: ${summary}`,
      deliverableType: 'other',
      rubric: DEFAULT_RUBRIC,
      status: 'pending',
    })
    .returning({ id: assessments.id });

  if (!created) {
    throw new Error('Failed to create assessment');
  }

  return {
    id: created.id,
    taskTitle: node.title,
    taskDescription: `Complete the assessment for "${node.title}".\n\nReference: ${summary}`,
  };
}
