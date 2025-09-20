'use client';

import { useEffect, useState } from 'react';

interface VisualFeedbackProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  duration?: number;
  onComplete?: () => void;
}

export default function VisualFeedback({ type, message, duration = 2000, onComplete }: VisualFeedbackProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setIsAnimating(false);
      setTimeout(() => {
        setIsVisible(false);
        onComplete?.();
      }, 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onComplete]);

  // Add custom shake animation - moved to useEffect to avoid SSR issues
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.textContent = `
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (!isVisible) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-emerald-500',
          text: 'text-white',
          icon: '✅',
          animation: 'animate-bounce'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500',
          text: 'text-white',
          icon: '⚠️',
          animation: 'animate-pulse'
        };
      case 'error':
        return {
          bg: 'bg-rose-500',
          text: 'text-white',
          icon: '❌',
          animation: 'animate-shake'
        };
      case 'info':
        return {
          bg: 'bg-blue-500',
          text: 'text-white',
          icon: 'ℹ️',
          animation: 'animate-pulse'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className={`fixed top-4 right-4 z-50 ${isAnimating ? styles.animation : ''}`}>
      <div className={`${styles.bg} ${styles.text} px-6 py-4 rounded-xl shadow-lg flex items-center space-x-3 max-w-sm`}>
        <span className="text-2xl">{styles.icon}</span>
        <span className="font-medium">{message}</span>
      </div>
    </div>
  );
}

