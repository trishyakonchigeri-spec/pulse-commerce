import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { cache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

// PUT: Update product stock or details
export async function PUT(req: NextRequest) {
  try {
    const user = getUserFromRequest(req);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id, stock, price, isFlashSale, badge } = await req.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        stock: stock !== undefined ? Number(stock) : undefined,
        price: price !== undefined ? Number(price) : undefined,
        isFlashSale: isFlashSale !== undefined ? Boolean(isFlashSale) : undefined,
        badge: badge !== undefined ? badge : undefined,
      },
    });

    // Invalidate caches
    await cache.del(`product:${id}`);
    await cache.del(`product:${updated.slug}`);
    await cache.del('products:featured');
    await cache.del('products:flash');

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    console.error('[Admin Product Update Error]', error);
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}
