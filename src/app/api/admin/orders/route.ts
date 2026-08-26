import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json({ orders });
  } catch (error: any) {
    console.error('[Admin Get Orders Error]', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error: any) {
    console.error('[Admin Update Order Status Error]', error);
    return NextResponse.json({ error: 'Failed to update order status' }, { status: 500 });
  }
}
