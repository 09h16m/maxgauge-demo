'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface TooltipProps {
  children: ReactNode;
  content: string;
  side?: 'top' | 'bottom' | 'left' | 'right';
  delayDuration?: number;
}

export function Tooltip({ 
  children, 
  content, 
  side = 'top',
  delayDuration = 200 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const triggerRef = useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = useState<{ top: number; left: number } | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      // Calculate absolute position relative to viewport and scroll
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const scrollX = window.scrollX || window.pageXOffset;
        const scrollY = window.scrollY || window.pageYOffset;

        let top = 0;
        let left = rect.left + rect.width / 2 + scrollX;

        if (side === 'top') {
          top = rect.top + scrollY - 8; // 8px above trigger
        } else if (side === 'bottom') {
          top = rect.bottom + scrollY + 8; // 8px below trigger
        } else if (side === 'left') {
          top = rect.top + rect.height / 2 + scrollY;
          left = rect.left + scrollX - 8; // 8px to the left
        } else {
          top = rect.top + rect.height / 2 + scrollY;
          left = rect.right + scrollX + 8; // 8px to the right
        }

        setCoords({ top, left });
      }
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const getTransform = () => {
    switch (side) {
      case 'top':
        return 'translateX(-50%) translateY(-100%)';
      case 'bottom':
        return 'translateX(-50%)';
      case 'left':
        return 'translateY(-50%) translateX(-100%)';
      case 'right':
        return 'translateY(-50%)';
      default:
        return 'translateX(-50%) translateY(-100%)';
    }
  };

  return (
    <div 
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {isVisible && coords && createPortal(
        <div 
          className="fixed z-50 px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md whitespace-nowrap pointer-events-none animate-in fade-in-0 zoom-in-95"
          style={{
            top: coords.top,
            left: coords.left,
            transform: getTransform(),
            animationDuration: '150ms',
            animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          {content}
          
          {/* Arrow */}
          <div 
            className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
              side === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
              side === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
              side === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
              'left-[-4px] top-1/2 -translate-y-1/2'
            }`}
          />
        </div>,
        document.body
      )}
    </div>
  );
}

