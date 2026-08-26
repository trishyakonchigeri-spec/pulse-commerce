'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/components/CartContext';
import { formatPrice } from '@/lib/utils';
import { ShieldCheck, Clock, Lock, CreditCard, ArrowRight, AlertCircle, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, sessionId, clearCart } = useCart();

  const [loading, setLoading] = useState(false);
  const [reserving, setReserving] = useState(true);
  const [reservationError, setReservationError] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(600); // 10 mins

  // Shipping Form State (Default Indian Address)
  const [formData, setFormData] = useState({
    name: 'Alex Vance',
    email: 'alex@pulsecommerce.dev',
    street: '42 MG Road, Indiranagar',
    city: 'Bengaluru',
    state: 'Karnataka',
    zip: '560038',
    country: 'India',
  });

  // 1. Reserve Stock Atomically on Page Mount
  useEffect(() => {
    if (items.length === 0) {
      setReserving(false);
      return;
    }

    async function lockInventory() {
      setReserving(true);
      setReservationError(null);

      try {
        const res = await fetch('/api/checkout/reserve', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sessionId,
            items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
            holdMinutes: 10,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setReservationError(data.error || 'Unable to reserve inventory. Item sold out.');
        } else {
          setLockExpiresAt(data.expiresAt);
          setSecondsRemaining(600);
        }
      } catch (err) {
        setReservationError('Failed to communicate with inventory lock engine.');
      } finally {
        setReserving(false);
      }
    }

    lockInventory();
  }, [sessionId, items]);

  // Tick-down timer for 10-minute hold
  useEffect(() => {
    if (!lockExpiresAt) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setReservationError('Your 10-minute inventory reservation has expired. Please refresh.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt]);

  const tax = Number((subtotal * 0.18).toFixed(2));
  const shipping = subtotal > 2999 ? 0.0 : 199.0;
  const total = Number((subtotal + tax + shipping).toFixed(2));

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins}:${String(s).padStart(2, '0')}`;
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          items: items.map((i) => ({
            productId: i.productId,
            title: i.name,
            price: i.price,
            quantity: i.quantity,
            image: i.image,
          })),
          shippingAddress: formData,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || 'Checkout initialization failed');
        setLoading(false);
        return;
      }

      if (data.checkoutUrl) {
        // Redirect to Stripe Checkout or internal mock checkout verifier
        window.location.href = data.checkoutUrl;
      }
    } catch (err) {
      alert('Failed to connect to checkout service');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container" style={{ padding: '6rem 0', textAlign: 'center' }}>
        <ShoppingBag size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Add some high-performance hardware to your cart first.</p>
        <Link href="/products" className="btn-primary">Browse Hardware</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '5rem', maxWidth: '1000px' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.5rem' }}>
          Secure Hardware Checkout
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Encrypted payment gateway with transaction-isolated stock reservation.
        </p>
      </div>

      {/* Reservation Timer Banner */}
      {!reservationError && (
        <div style={{
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          border: '1px solid rgba(14, 165, 233, 0.3)',
          borderRadius: 'var(--radius-md)',
          padding: '1rem 1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '2rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <ShieldCheck size={20} color="#38bdf8" />
            <span style={{ fontSize: '0.875rem', color: '#e0f2fe' }}>
              <strong>Stock Reserved:</strong> Units are locked to your session. Complete checkout before timer expires.
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--bg-main)',
            padding: '0.35rem 0.75rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            color: '#38bdf8',
            fontWeight: 700,
            fontSize: '0.9375rem',
          }} className="mono-stat">
            <Clock size={15} />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>
        </div>
      )}

      {/* Out of Stock Error */}
      {reservationError && (
        <div style={{
          backgroundColor: 'rgba(244, 63, 94, 0.15)',
          border: '1px solid rgba(244, 63, 94, 0.4)',
          borderRadius: 'var(--radius-md)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: '#fb7185',
          marginBottom: '2rem',
        }}>
          <AlertCircle size={24} />
          <div>
            <strong>Reservation Failed:</strong> {reservationError}
          </div>
        </div>
      )}

      {/* Main Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '2.5rem',
      }}>
        {/* Left: Shipping Form */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Lock size={18} color="#0ea5e9" /> 1. Shipping Details
          </h2>

          <form onSubmit={handleCheckoutSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>Street Address</label>
              <input
                type="text"
                required
                value={formData.street}
                onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>City</label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>State</label>
                <input
                  type="text"
                  required
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>ZIP</label>
                <input
                  type="text"
                  required
                  value={formData.zip}
                  onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                  style={{ width: '100%', padding: '0.65rem', backgroundColor: 'var(--bg-main)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', color: '#fff' }}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || Boolean(reservationError)}
              className="btn-primary"
              style={{
                marginTop: '1.5rem',
                padding: '0.85rem',
                fontSize: '1rem',
                opacity: loading || reservationError ? 0.5 : 1,
                cursor: loading || reservationError ? 'not-allowed' : 'pointer',
              }}
            >
              <CreditCard size={18} />
              {loading ? 'Initiating Stripe Session...' : 'Pay with Stripe'}
            </button>
          </form>
        </div>

        {/* Right: Order Summary */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.75rem',
          height: 'fit-content',
        }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff', marginBottom: '1.25rem' }}>
            Order Summary ({items.length} items)
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {items.map((item) => (
              <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{item.quantity}x</span>
                  <span style={{ color: 'var(--text-primary)' }}>{item.name}</span>
                </div>
                <span className="mono-stat" style={{ color: '#ffffff', fontWeight: 600 }}>
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span className="mono-stat" style={{ color: '#fff' }}>{formatPrice(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Est. GST (18%)</span>
              <span className="mono-stat" style={{ color: '#fff' }}>{formatPrice(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span style={{ color: shipping === 0 ? '#34d399' : '#fff' }}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '0.75rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.125rem', fontWeight: 800, color: '#ffffff' }}>
              <span>Total</span>
              <span className="mono-stat" style={{ color: '#0ea5e9' }}>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
