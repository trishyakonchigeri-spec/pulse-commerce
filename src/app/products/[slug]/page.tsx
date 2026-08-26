'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, Star, Zap, ShieldCheck, Truck, RefreshCw, Cpu, CheckCircle2, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useCart } from '@/components/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { addItem } = useCart();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await fetch(`/api/products/${slug}`);
        const data = await res.json();
        if (data.product) {
          setProduct(data.product);
          if (data.product.images?.length > 0) {
            setSelectedImage(data.product.images[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load product', err);
      } finally {
        setLoading(false);
      }
    }
    if (slug) loadProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center', color: 'var(--text-secondary)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Loading Hardware Specifications...</h2>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>Product Not Found</h2>
        <Link href="/products" className="btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const discountPercent = calculateDiscount(product.price, product.originalPrice);
  const availableStock = product.availableStock !== undefined ? product.availableStock : product.stock;

  const handleAddToCart = () => {
    if (availableStock > 0) {
      addItem({
        id: product.id,
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        image: selectedImage || (product.images && product.images[0]),
        maxStock: availableStock,
      }, quantity);

      setAddedNotice(true);
      setTimeout(() => setAddedNotice(false), 3000);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
      {/* Back breadcrumb */}
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/products" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          <ArrowLeft size={16} /> Back to Catalog
        </Link>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '3rem',
        marginBottom: '4rem',
      }}>
        {/* Left: Image Gallery */}
        <div>
          <div style={{
            position: 'relative',
            width: '100%',
            paddingTop: '75%',
            backgroundColor: '#0a0e1a',
            borderRadius: 'var(--radius-lg)',
            overflow: 'hidden',
            border: '1px solid var(--border-subtle)',
            marginBottom: '1rem',
          }}>
            <img
              src={selectedImage || (product.images && product.images[0])}
              alt={product.name}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>

          {/* Thumbnail strip */}
          {product.images?.length > 1 && (
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {product.images.map((img: string, idx: number) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(img)}
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: 'var(--radius-md)',
                    overflow: 'hidden',
                    border: selectedImage === img ? '2px solid #0ea5e9' : '1px solid var(--border-subtle)',
                    backgroundColor: '#0a0e1a',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Product Details & Purchase Box */}
        <div>
          {/* Badges */}
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {product.isFlashSale && (
              <span className="badge-flash" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={12} /> FLASH SALE
              </span>
            )}
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.2rem 0' }}>
              {product.category?.name}
            </span>
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', lineHeight: '1.2', marginBottom: '0.5rem' }}>
            {product.name}
          </h1>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', color: '#fbbf24' }}>
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={16} fill={i < Math.floor(product.rating) ? '#fbbf24' : 'none'} stroke="#fbbf24" strokeWidth={1} />
              ))}
            </div>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.875rem' }}>{product.rating}</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '0.8125rem' }}>({product.reviewCount} customer reviews)</span>
          </div>

          {/* Pricing */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '1rem', marginBottom: '1.5rem' }}>
            <span style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && product.originalPrice > product.price && (
              <>
                <span style={{ fontSize: '1.125rem', color: 'var(--text-muted)', textDecoration: 'line-through' }} className="mono-stat">
                  {formatPrice(product.originalPrice)}
                </span>
                <span style={{ background: '#e11d48', color: '#fff', fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                  Save {discountPercent}%
                </span>
              </>
            )}
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '1.75rem' }}>
            {product.description}
          </p>

          {/* Live Real-time Stock Lock Meter */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', fontWeight: 600 }}>
                Live Inventory Status:
              </span>
              {availableStock > 0 ? (
                <span style={{ color: '#34d399', fontSize: '0.8125rem', fontWeight: 700 }}>
                  {availableStock} Units Available
                </span>
              ) : (
                <span style={{ color: '#fb7185', fontSize: '0.8125rem', fontWeight: 700 }}>
                  Sold Out
                </span>
              )}
            </div>

            {product.heldQuantity > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Zap size={13} />
                <span>{product.heldQuantity} units currently held in concurrent active checkouts</span>
              </div>
            )}
          </div>

          {/* Add to Cart Actions */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            {/* Quantity control */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'var(--bg-surface-elevated)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0 0.5rem',
            }}>
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                -
              </button>
              <span style={{ padding: '0 0.8rem', fontWeight: 700, fontSize: '0.9375rem' }} className="mono-stat">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(availableStock, quantity + 1))}
                disabled={quantity >= availableStock}
                style={{ background: 'transparent', border: 'none', color: '#fff', padding: '0.5rem', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                +
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={availableStock <= 0}
              className="btn-primary"
              style={{
                flex: 1,
                padding: '0.85rem 1.5rem',
                fontSize: '1rem',
                opacity: availableStock <= 0 ? 0.5 : 1,
                cursor: availableStock <= 0 ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingBag size={18} /> Add to Cart
            </button>
          </div>

          {addedNotice && (
            <div style={{
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid #10b981',
              borderRadius: 'var(--radius-md)',
              color: '#34d399',
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              marginBottom: '1.5rem',
            }}>
              <CheckCircle2 size={16} /> Added to cart! Open drawer to review & lock inventory.
            </div>
          )}

          {/* Value Props */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <Truck size={16} color="#0ea5e9" />
              <span>Fast Express Dispatch</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              <ShieldCheck size={16} color="#10b981" />
              <span>2-Year Manufacturer Warranty</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Specifications Sheet */}
      {product.specs && Object.keys(product.specs).length > 0 && (
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          marginBottom: '3rem',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Cpu size={20} color="#0ea5e9" /> Technical Architecture & Specs
          </h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}>
            {Object.entries(product.specs).map(([key, val]) => (
              <div
                key={key}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--bg-main)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.875rem',
                }}
              >
                <span style={{ color: 'var(--text-muted)' }}>{key}</span>
                <span style={{ color: '#ffffff', fontWeight: 600 }}>{String(val)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
