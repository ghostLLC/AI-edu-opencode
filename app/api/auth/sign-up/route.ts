import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';

// Sign-up endpoint
// POST /api/auth/sign-up
// Body: { email, password, name? }
// Returns: 201 { id, email, name } | 400 invalid_input | 409 email_taken
const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  name: z.string().min(1).max(80).optional(),
});

export async function POST(req: Request): Promise<NextResponse> {
  const raw = await req.json().catch(() => null);
  const parsed = signUpSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: 'invalid_input' }, { status: 400 });
  }

  const { email, password, name } = parsed.data;

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'email_taken' }, { status: 409 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const [created] = await db
    .insert(users)
    .values({
      email,
      name: name ?? null,
      passwordHash,
    })
    .returning({ id: users.id, email: users.email, name: users.name });

  return NextResponse.json(created, { status: 201 });
}
