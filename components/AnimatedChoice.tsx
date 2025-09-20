'use client';

import { useState, useEffect } from 'react';

interface AnimatedChoiceProps {
  children: React.ReactNode;
  index: number;
  onClick: () => void;
  isSelected?: boolean;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  disabled?: boolean;
}

export default function AnimatedChoice({ 
  children, 
  index, 
  onClick, 
  isSelected = false, 
  isCorrect = false, 
  isIncorrect = false,
  disabled = false 
}: AnimatedChoiceProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showResult, setShowResult] = useState(false);

  useEffect(() => {
    if (isCorrect || isIncorrect) {
      setIsAnimating(true);
      setShowResult(true);
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setShowResult(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isCorrect, isIncorrect]);

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

  const getButtonStyles = () => {
    if (disabled) {
      return 'bg-slate-100 text-slate-400 cursor-not-allowed';
    }
    if (isCorrect) {
      return 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-200';
    }
    if (isIncorrect) {
      return 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-200';
    }
    if (isSelected) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300 shadow-md';
    }
    return 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:shadow-md';
  };

  const getAnimationClass = () => {
    if (isAnimating) {
      if (isCorrect) return 'animate-bounce';
      if (isIncorrect) return 'animate-shake';
    }
    return 'transition-all duration-300 hover:scale-105';
  };

  return (
    <div className="relative">
      <button
        onClick={onClick}
        disabled={disabled}
        className={`w-full h-12 rounded-xl border-2 font-medium text-left px-4 ${getButtonStyles()} ${getAnimationClass()}`}
        style={{
          animationDelay: `${index * 100}ms`,
          transform: isAnimating ? 'scale(1.05)' : 'scale(1)',
        }}
      >
        <div className="flex items-center space-x-3">
          <span className="text-slate-500 font-bold text-lg">
            {index + 1}.
          </span>
          <span className="flex-1">{children}</span>
          {showResult && (
            <span className="text-2xl">
              {isCorrect ? '✅' : isIncorrect ? '❌' : ''}
            </span>
          )}
        </div>
      </button>
      
      {/* Ripple effect */}
      {isAnimating && (
        <div className="absolute inset-0 rounded-xl overflow-hidden">
          <div className={`absolute inset-0 ${
            isCorrect ? 'bg-emerald-200' : 'bg-rose-200'
          } animate-ping opacity-75`} />
        </div>
      )}
    </div>
  );
}

