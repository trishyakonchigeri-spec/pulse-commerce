import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { consumeStock } from '@/lib/concurrency';

export async function POST(req: NextRequest) {
  try {
    const { orderNumber, sessionId } = await req.json();

    if (!orderNumber || !sessionId) {
      return NextResponse.json({ error: 'Missing verification identifiers' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { orderNumber },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    if (order.isPaid) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        order,
      });
    }

    // Atomically consume held stock & mark order paid
    const consumeResult = await consumeStock(sessionId, order.id);
    if (!consumeResult.success) {
      console.warn('[ConsumeStock Notice]', consumeResult.error);
    }

    const updatedOrder = await prisma.order.update({
      where: { id: order.id },
      data: {
        isPaid: true,
        status: 'PAID',
        paidAt: new Date(),
      },
      include: { items: true },
    });

    return NextResponse.json({
      success: true,
      order: updatedOrder,
    });
  } catch (error: any) {
    console.error('[Verify Checkout Error]', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
