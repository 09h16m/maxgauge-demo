'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

type Block = {
  id: number;
  height: number; // CPU 사용량에 대응
  color: string;
};

const generateRandomBlocks = (count: number): Block[] => {
  const colors = ['bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-red-500'];
  return Array.from({ length: count }, (_, i) => {
    const cpu = Math.floor(Math.random() * 100);
    let color = colors[0];
    if (cpu > 80) color = colors[3];
    else if (cpu > 60) color = colors[2];
    else if (cpu > 30) color = colors[1];
    return {
      id: i,
      height: Math.max(10, cpu), // 최소 높이 보장
      color,
    };
  });
};

const BlockGrid = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);

  useEffect(() => {
    setBlocks(generateRandomBlocks(80));
  }, []);

  return (
    <div className="grid grid-cols-10 gap-2 p-10">
      {blocks.map((block) => (
        <motion.div
          key={block.id}
          className={`w-6 ${block.color} rounded`}
          initial={{ height: 10 }}
          animate={{ height: block.height }}
          transition={{ duration: 0.6, delay: block.id * 0.01 }}
        />
      ))}
    </div>
  );
};

export default BlockGrid;
