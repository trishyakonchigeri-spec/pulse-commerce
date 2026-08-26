import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { createCheckoutSession } from '@/lib/stripe';
import { generateOrderNumber } from '@/lib/utils';
import { z } from 'zod';

const CheckoutSchema = z.object({
  sessionId: z.string().min(1),
  items: z.array(
    z.object({
      productId: z.string(),
      title: z.string(),
      price: z.number(),
      quantity: z.number().int().positive(),
      image: z.string().optional().nullable(),
    })
  ).min(1),
  shippingAddress: z.object({
    name: z.string().min(2),
    email: z.string().email(),
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zip: z.string().min(3),
    country: z.string().default('USA'),
  }),
});

export async function POST(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    const body = await req.json();
    const parsed = CheckoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid checkout parameters', details: parsed.error }, { status: 400 });
    }

    const { sessionId, items, shippingAddress } = parsed.data;

    // Verify inventory lock exists for this session
    const activeLockCount = await prisma.inventoryLock.count({
      where: {
        sessionId,
        status: 'HELD',
        expiresAt: { gt: new Date() },
      },
    });

    if (activeLockCount === 0) {
      return NextResponse.json(
        { error: 'Your inventory reservation has expired. Please refresh and try again.' },
        { status: 410 }
      );
    }

    // Calculate totals (18% GST standard & Free shipping over ₹2,999)
    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const tax = Number((subtotal * 0.18).toFixed(2));
    const shipping = subtotal > 2999 ? 0.0 : 199.0;
    const total = Number((subtotal + tax + shipping).toFixed(2));

    const orderNumber = generateOrderNumber();
    const idempotencyKey = `idemp_${sessionId}_${Date.now()}`;

    // Create initial Pending Order
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user ? user.id : null,
        guestEmail: user ? null : shippingAddress.email,
        status: 'PENDING',
        subtotal,
        tax,
        shipping,
        total,
        idempotencyKey,
        shippingAddress: JSON.stringify(shippingAddress),
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
          })),
        },
      },
    });

    // Link inventory locks to this order
    await prisma.inventoryLock.updateMany({
      where: { sessionId, status: 'HELD' },
      data: { orderId: order.id },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const successUrl = `${appUrl}/checkout/success?order_number=${order.orderNumber}&session_id=${sessionId}`;
    const cancelUrl = `${appUrl}/checkout?session_id=${sessionId}&canceled=true`;

    const checkoutData = await createCheckoutSession({
      orderId: order.id,
      orderNumber: order.orderNumber,
      items,
      customerEmail: shippingAddress.email,
      successUrl,
      cancelUrl,
      idempotencyKey,
    });

    await prisma.order.update({
      where: { id: order.id },
      data: { stripeSessionId: checkoutData.sessionId },
    });

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
      checkoutUrl: checkoutData.url,
      isMock: checkoutData.isMock,
    });
  } catch (error: any) {
    console.error('[Create Checkout Session Error]', error);
    return NextResponse.json({ error: 'Failed to initiate checkout' }, { status: 500 });
  }
}
