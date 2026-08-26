import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { concurrentRequests = 20, initialStock = 5 } = await req.json();

    // 1. Fetch or create a dedicated sandbox simulation product
    let product = await prisma.product.findFirst({
      where: { slug: 'concurrency-stress-test-item' },
    });

    const category = await prisma.category.findFirst();

    if (!product && category) {
      product = await prisma.product.create({
        data: {
          name: 'Quantum Core Accelerator (Concurrency Sandbox)',
          slug: 'concurrency-stress-test-item',
          description: 'Live interactive sandbox item for testing database lock isolation.',
          price: 999.00,
          stock: initialStock,
          categoryId: category.id,
          images: JSON.stringify(['https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=800']),
        },
      });
    } else if (product) {
      // Reset stock and clear old locks
      await prisma.inventoryLock.deleteMany({ where: { productId: product.id } });
      await prisma.product.update({
        where: { id: product.id },
        data: { stock: initialStock },
      });
    }

    if (!product) {
      return NextResponse.json({ error: 'Failed to initialize test product' }, { status: 500 });
    }

    const productId = product.id;
    const testStartTime = Date.now();

    // 2. Simulate concurrent user checkouts
    const runWorker = async (workerId: number) => {
      const sessionId = `sim_user_${workerId}_${Date.now()}`;
      const reqStart = Date.now();

      try {
        const result = await prisma.$transaction(async (tx) => {
          // Count active locks
          const activeLocks = await tx.inventoryLock.aggregate({
            where: {
              productId,
              status: 'HELD',
              expiresAt: { gt: new Date() },
            },
            _sum: { quantity: true },
          });

          const heldQty = activeLocks._sum.quantity || 0;
          const available = initialStock - heldQty;

          if (available < 1) {
            throw new Error('INSUFFICIENT_STOCK');
          }

          const lock = await tx.inventoryLock.create({
            data: {
              productId,
              quantity: 1,
              sessionId,
              expiresAt: new Date(Date.now() + 5 * 60 * 1000),
              status: 'HELD',
            },
          });

          return { lockId: lock.id };
        });

        return {
          workerId,
          status: 'SUCCESS',
          message: `Unit reserved successfully (Lock: ${result.lockId.slice(-6)})`,
          latencyMs: Date.now() - reqStart,
          timestamp: new Date().toISOString(),
        };
      } catch (err: any) {
        return {
          workerId,
          status: 'REJECTED',
          message: 'Rejected: Out of stock (Zero-oversell enforced)',
          latencyMs: Date.now() - reqStart,
          timestamp: new Date().toISOString(),
        };
      }
    };

    const workers = Array.from({ length: concurrentRequests }, (_, i) => runWorker(i + 1));
    const results = await Promise.all(workers);

    const totalSuccess = results.filter((r) => r.status === 'SUCCESS').length;
    const totalRejected = results.filter((r) => r.status === 'REJECTED').length;
    const totalDurationMs = Date.now() - testStartTime;

    return NextResponse.json({
      summary: {
        totalRequests: concurrentRequests,
        initialStock,
        successfulReservations: totalSuccess,
        rejectedRequests: totalRejected,
        oversellCount: Math.max(0, totalSuccess - initialStock),
        isSafe: totalSuccess <= initialStock,
        totalDurationMs,
      },
      auditLog: results,
    });
  } catch (error: any) {
    console.error('[Simulate API Error]', error);
    return NextResponse.json({ error: 'Simulation failed' }, { status: 500 });
  }
}
