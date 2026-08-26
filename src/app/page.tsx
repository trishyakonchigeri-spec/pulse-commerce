import React from 'react';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import FlashSaleCountdown from '@/components/FlashSaleCountdown';
import { Zap, ShieldCheck, Database, Cpu, ArrowRight, Activity, Terminal, Layers } from 'lucide-react';
import { ProductItem } from '@/types';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch flash sales and featured products directly on server
  const [flashProducts, featuredProducts, totalProductsCount] = await Promise.all([
    prisma.product.findMany({
      where: { isFlashSale: true },
      include: { category: true },
      take: 3,
    }),
    prisma.product.findMany({
      where: { isFeatured: true },
      include: { category: true },
      take: 6,
    }),
    prisma.product.count(),
  ]);

  const parsedFlash: ProductItem[] = flashProducts.map((p) => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    specs: p.specs ? JSON.parse(p.specs) : {},
  }));

  const parsedFeatured: ProductItem[] = featuredProducts.map((p) => ({
    ...p,
    images: JSON.parse(p.images || '[]'),
    specs: p.specs ? JSON.parse(p.specs) : {},
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        position: 'relative',
        paddingTop: '4rem',
        paddingBottom: '4rem',
        background: 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(14, 165, 233, 0.15), rgba(9, 13, 22, 0))',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '900px' }}>
          {/* Architecture Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-surface-elevated)',
            border: '1px solid var(--border-strong)',
            marginBottom: '1.5rem',
            fontSize: '0.8125rem',
            color: '#38bdf8',
          }}>
            <Cpu size={15} />
            <span>High-Throughput Concurrency & Payment Idempotency Engine</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.25rem, 5vw, 3.75rem)',
            fontWeight: 800,
            lineHeight: '1.15',
            letterSpacing: '-0.03em',
            marginBottom: '1.25rem',
            color: '#ffffff',
          }}>
            Next-Gen Hardware Drops <br />
            <span style={{
              background: 'linear-gradient(135deg, #38bdf8 0%, #818cf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Engineered for Zero Overselling.
            </span>
          </h1>

          <p style={{
            fontSize: '1.125rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.6',
            marginBottom: '2rem',
            maxWidth: '720px',
            marginLeft: 'auto',
            marginRight: 'auto',
          }}>
            A production-ready e-commerce platform built to solve real-world high-traffic concurrency bottlenecks using PostgreSQL row-level locks, Redis caching, and Stripe webhook idempotency.
          </p>

          {/* Action CTAs */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '3rem' }}>
            <Link href="/products" className="btn-primary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
              Explore Hardware Catalog <ArrowRight size={18} />
            </Link>
            <Link href="/flash-sales" className="btn-secondary" style={{ padding: '0.8rem 1.75rem', fontSize: '1rem' }}>
              <Zap size={18} color="#f59e0b" /> View Live Flash Drops
            </Link>
          </div>

          {/* Key Engineering Metrics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '1rem',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="#10b981" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>CONCURRENCY SAFETY</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>100% ACID Protection</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Activity size={24} color="#0ea5e9" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>READ PERFORMANCE</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }} className="mono-stat">&lt; 15ms Redis Latency</div>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Layers size={24} color="#f59e0b" />
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT LIFECYCLE</div>
                <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }}>Idempotent Webhooks</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Flash-Sale Drops Section */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.75rem',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <Zap size={22} color="#f59e0b" />
              <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff' }}>
                Live Flash Drops
              </h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Ultra-limited stock with real-time atomic inventory reservation.
            </p>
          </div>

          <FlashSaleCountdown initialHours={36} />
        </div>

        {/* Products Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem',
        }}>
          {parsedFlash.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Featured Hardware Section */}
      <section className="container">
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.75rem',
        }}>
          <div>
            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              Enthusiast Catalog
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Precision mechanical keyboards, audiophile sound, and liquid-cooled GPUs.
            </p>
          </div>

          <Link href="/products" style={{ color: '#0ea5e9', fontSize: '0.9375rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            View All ({totalProductsCount}) <ArrowRight size={16} />
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.75rem',
        }}>
          {parsedFeatured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* System Design / Interview Highlight Banner */}
      <section className="container">
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-strong)',
          borderRadius: 'var(--radius-lg)',
          padding: '2.5rem',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{ maxWidth: '650px', position: 'relative', zIndex: 10 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#818cf8', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.75rem', letterSpacing: '0.05em' }}>
              <Terminal size={16} /> RECRUITER & INTERVIEW NOTE
            </div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.75rem' }}>
              Test Real Concurrency in the Live Sandbox
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              Curious how the system handles 50 concurrent buyers trying to grab 5 items at the same millisecond? Click the Concurrency Sandbox in the navigation bar to trigger live automated load tests against the database.
            </p>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <Link href="/admin" className="btn-secondary" style={{ fontSize: '0.875rem' }}>
                Open Admin Analytics Portal
              </Link>
              <Link href="/auth/login" className="btn-primary" style={{ fontSize: '0.875rem' }}>
                Test 1-Click Demo Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
