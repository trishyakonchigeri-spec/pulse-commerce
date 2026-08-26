'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Search, Filter, SlidersHorizontal, Zap, Check, ArrowUpDown } from 'lucide-react';
import { ProductItem } from '@/types';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'featured');
  const [inStockOnly, setInStockOnly] = useState(searchParams.get('inStockOnly') === 'true');

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedCategory) params.set('category', selectedCategory);
      if (search) params.set('search', search);
      if (sort) params.set('sort', sort);
      if (inStockOnly) params.set('inStockOnly', 'true');

      try {
        const res = await fetch(`/api/products?${params.toString()}`);
        const data = await res.json();
        setProducts(data.products || []);
        setCategories(data.categories || []);
        setFromCache(Boolean(data.fromCache));
      } catch (err) {
        console.error('Error loading products', err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchProducts();
    }, 200);

    return () => clearTimeout(debounceTimer);
  }, [selectedCategory, search, sort, inStockOnly]);

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
              Enthusiast Hardware Catalog
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
              Discover high-performance components, CNC peripherals, and studio audio monitors.
            </p>
          </div>

          {/* Redis Cache Indicator Badge */}
          {fromCache && (
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              color: '#22d3ee',
              padding: '0.35rem 0.75rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}>
              ⚡ Served from Redis Cache (&lt; 15ms)
            </div>
          )}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '2.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
      }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          {/* Search Input */}
          <div style={{
            flex: '1 1 280px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem' }} />
            <input
              type="text"
              placeholder="Search components, specs, models..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%',
                padding: '0.65rem 1rem 0.65rem 2.75rem',
                backgroundColor: 'var(--bg-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#ffffff',
                fontSize: '0.9375rem',
                outline: 'none',
              }}
            />
          </div>

          {/* Sort Selector */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '0 0.85rem',
          }}>
            <ArrowUpDown size={16} color="var(--text-muted)" />
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ffffff',
                fontSize: '0.875rem',
                padding: '0.65rem 0',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="featured" style={{ background: '#090d16' }}>Featured</option>
              <option value="price-asc" style={{ background: '#090d16' }}>Price: Low to High</option>
              <option value="price-desc" style={{ background: '#090d16' }}>Price: High to Low</option>
              <option value="rating" style={{ background: '#090d16' }}>Top Customer Rating</option>
            </select>
          </div>

          {/* In-Stock Toggle */}
          <button
            onClick={() => setInStockOnly(!inStockOnly)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: inStockOnly ? 'rgba(16, 185, 129, 0.15)' : 'var(--bg-main)',
              border: inStockOnly ? '1px solid #10b981' : '1px solid var(--border-subtle)',
              color: inStockOnly ? '#34d399' : 'var(--text-secondary)',
              padding: '0.65rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <Check size={16} color={inStockOnly ? '#34d399' : 'transparent'} />
            In Stock Only
          </button>
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: 'var(--radius-full)',
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedCategory === '' ? '1px solid #0ea5e9' : '1px solid var(--border-subtle)',
              backgroundColor: selectedCategory === '' ? '#0ea5e9' : 'var(--bg-surface-elevated)',
              color: '#ffffff',
              transition: 'all 0.15s ease',
            }}
          >
            All Hardware
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              style={{
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedCategory === cat.slug ? '1px solid #0ea5e9' : '1px solid var(--border-subtle)',
                backgroundColor: selectedCategory === cat.slug ? '#0ea5e9' : 'var(--bg-surface-elevated)',
                color: '#ffffff',
                transition: 'all 0.15s ease',
              }}
            >
              {cat.name} ({cat._count?.products || 0})
            </button>
          ))}
        </div>
      </div>

      {/* Product Grid */}
      {loading ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 0',
          color: 'var(--text-secondary)',
        }}>
          <div style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Querying Hardware Catalog...
          </div>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
            Retrieving indexed models from PostgreSQL / Redis
          </div>
        </div>
      ) : products.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '5rem 0',
          backgroundColor: 'var(--bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--border-subtle)',
        }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem' }}>
            No Matching Hardware Found
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '1.5rem' }}>
            Try resetting your search query or removing active category filters.
          </p>
          <button
            onClick={() => {
              setSearch('');
              setSelectedCategory('');
              setInStockOnly(false);
            }}
            className="btn-primary"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1.75rem',
        }}>
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
