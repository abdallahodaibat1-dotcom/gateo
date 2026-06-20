import { auth } from '@/auth';
import { unauthorized, forbidden } from '@/lib/api-utils';
import { NextResponse } from 'next/server';

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();
  if (session.user.role !== 'ADMIN') return forbidden();
  return session;
}
