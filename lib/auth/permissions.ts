import 'server-only';
import { auth } from './config';

export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error('UNAUTHORIZED');
  }
  return session.user;
}

export async function getOptionalUser() {
  const session = await auth();
  return session?.user ?? null;
}

export async function requireOwnership(
  ownerId: string,
): Promise<{ userId: string }> {
  const user = await requireUser();
  if (user.id !== ownerId) {
    throw new Error('FORBIDDEN');
  }
  return { userId: user.id };
}
