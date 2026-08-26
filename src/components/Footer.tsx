import React from 'react';
import Link from 'next/link';
import { Zap, ShieldCheck, Database, Server, GitBranch, Terminal } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: '#070a12',
      borderTop: '1px solid var(--border-subtle)',
      paddingTop: '3.5rem',
      paddingBottom: '2.5rem',
      marginTop: 'auto',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Column 1: System Specs */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <div style={{
                width: '1.75rem',
                height: '1.75rem',
                borderRadius: '6px',
                background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Zap size={14} color="#fff" />
              </div>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', color: '#fff' }}>
                PULSE<span style={{ color: '#0ea5e9' }}>//</span>COMMERCE
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: '1.6', marginBottom: '1rem' }}>
              Production-grade e-commerce architecture showcasing high-throughput flash sale concurrency, Redis caching, and idempotent payment processing.
            </p>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', color: '#38bdf8', border: '1px solid var(--border-subtle)' }}>Next.js 14 App Router</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', color: '#34d399', border: '1px solid var(--border-subtle)' }}>Prisma + PostgreSQL</span>
              <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: '4px', background: 'var(--bg-surface-elevated)', color: '#f87171', border: '1px solid var(--border-subtle)' }}>Redis Caching</span>
            </div>
          </div>

          {/* Column 2: Architectural Highlights */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              RESUME ARCHITECTURE
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={14} color="#34d399" /> Concurrency Stock Locks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Database size={14} color="#38bdf8" /> Multi-tier Cache Invalidation
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Server size={14} color="#f59e0b" /> Idempotent Stripe Webhooks
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitBranch size={14} color="#a78bfa" /> Docker Multi-Stage Builds
              </li>
            </ul>
          </div>

          {/* Column 3: Quick Navigation */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              PLATFORM NAVIGATION
            </h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              <li><Link href="/products" style={{ transition: 'color 0.15s' }}>Hardware Catalog</Link></li>
              <li><Link href="/flash-sales" style={{ transition: 'color 0.15s' }}>⚡ Live Flash Drops</Link></li>
              <li><Link href="/auth/login" style={{ transition: 'color 0.15s' }}>Demo Logins (Admin / Buyer)</Link></li>
              <li><Link href="/admin" style={{ transition: 'color 0.15s' }}>Admin Analytics Dashboard</Link></li>
            </ul>
          </div>

          {/* Column 4: System Status */}
          <div>
            <h4 style={{ color: '#fff', fontSize: '0.9375rem', fontWeight: 600, marginBottom: '1rem', letterSpacing: '0.05em' }}>
              NODE STATUS
            </h4>
            <div style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              fontSize: '0.8125rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Database Lock Engine:</span>
                <span style={{ color: '#34d399', fontWeight: 600 }}>ACTIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Cache Hit Latency:</span>
                <span style={{ color: '#38bdf8', fontWeight: 600 }} className="mono-stat">&lt; 15ms</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-muted)' }}>Payment Idempotency:</span>
                <span style={{ color: '#a78bfa', fontWeight: 600 }}>ENABLED</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: 'var(--text-muted)',
        }}>
          <div>© 2026 PulseCommerce Engine. Built for portfolio & enterprise demonstration.</div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>TypeScript</span>
            <span>Next.js App Router</span>
            <span>Prisma ORM</span>
            <span>Stripe</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
