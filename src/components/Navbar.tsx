'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Zap, Cpu, ShieldCheck, User, LogOut, LayoutDashboard, Terminal } from 'lucide-react';
import { useCart } from './CartContext';
import ConcurrencyDemoModal from './ConcurrencyDemoModal';

export default function Navbar() {
  const pathname = usePathname();
  const { totalItems, setIsCartOpen } = useCart();
  const [isConcurrencyOpen, setIsConcurrencyOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUser(data.user);
      })
      .catch(() => {});
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setCurrentUser(null);
    window.location.href = '/';
  };

  return (
    <>
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        backgroundColor: 'rgba(9, 13, 22, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border-subtle)',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: '4.5rem',
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2.5rem',
              height: '2.5rem',
              borderRadius: 'var(--radius-md)',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #6366f1 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)',
            }}>
              <Zap size={20} color="#ffffff" />
            </div>
            <div>
              <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#ffffff' }}>
                PULSE<span style={{ color: '#0ea5e9' }}>//</span>COMMERCE
              </span>
              <span style={{ display: 'block', fontSize: '0.6875rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.1em' }}>
                ENTERPRISE HARDWARE
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <Link
              href="/products"
              style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: pathname === '/products' ? '#0ea5e9' : 'var(--text-secondary)',
                transition: 'color 0.15s ease',
              }}
            >
              All Hardware
            </Link>

            <Link
              href="/flash-sales"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: pathname === '/flash-sales' ? '#fbbf24' : '#f59e0b',
                transition: 'color 0.15s ease',
              }}
            >
              <Zap size={16} /> Flash Sales
            </Link>

            {/* Concurrency Simulation Sandbox Trigger */}
            <button
              onClick={() => setIsConcurrencyOpen(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                backgroundColor: 'rgba(99, 102, 241, 0.12)',
                color: '#818cf8',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
            >
              <Terminal size={14} /> Concurrency Sandbox
            </button>

            {currentUser?.role === 'ADMIN' && (
              <Link
                href="/admin"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  color: '#34d399',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                <LayoutDashboard size={16} /> Admin Portal
              </Link>
            )}
          </nav>

          {/* Right Action Icons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Hi, <strong>{currentUser.name.split(' ')[0]}</strong>
                  {currentUser.role === 'ADMIN' && (
                    <span style={{ marginLeft: '0.4rem', fontSize: '0.7rem', background: '#065f46', color: '#6ee7b7', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                      ADMIN
                    </span>
                  )}
                </span>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  fontSize: '0.875rem',
                  color: 'var(--text-secondary)',
                  padding: '0.5rem 0.9rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <User size={16} /> Sign In
              </Link>
            )}

            {/* Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5rem',
                height: '2.5rem',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-primary)',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={18} />
              {totalItems > 0 && (
                <span style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  backgroundColor: '#0ea5e9',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Interactive Concurrency Simulation Modal */}
      {isConcurrencyOpen && (
        <ConcurrencyDemoModal onClose={() => setIsConcurrencyOpen(false)} />
      )}
    </>
  );
}
