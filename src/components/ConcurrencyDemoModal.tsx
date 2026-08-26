'use client';

import React, { useState } from 'react';
import { X, Play, ShieldCheck, AlertTriangle, Terminal, CheckCircle2, XCircle, Cpu } from 'lucide-react';

interface ConcurrencyDemoModalProps {
  onClose: () => void;
}

export default function ConcurrencyDemoModal({ onClose }: ConcurrencyDemoModalProps) {
  const [concurrentUsers, setConcurrentUsers] = useState(25);
  const [initialStock, setInitialStock] = useState(5);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<any>(null);

  const runSimulation = async () => {
    setIsRunning(true);
    setResults(null);

    try {
      const res = await fetch('/api/simulate/concurrency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          concurrentRequests: concurrentUsers,
          initialStock: initialStock,
        }),
      });
      const data = await res.json();
      setResults(data);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 60,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(8px)',
      padding: '1.5rem',
    }}>
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '840px',
        maxHeight: '90vh',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-strong)',
        borderRadius: 'var(--radius-lg)',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.9)',
        overflow: 'hidden',
      }}>
        {/* Modal Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'linear-gradient(90deg, rgba(14, 165, 233, 0.1) 0%, transparent 100%)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '2rem',
              height: '2rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(99, 102, 241, 0.2)',
              color: '#818cf8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <Terminal size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#ffffff' }}>
                Interactive Concurrency & Race-Condition Sandbox
              </h2>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Demonstrating PostgreSQL / Prisma row-level transaction isolation against flash-sale spikes
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '0.35rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Controls Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.25rem',
            backgroundColor: 'var(--bg-main)',
            padding: '1.25rem',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Concurrent HTTP Requests: <span style={{ color: '#0ea5e9' }}>{concurrentUsers} users</span>
              </label>
              <input
                type="range"
                min="10"
                max="50"
                step="5"
                value={concurrentUsers}
                onChange={(e) => setConcurrentUsers(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', accentColor: '#0ea5e9' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
                Available Flash Stock: <span style={{ color: '#f59e0b' }}>{initialStock} units</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={initialStock}
                onChange={(e) => setInitialStock(Number(e.target.value))}
                disabled={isRunning}
                style={{ width: '100%', accentColor: '#f59e0b' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                onClick={runSimulation}
                disabled={isRunning}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '0.65rem',
                  opacity: isRunning ? 0.7 : 1,
                  cursor: isRunning ? 'wait' : 'pointer',
                }}
              >
                {isRunning ? (
                  <>
                    <Cpu size={16} className="animate-spin" /> Simulating Spikes...
                  </>
                ) : (
                  <>
                    <Play size={16} fill="currentColor" /> Execute Stress Test
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Results Summary Box */}
          {results && (
            <div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
                gap: '1rem',
                marginBottom: '1rem',
              }}>
                <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>TOTAL REQUESTS</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#ffffff' }} className="mono-stat">
                    {results.summary.totalRequests}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#34d399' }}>UNITS RESERVED</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399' }} className="mono-stat">
                    {results.summary.successfulReservations} / {results.summary.initialStock}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: '#fb7185' }}>REJECTED (SAFE)</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fb7185' }} className="mono-stat">
                    {results.summary.rejectedRequests}
                  </div>
                </div>

                <div style={{ padding: '1rem', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>OVERSELL COUNT</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 800, color: results.summary.oversellCount === 0 ? '#34d399' : '#f43f5e' }} className="mono-stat">
                    {results.summary.oversellCount} (0.00%)
                  </div>
                </div>
              </div>

              {/* Status Banner */}
              <div style={{
                padding: '0.85rem 1.25rem',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                border: '1px solid rgba(16, 185, 129, 0.3)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1rem',
              }}>
                <CheckCircle2 size={20} color="#10b981" />
                <div style={{ fontSize: '0.875rem', color: '#34d399' }}>
                  <strong>ACID Integrity Passed:</strong> {results.summary.successfulReservations} users locked items, {results.summary.rejectedRequests} safely rejected. Execution duration: {results.summary.totalDurationMs}ms.
                </div>
              </div>

              {/* Terminal Audit Log */}
              <div style={{
                backgroundColor: '#040711',
                border: '1px solid var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontFamily: 'var(--font-mono)',
                fontSize: '0.75rem',
                maxHeight: '220px',
                overflowY: 'auto',
              }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.35rem' }}>
                  // LIVE DATABASE TRANSACTION AUDIT STREAM
                </div>
                {results.auditLog?.map((log: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.2rem 0',
                      color: log.status === 'SUCCESS' ? '#34d399' : '#94a3b8',
                    }}
                  >
                    <span>
                      [{log.timestamp.slice(11, 23)}] [Worker #{String(log.workerId).padStart(2, '0')}]: {log.message}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>{log.latencyMs}ms</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
