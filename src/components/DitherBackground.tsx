'use client';

import React, { useEffect, useState } from 'react';
import { Dither } from '@appletosolutions/reactbits';

interface DitherBackgroundProps {
  className?: string;
  opacity?: number;
  speed?: number;
}

const DitherBackground: React.FC<DitherBackgroundProps> = ({ 
  className = '',
  opacity = 0.15,
  speed = 0.3
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <div className={`fixed inset-0 w-full h-full pointer-events-none ${className}`}
         style={{ zIndex: 0 }}>
      <Dither
        opacity={opacity}
        speed={speed}
        waveFrequency={1.5}
        enableMouseInteraction={false}
        className="w-full h-full"
      />
    </div>
  );
};

export default DitherBackground;

