'use client';

import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';

interface CountdownProps {
  initialHours?: number;
}

export default function FlashSaleCountdown({ initialHours = 24 }: CountdownProps) {
  const [timeLeft, setTimeLeft] = useState({
    hours: initialHours,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatUnit = (num: number) => String(num).padStart(2, '0');

  return (
    <div style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: 'rgba(245, 158, 11, 0.12)',
      border: '1px solid rgba(245, 158, 11, 0.3)',
      padding: '0.5rem 1rem',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.8125rem', fontWeight: 700 }}>
        <Clock size={16} />
        <span>DROP ENDS IN:</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }} className="mono-stat">
        <div style={{
          background: 'var(--bg-main)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          padding: '0.2rem 0.45rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          {formatUnit(timeLeft.hours)}
        </div>
        <span style={{ color: '#fbbf24', fontWeight: 800 }}>:</span>
        <div style={{
          background: 'var(--bg-main)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          padding: '0.2rem 0.45rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          {formatUnit(timeLeft.minutes)}
        </div>
        <span style={{ color: '#fbbf24', fontWeight: 800 }}>:</span>
        <div style={{
          background: 'var(--bg-main)',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '0.9375rem',
          padding: '0.2rem 0.45rem',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
        }}>
          {formatUnit(timeLeft.seconds)}
        </div>
      </div>
    </div>
  );
}
