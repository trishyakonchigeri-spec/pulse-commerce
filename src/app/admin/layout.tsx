import React from 'react';
import Link from 'next/link';
import { LayoutDashboard, Package, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ backgroundColor: 'var(--bg-main)', minHeight: 'calc(100vh - 4.5rem)' }}>
      {/* Admin Subheader Navigation */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-subtle)',
        padding: '0.75rem 0',
      }}>
        <div className="container" style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              color: '#34d399',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.6rem',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
            }}>
              <Shield size={13} /> RBAC: ADMIN LEVEL
            </span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>|</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              PulseCommerce Enterprise Control Center
            </span>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link
              href="/admin"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                color: '#fff',
                fontWeight: 600,
                padding: '0.4rem 0.8rem',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--bg-surface-elevated)',
              }}
            >
              <LayoutDashboard size={15} color="#0ea5e9" /> Analytics
            </Link>

            <Link
              href="/admin/products"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                padding: '0.4rem 0.8rem',
              }}
            >
              <Package size={15} /> Inventory & Products
            </Link>

            <Link
              href="/admin/orders"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                fontWeight: 500,
                padding: '0.4rem 0.8rem',
              }}
            >
              <ShoppingBag size={15} /> Order Pipeline
            </Link>
          </div>
        </div>
      </div>

      <div className="container" style={{ paddingTop: '2rem', paddingBottom: '5rem' }}>
        {children}
      </div>
    </div>
  );
}
