'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Edit2, Save, Check, RefreshCw } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      setProducts(data.products || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleStockChange = (id: string, newStock: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: newStock } : p))
    );
  };

  const handlePriceChange = (id: string, newPrice: number) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, price: newPrice } : p))
    );
  };

  const handleFlashToggle = (id: string, isFlashSale: boolean) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFlashSale } : p))
    );
  };

  const saveProduct = async (product: any) => {
    setSavingId(product.id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: product.id,
          stock: product.stock,
          price: product.price,
          isFlashSale: product.isFlashSale,
        }),
      });

      if (res.ok) {
        setSavedSuccess(product.id);
        setTimeout(() => setSavedSuccess(null), 2500);
      }
    } catch (err) {
      alert('Failed to update product');
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Hardware SKU & Inventory Management
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Adjust physical warehouse stock counts, modify pricing, and assign flash drop status.
          </p>
        </div>

        <button onClick={fetchProducts} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={14} /> Refresh SKUs
        </button>
      </div>

      <div className="tech-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--bg-main)', borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
              <th style={{ padding: '1rem 1.25rem' }}>HARDWARE PRODUCT</th>
              <th style={{ padding: '1rem 1.25rem' }}>CATEGORY</th>
              <th style={{ padding: '1rem 1.25rem' }}>PRICE (₹ INR)</th>
              <th style={{ padding: '1rem 1.25rem' }}>WAREHOUSE STOCK</th>
              <th style={{ padding: '1rem 1.25rem' }}>FLASH DROP</th>
              <th style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>ACTION</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  Loading Hardware SKUs...
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id} style={{ borderBottom: '1px solid var(--border-subtle)', fontSize: '0.875rem' }}>
                  {/* Title & Image */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <img
                        src={p.images && p.images[0]}
                        alt=""
                        style={{ width: '40px', height: '40px', borderRadius: '4px', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{p.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Slug: {p.slug}</div>
                      </div>
                    </div>
                  </td>

                  {/* Category */}
                  <td style={{ padding: '1rem 1.25rem', color: 'var(--text-secondary)' }}>
                    {p.category?.name}
                  </td>

                  {/* Price */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <input
                      type="number"
                      step="0.01"
                      value={p.price}
                      onChange={(e) => handlePriceChange(p.id, parseFloat(e.target.value))}
                      style={{
                        width: '100px',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                  </td>

                  {/* Stock */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <input
                      type="number"
                      value={p.stock}
                      onChange={(e) => handleStockChange(p.id, parseInt(e.target.value) || 0)}
                      style={{
                        width: '80px',
                        padding: '0.35rem 0.6rem',
                        backgroundColor: 'var(--bg-main)',
                        border: p.stock < 10 ? '1px solid #f43f5e' : '1px solid var(--border-subtle)',
                        borderRadius: '4px',
                        color: p.stock < 10 ? '#fb7185' : '#34d399',
                        fontWeight: 700,
                        fontFamily: 'var(--font-mono)',
                      }}
                    />
                  </td>

                  {/* Flash Drop Toggle */}
                  <td style={{ padding: '1rem 1.25rem' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(p.isFlashSale)}
                      onChange={(e) => handleFlashToggle(p.id, e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#f59e0b', cursor: 'pointer' }}
                    />
                  </td>

                  {/* Save Button */}
                  <td style={{ padding: '1rem 1.25rem', textAlign: 'right' }}>
                    <button
                      onClick={() => saveProduct(p)}
                      disabled={savingId === p.id}
                      className="btn-primary"
                      style={{
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.75rem',
                        backgroundColor: savedSuccess === p.id ? '#10b981' : '#0ea5e9',
                      }}
                    >
                      {savedSuccess === p.id ? (
                        <>
                          <Check size={14} /> Saved
                        </>
                      ) : savingId === p.id ? (
                        'Updating...'
                      ) : (
                        <>
                          <Save size={14} /> Update
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
