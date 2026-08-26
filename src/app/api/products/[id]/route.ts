import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const identifier = params.id;
    const cacheKey = `product:${identifier}`;

    const cachedProduct = await cache.get<any>(cacheKey);
    if (cachedProduct) {
      return NextResponse.json({ product: cachedProduct, fromCache: true });
    }

    const product = await prisma.product.findFirst({
      where: {
        OR: [{ id: identifier }, { slug: identifier }],
      },
      include: {
        category: true,
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate active held locks
    const activeLocks = await prisma.inventoryLock.aggregate({
      where: {
        productId: product.id,
        status: 'HELD',
        expiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    });

    const heldQuantity = activeLocks._sum.quantity || 0;
    const availableStock = Math.max(0, product.stock - heldQuantity);

    const parsedProduct = {
      ...product,
      availableStock,
      heldQuantity,
      images: JSON.parse(product.images || '[]'),
      specs: product.specs ? JSON.parse(product.specs) : {},
    };

    await cache.set(cacheKey, parsedProduct, 30);

    return NextResponse.json({ product: parsedProduct, fromCache: false });
  } catch (error: any) {
    console.error('[Product Detail API Error]', error);
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}
