'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, PackageCheck, ArrowRight, ShieldCheck, Printer } from 'lucide-react';
import { useCart } from '@/components/CartContext';
import { formatPrice, formatDate } from '@/lib/utils';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('order_number');
  const sessionId = searchParams.get('session_id');
  const { clearCart } = useCart();

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Clear cart locally upon payment success
    clearCart();

    if (orderNumber && sessionId) {
      fetch('/api/checkout/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderNumber, sessionId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.order) setOrder(data.order);
        })
        .catch((err) => console.error('Verification error', err))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [orderNumber, sessionId]);

  return (
    <div className="container" style={{ paddingTop: '3.5rem', paddingBottom: '6rem', maxWidth: '720px' }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        {/* Success Icon */}
        <div style={{
          width: '4rem',
          height: '4rem',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.15)',
          color: '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}>
          <CheckCircle2 size={36} />
        </div>

        <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Hardware Order Confirmed!
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9375rem', marginBottom: '2rem' }}>
          Your payment was processed successfully. Inventory locks have been consumed and allocated to your shipment.
        </p>

        {/* Order Details Card */}
        {order && (
          <div style={{
            backgroundColor: 'var(--bg-main)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: '1.5rem',
            textAlign: 'left',
            marginBottom: '2rem',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ORDER NUMBER</div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0ea5e9' }} className="mono-stat">
                  {order.orderNumber}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PAYMENT STATUS</div>
                <div style={{ color: '#34d399', fontWeight: 700, fontSize: '0.875rem' }}>
                  PAID (VERIFIED)
                </div>
              </div>
            </div>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
              {order.items?.map((item: any) => (
                <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--text-primary)' }}>{item.quantity}x {item.title}</span>
                  <span className="mono-stat" style={{ color: '#ffffff', fontWeight: 600 }}>{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem', display: 'flex', justifyContent: 'space-between', fontSize: '1rem', fontWeight: 800, color: '#ffffff' }}>
              <span>Total Paid:</span>
              <span className="mono-stat" style={{ color: '#0ea5e9' }}>{formatPrice(order.total)}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.print()}
            className="btn-secondary"
            style={{ fontSize: '0.875rem' }}
          >
            <Printer size={16} /> Print Receipt
          </button>
          <Link href="/products" className="btn-primary" style={{ fontSize: '0.875rem' }}>
            Continue Shopping <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
