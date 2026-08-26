'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, CheckCircle, Truck, Package, Clock, XCircle, RefreshCw } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      setOrders(data.orders || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      const res = await fetch('/api/admin/orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', marginBottom: '0.25rem' }}>
            Customer Order Fulfillment Pipeline
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            Transition orders through the fulfillment lifecycle: Pending &rarr; Paid &rarr; Processing &rarr; Shipped &rarr; Delivered.
          </p>
        </div>

        <button onClick={fetchOrders} className="btn-secondary" style={{ fontSize: '0.8125rem' }}>
          <RefreshCw size={14} /> Refresh Pipeline
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-muted)' }}>
            Loading Order Pipeline...
          </div>
        ) : orders.length === 0 ? (
          <div className="tech-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
            No orders found in the database.
          </div>
        ) : (
          orders.map((order) => {
            const address = order.shippingAddress ? JSON.parse(order.shippingAddress) : {};

            return (
              <div key={order.id} className="tech-card" style={{ padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0ea5e9' }} className="mono-stat">
                        {order.orderNumber}
                      </span>
                      <span style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: order.isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: order.isPaid ? '#34d399' : '#fbbf24',
                      }}>
                        {order.isPaid ? 'PAID' : 'PAYMENT PENDING'}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                      Customer: {order.user?.name || address.name || 'Guest'} ({order.user?.email || address.email || 'N/A'}) • {formatDate(order.createdAt)}
                    </div>
                  </div>

                  {/* Status Dropdown */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>Status:</span>
                    <select
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleStatusChange(order.id, e.target.value)}
                      style={{
                        padding: '0.4rem 0.85rem',
                        backgroundColor: 'var(--bg-main)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-sm)',
                        color: '#ffffff',
                        fontSize: '0.8125rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="PENDING">PENDING</option>
                      <option value="PAID">PAID</option>
                      <option value="PROCESSING">PROCESSING</option>
                      <option value="SHIPPED">SHIPPED</option>
                      <option value="DELIVERED">DELIVERED</option>
                      <option value="CANCELLED">CANCELLED</option>
                    </select>
                  </div>
                </div>

                {/* Items & Shipping Address Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                  {/* Items */}
                  <div>
                    <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>PURCHASED HARDWARE</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                      {order.items?.map((item: any) => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                          <span style={{ color: 'var(--text-primary)' }}>{item.quantity}x {item.title}</span>
                          <span className="mono-stat" style={{ color: '#fff' }}>{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div>
                    <h4 style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: 600 }}>DISPATCH DESTINATION</h4>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: '1.4' }}>
                      {address.name}<br />
                      {address.street}<br />
                      {address.city}, {address.state} {address.zip}, {address.country}
                    </p>
                  </div>

                  {/* Financial Settlement */}
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL SETTLED AMOUNT</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0ea5e9' }} className="mono-stat">
                      {formatPrice(order.total)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
