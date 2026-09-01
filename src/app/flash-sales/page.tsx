import React from 'react';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { Zap, Flame, ShieldAlert } from 'lucide-react';
import { ProductItem } from '@/types';
import { MOCK_PRODUCTS } from '@/lib/mockData';

export const dynamic = 'force-dynamic';

export default async function FlashSalesPage() {
  let flashProducts: ProductItem[] = [];

  try {
    const raw = await prisma.product.findMany({
      where: { isFlashSale: true },
      include: { category: true },
      orderBy: { stock: 'asc' },
    });
    if (raw && raw.length > 0) {
      flashProducts = raw.map((p) => ({
        ...p,
        images: typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []),
        specs: typeof p.specs === 'string' ? JSON.parse(p.specs || '{}') : (p.specs || {}),
      }));
    }
  } catch (err) {
    console.warn('[FlashSales Warning]: using mock catalog fallback');
  }

  if (flashProducts.length === 0) {
    flashProducts = MOCK_PRODUCTS.filter((p) => p.isFlashSale);
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
      {/* Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(225, 29, 72, 0.15) 100%)',
        border: '1px solid rgba(245, 158, 11, 0.3)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        marginBottom: '3rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
      }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#fbbf24', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.5rem', textTransform: 'uppercase' }}>
            <Flame size={16} /> HIGH-DEMAND HARDWARE DROPS
          </div>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
            ⚡ Exclusive Flash Sales
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', maxWidth: '550px' }}>
            Limited quantity releases protected by our atomic concurrency engine. When you proceed to checkout, your unit is locked for 10 minutes.
          </p>
        </div>

        <FlashSaleCountdown initialHours={28} />
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '2rem',
      }}>
        {flashProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
