import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { stripe } from '@/lib/stripe';
import { consumeStock } from '@/lib/concurrency';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing webhook signature or secret' }, { status: 400 });
  }

  let event: any;

  try {
    if (stripe) {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } else {
      event = JSON.parse(body);
    }
  } catch (err: any) {
    console.error(`[Webhook Signature Failed]: ${err.message}`);
    return NextResponse.json({ error: `Webhook signature error: ${err.message}` }, { status: 400 });
  }

  // Idempotency check: Have we already processed this event?
  const existingEvent = await prisma.webhookEvent.findUnique({
    where: { eventId: event.id },
  });

  if (existingEvent) {
    console.log(`[Stripe Webhook] Event ${event.id} already processed (Idempotent bypass)`);
    return NextResponse.json({ received: true, status: 'already_processed' });
  }

  // Log new webhook event
  await prisma.webhookEvent.create({
    data: {
      eventId: event.id,
      eventType: event.type,
      payload: JSON.stringify(event),
      status: 'PROCESSED',
    },
  });

  // Process checkout session completed
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const orderId = session.metadata?.orderId;

    if (orderId) {
      const order = await prisma.order.findUnique({ where: { id: orderId } });
      if (order && !order.isPaid) {
        // Find associated inventory locks
        const locks = await prisma.inventoryLock.findMany({
          where: { orderId: order.id, status: 'HELD' },
        });

        if (locks.length > 0 && locks[0].sessionId) {
          await consumeStock(locks[0].sessionId, order.id);
        }

        await prisma.order.update({
          where: { id: order.id },
          data: {
            isPaid: true,
            status: 'PAID',
            paidAt: new Date(),
          },
        });

        console.log(`[Stripe Webhook] Order ${order.orderNumber} marked as PAID`);
      }
    }
  }

  return NextResponse.json({ received: true });
}
