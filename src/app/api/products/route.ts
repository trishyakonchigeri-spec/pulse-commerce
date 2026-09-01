import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cache } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category');
    const search = searchParams.get('search');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const sort = searchParams.get('sort') || 'featured';
    const isFlashSale = searchParams.get('isFlashSale') === 'true';
    const isFeatured = searchParams.get('isFeatured') === 'true';
    const inStockOnly = searchParams.get('inStockOnly') === 'true';

    // Unique cache key based on query filters
    const cacheKey = `products:${categorySlug || 'all'}:${search || ''}:${minPrice || ''}:${maxPrice || ''}:${sort}:${isFlashSale}:${isFeatured}:${inStockOnly}`;
    
    // Check Redis cache
    const cachedData = await cache.get<any>(cacheKey);
    if (cachedData) {
      return NextResponse.json({ ...cachedData, fromCache: true });
    }

    // Build Prisma query
    const where: any = {};

    if (categorySlug) {
      where.category = { slug: categorySlug };
    }

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { headline: { contains: search } },
      ];
    }

    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }

    if (isFlashSale) {
      where.isFlashSale = true;
    }

    if (isFeatured) {
      where.isFeatured = true;
    }

    if (inStockOnly) {
      where.stock = { gt: 0 };
    }

    // Sorting strategy
    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price-asc') orderBy = { price: 'asc' };
    if (sort === 'price-desc') orderBy = { price: 'desc' };
    if (sort === 'rating') orderBy = { rating: 'desc' };
    if (sort === 'reviews') orderBy = { reviewCount: 'desc' };

    const [products, categories, totalCount] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
        },
      }),
      prisma.category.findMany({
        select: { id: true, name: true, slug: true, _count: { select: { products: true } } },
      }),
      prisma.product.count({ where }),
    ]);

    // Parse JSON images & specs for clean client consumption
    const parsedProducts = products.map((p) => ({
      ...p,
      images: JSON.parse(p.images || '[]'),
      specs: p.specs ? JSON.parse(p.specs) : {},
    }));

    const responsePayload = {
      products: parsedProducts,
      categories,
      totalCount,
      timestamp: new Date().toISOString(),
    };

    // Cache in Redis for 60 seconds
    await cache.set(cacheKey, responsePayload, 60);

    return NextResponse.json({ ...responsePayload, fromCache: false });
  } catch (error: any) {
    console.warn('[Products API Database Notice]: serving resilient mock data fallback');
    const { MOCK_PRODUCTS, MOCK_CATEGORIES } = await import('@/lib/mockData');
    return NextResponse.json({
      products: MOCK_PRODUCTS,
      categories: MOCK_CATEGORIES,
      totalCount: MOCK_PRODUCTS.length,
      fromCache: false,
      timestamp: new Date().toISOString(),
    });
  }
}
