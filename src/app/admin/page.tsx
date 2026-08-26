'use client';

import React, { useState, useEffect } from 'react';
import { DollarSign, ShoppingBag, Package, AlertTriangle, ShieldCheck, ArrowUpRight, TrendingUp, Users, RefreshCw } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import Link from 'next/link';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/analytics');
      if (res.status === 403) {
        setError('Unauthorized. Please log in with the Admin demo account.');
        setLoading(false);
        return;
      }
      const json = await res.json();
      setData(json);
    } catch (err) {
      setError('Failed to fetch analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '5rem 0', color: 'var(--text-secondary)' }}>
        <h2>Loading Real-Time Sales & Concurrency Metrics...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-lg)',
        padding: '3rem',
        textAlign: 'center',
      }}>
        <AlertTriangle size={48} color="#fb7185" style={{ margin: '0 auto 1rem' }} />
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{error}</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Use the 1-click Demo Admin login button to authenticate as an administrator.</p>
        <Link href="/auth/login" className="btn-primary">Go to Login Page</Link>
      </div>
    );
  }

  const { metrics, lowStockProducts, recentOrders, salesChartData } = data || {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Top Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Metric 1: Total Revenue */}
        <div className="tech-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL REVENUE</span>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(14, 165, 233, 0.15)', color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
            {formatPrice(metrics?.totalRevenue || 0)}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.5rem' }}>
            <TrendingUp size={14} /> Verified Stripe Settled Volume
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div className="tech-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>TOTAL ORDERS</span>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShoppingBag size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
            {metrics?.totalOrders || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {metrics?.paidOrders || 0} Paid & Verified ({metrics?.totalOrders ? Math.round(((metrics.paidOrders / metrics.totalOrders) * 100)) : 100}%)
          </div>
        </div>

        {/* Metric 3: Active Locks */}
        <div className="tech-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE STOCK LOCKS</span>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ShieldCheck size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#fbbf24' }} className="mono-stat">
            {metrics?.activeLocksCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Live checkout session reservations
          </div>
        </div>

        {/* Metric 4: Hardware SKUs */}
        <div className="tech-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>ACTIVE HARDWARE SKUS</span>
            <div style={{ width: '2rem', height: '2rem', borderRadius: 'var(--radius-sm)', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Package size={18} />
            </div>
          </div>
          <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
            {metrics?.productsCount || 0}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Across 4 categories
          </div>
        </div>
      </div>

      {/* Grid: Low Stock Alert & Recent Orders */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '2rem',
      }}>
        {/* Low Stock Alerts */}
        <div className="tech-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={18} color="#fb7185" />
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Low Stock Hardware Alerts</h3>
            </div>
            <Link href="/admin/products" style={{ color: '#0ea5e9', fontSize: '0.8125rem', fontWeight: 600 }}>
              Restock SKUs
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {lowStockProducts?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>All hardware inventory levels are healthy (&gt; 10 units).</p>
            ) : (
              lowStockProducts?.map((item: any) => (
                <div
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</h4>
                    <span className="mono-stat" style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatPrice(item.price)}</span>
                  </div>

                  <span style={{
                    padding: '0.25rem 0.6rem',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: item.stock <= 4 ? 'rgba(244, 63, 94, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                    color: item.stock <= 4 ? '#fb7185' : '#fbbf24',
                    fontWeight: 700,
                    fontSize: '0.75rem',
                  }}>
                    {item.stock} left
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Orders Stream */}
        <div className="tech-card" style={{ padding: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>Recent Transactions</h3>
            <Link href="/admin/orders" style={{ color: '#0ea5e9', fontSize: '0.8125rem', fontWeight: 600 }}>
              View Pipeline
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {recentOrders?.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No orders recorded yet.</p>
            ) : (
              recentOrders?.map((ord: any) => (
                <div
                  key={ord.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem 1rem',
                    backgroundColor: 'var(--bg-main)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '0.8125rem', fontWeight: 700, color: '#0ea5e9' }} className="mono-stat">
                      {ord.orderNumber}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {ord.user?.name || ord.guestEmail || 'Guest'} • {formatDate(ord.createdAt)}
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#ffffff' }} className="mono-stat">
                      {formatPrice(ord.total)}
                    </div>
                    <span style={{
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: ord.status === 'PAID' || ord.status === 'DELIVERED' ? '#34d399' : '#fbbf24',
                    }}>
                      {ord.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
