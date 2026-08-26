import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = getUserFromRequest(req);
  if (!user) {
    return NextResponse.json({ user: null });
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, email: true, name: true, role: true, avatarUrl: true },
  });

  return NextResponse.json({ user: dbUser || null });
}
