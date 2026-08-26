'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingBag, Star, Zap, ShieldCheck } from 'lucide-react';
import { ProductItem } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from './CartContext';

interface ProductCardProps {
  product: ProductItem;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem } = useCart();
  const discountPercent = calculateDiscount(product.price, product.originalPrice);
  const mainImage = product.images && product.images.length > 0 ? product.images[0] : 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product.stock > 0) {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: mainImage,
        maxStock: product.stock,
      });
    }
  };

  return (
    <div className="tech-card" style={{
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
    }}>
      {/* Badges Overlay */}
      <div style={{
        position: 'absolute',
        top: '0.85rem',
        left: '0.85rem',
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}>
        {product.isFlashSale && (
          <span className="badge-flash" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            <Zap size={12} /> FLASH DROP
          </span>
        )}
        {product.badge && !product.isFlashSale && (
          <span style={{
            background: 'rgba(14, 165, 233, 0.15)',
            color: '#38bdf8',
            border: '1px solid rgba(14, 165, 233, 0.3)',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.2rem 0.5rem',
            borderRadius: 'var(--radius-sm)',
            textTransform: 'uppercase',
          }}>
            {product.badge}
          </span>
        )}
      </div>

      {discountPercent > 0 && (
        <div style={{
          position: 'absolute',
          top: '0.85rem',
          right: '0.85rem',
          zIndex: 10,
          background: '#e11d48',
          color: '#fff',
          fontWeight: 700,
          fontSize: '0.75rem',
          padding: '0.2rem 0.5rem',
          borderRadius: 'var(--radius-sm)',
        }}>
          -{discountPercent}%
        </div>
      )}

      {/* Image Container */}
      <Link href={`/products/${product.slug}`} style={{
        position: 'relative',
        width: '100%',
        paddingTop: '65%',
        backgroundColor: '#0a0e1a',
        display: 'block',
        overflow: 'hidden',
      }}>
        <img
          src={mainImage}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
          onMouseOut={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        />
      </Link>

      {/* Content */}
      <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        {/* Category & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>
            {product.category?.name || 'Hardware'}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem', color: '#fbbf24' }}>
            <Star size={14} fill="#fbbf24" strokeWidth={0} />
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({product.reviewCount})</span>
          </div>
        </div>

        {/* Title */}
        <Link href={`/products/${product.slug}`}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
            marginBottom: '0.4rem',
            lineHeight: '1.3',
            transition: 'color 0.15s ease',
          }}>
            {product.name}
          </h3>
        </Link>

        {product.headline && (
          <p style={{
            fontSize: '0.8125rem',
            color: 'var(--text-secondary)',
            lineHeight: '1.4',
            marginBottom: '0.85rem',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {product.headline}
          </p>
        )}

        {/* Stock status indicator */}
        <div style={{ marginBottom: '1rem', marginTop: 'auto' }}>
          {product.stock <= 0 ? (
            <span className="badge-stock-low">Out of Stock</span>
          ) : product.stock < 10 ? (
            <span className="badge-stock-low" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fb7185' }} className="animate-pulse-dot" />
              Only {product.stock} left in stock!
            </span>
          ) : (
            <span className="badge-stock-in">In Stock ({product.stock} units)</span>
          )}
        </div>

        {/* Price & Action */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '0.85rem',
        }}>
          <div>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
              {formatPrice(product.price)}
            </div>
            {product.originalPrice && product.originalPrice > product.price && (
              <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }} className="mono-stat">
                {formatPrice(product.originalPrice)}
              </div>
            )}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.stock <= 0}
            className="btn-primary"
            style={{
              padding: '0.5rem 0.85rem',
              fontSize: '0.8125rem',
              opacity: product.stock <= 0 ? 0.5 : 1,
              cursor: product.stock <= 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ShoppingBag size={15} /> Add
          </button>
        </div>
      </div>
    </div>
  );
}
