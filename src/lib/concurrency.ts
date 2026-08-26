import { prisma } from './prisma';
import { cache } from './redis';

export interface StockReservationItem {
  productId: string;
  quantity: number;
}

export interface ReservationResult {
  success: boolean;
  lockIds?: string[];
  error?: string;
  failedProductId?: string;
}

/**
 * High-Concurrency Stock Reservation Engine
 * 
 * Uses interactive database transactions and inventory lock records to prevent
 * overselling (race conditions) during high-throughput flash-sale checkout spikes.
 */
export async function reserveStock(
  items: StockReservationItem[],
  sessionId: string,
  holdMinutes: number = 10
): Promise<ReservationResult> {
  const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);

  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Clean up any expired locks for these products first
      await tx.inventoryLock.updateMany({
        where: {
          expiresAt: { lt: new Date() },
          status: 'HELD',
        },
        data: {
          status: 'RELEASED',
        },
      });

      const lockIds: string[] = [];

      for (const item of items) {
        // Fetch current product stock
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          select: { id: true, name: true, stock: true },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        // Calculate currently held stock
        const activeLocks = await tx.inventoryLock.aggregate({
          where: {
            productId: item.productId,
            status: 'HELD',
            expiresAt: { gt: new Date() },
          },
          _sum: {
            quantity: true,
          },
        });

        const heldQty = activeLocks._sum.quantity || 0;
        const availableStock = product.stock - heldQty;

        if (availableStock < item.quantity) {
          throw new Error(
            `INSUFFICIENT_STOCK: Only ${Math.max(0, availableStock)} available for "${product.name}"`
          );
        }

        // Create atomic inventory hold record
        const lock = await tx.inventoryLock.create({
          data: {
            productId: item.productId,
            quantity: item.quantity,
            sessionId: sessionId,
            expiresAt: expiresAt,
            status: 'HELD',
          },
        });

        lockIds.push(lock.id);
      }

      return { success: true, lockIds };
    });

    // Invalidate product cache in Redis so storefront updates immediately
    for (const item of items) {
      await cache.del(`product:${item.productId}`);
    }
    await cache.del('products:featured');
    await cache.del('products:flash');

    return result;
  } catch (error: any) {
    const isStockError = error.message?.startsWith('INSUFFICIENT_STOCK:');
    return {
      success: false,
      error: error.message || 'Failed to acquire inventory lock',
    };
  }
}

/**
 * Release inventory locks if customer abandons cart or checkout fails
 */
export async function releaseStock(sessionId: string): Promise<void> {
  try {
    const locks = await prisma.inventoryLock.findMany({
      where: { sessionId, status: 'HELD' },
    });

    await prisma.inventoryLock.updateMany({
      where: { sessionId, status: 'HELD' },
      data: { status: 'RELEASED' },
    });

    for (const lock of locks) {
      await cache.del(`product:${lock.productId}`);
    }
  } catch (err) {
    console.error('[ReleaseStock Error]', err);
  }
}

/**
 * Permanently consume held inventory when payment is verified
 */
export async function consumeStock(
  sessionId: string,
  orderId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.$transaction(async (tx) => {
      const locks = await tx.inventoryLock.findMany({
        where: { sessionId, status: 'HELD' },
      });

      if (locks.length === 0) {
        // Fallback: check if already consumed
        const consumed = await tx.inventoryLock.findFirst({
          where: { sessionId, status: 'CONSUMED' },
        });
        if (consumed) return; // Idempotent success
      }

      for (const lock of locks) {
        // Decrement actual physical product stock
        await tx.product.update({
          where: { id: lock.productId },
          data: {
            stock: {
              decrement: lock.quantity,
            },
          },
        });

        // Mark lock as consumed
        await tx.inventoryLock.update({
          where: { id: lock.id },
          data: {
            status: 'CONSUMED',
            orderId: orderId,
          },
        });
      }
    });

    return { success: true };
  } catch (err: any) {
    console.error('[ConsumeStock Error]', err);
    return { success: false, error: err.message };
  }
}
