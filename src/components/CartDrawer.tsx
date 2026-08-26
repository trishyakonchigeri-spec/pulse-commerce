'use client';

import React from 'react';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag } from 'lucide-react';
import { useCart } from './CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQuantity, subtotal, totalItems } = useCart();
  const freeShippingThreshold = 2999;
  const freeShippingProgress = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  if (!isCartOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 50,
      display: 'flex',
      justifyContent: 'flex-end',
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
    }}>
      {/* Backdrop click dismiss */}
      <div
        style={{ position: 'absolute', inset: 0 }}
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '460px',
        height: '100%',
        backgroundColor: 'var(--bg-surface)',
        borderLeft: '1px solid var(--border-strong)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '-10px 0 40px rgba(0,0,0,0.8)',
        zIndex: 51,
      }}>
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShoppingBag size={20} color="#0ea5e9" />
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
              Your Hardware Cart
            </h2>
            <span style={{
              background: 'var(--bg-surface-elevated)',
              color: 'var(--text-secondary)',
              fontSize: '0.75rem',
              fontWeight: 600,
              padding: '0.15rem 0.5rem',
              borderRadius: 'var(--radius-full)',
            }}>
              {totalItems} {totalItems === 1 ? 'item' : 'items'}
            </span>
          </div>

          <button
            onClick={() => setIsCartOpen(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              padding: '0.35rem',
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Free Shipping Progress Meter */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--bg-main)',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '0.8125rem',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
            <span style={{ color: 'var(--text-secondary)' }}>
              {remainingForFreeShipping === 0
                ? '🎉 You unlocked Free Express Shipping!'
                : `Add ${formatPrice(remainingForFreeShipping)} more for Free Shipping`}
            </span>
            <span style={{ fontWeight: 600, color: '#38bdf8' }}>{freeShippingProgress}%</span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            backgroundColor: 'var(--bg-surface-elevated)',
            borderRadius: 'var(--radius-full)',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${freeShippingProgress}%`,
              height: '100%',
              backgroundColor: '#0ea5e9',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Cart Item List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
        }}>
          {items.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              textAlign: 'center',
              gap: '1rem',
            }}>
              <ShoppingBag size={48} color="var(--text-muted)" />
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem' }}>
                Your cart is currently empty.
              </p>
              <button
                onClick={() => setIsCartOpen(false)}
                className="btn-secondary"
                style={{ fontSize: '0.875rem' }}
              >
                Browse Hardware Drops
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                style={{
                  display: 'flex',
                  gap: '1rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <img
                  src={item.image}
                  alt={item.name}
                  style={{
                    width: '64px',
                    height: '64px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#0a0e1a',
                  }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: '1.3' }}>
                      {item.name}
                    </h4>
                    <button
                      onClick={() => removeItem(item.productId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        padding: '0.2rem',
                      }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
                    {/* Quantity Selector */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: 'var(--bg-main)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-subtle)',
                    }}>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-secondary)',
                          padding: '0.25rem 0.5rem',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, padding: '0 0.4rem' }} className="mono-stat">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxStock}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: item.quantity >= item.maxStock ? 'var(--text-muted)' : 'var(--text-secondary)',
                          padding: '0.25rem 0.5rem',
                          cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#ffffff' }} className="mono-stat">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer / Checkout Button */}
        {items.length > 0 && (
          <div style={{
            padding: '1.25rem 1.5rem',
            borderTop: '1px solid var(--border-subtle)',
            backgroundColor: 'var(--bg-main)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <span>Subtotal</span>
              <span className="mono-stat" style={{ color: '#ffffff', fontWeight: 600 }}>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              <span>Shipping & GST calculated at checkout</span>
              <span>{remainingForFreeShipping === 0 ? 'FREE' : 'Est. ₹199'}</span>
            </div>

            <Link
              href="/checkout"
              onClick={() => setIsCartOpen(false)}
              className="btn-primary"
              style={{
                width: '100%',
                padding: '0.85rem',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              Reserve & Checkout <ArrowRight size={18} />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              <ShieldCheck size={14} color="#10b981" />
              <span>Atomic Inventory Lock Active on Checkout</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
