'use client';

import { BlockData } from './Block3D';
import { useState } from 'react';

interface IssueMapProps {
  blocks: BlockData[];
}

export default function IssueMap({ blocks }: IssueMapProps) {
  const [hoveredBlock, setHoveredBlock] = useState<number | null>(null);
  
  const getBlockColor = (block: BlockData) => {
    if (block.status === 'critical') return '#fb2c36';
    if (block.status === 'warning') return '#fe9a00';
    
    // Normal 상태 - CPU 사용률에 따라
    if (block.cpuUsage <= 10) return '#ffffff';   // white (0~10%)
    if (block.cpuUsage <= 25) return '#38bdf8';   // sky-400 (11~25%)
    return '#34d399';  // emerald-400 (26~100%)
  };

  const getStatusLabel = (status: BlockData['status']) => {
    if (status === 'critical') return '이상 탐지';
    if (status === 'warning') return '이상 감지 중';
    return '정상';
  };

  const getStatusBadgeStyle = (status: BlockData['status']) => {
    if (status === 'critical') {
      return 'bg-[#FFE2E2] text-[#E7000B]'; // Figma red
    }
    if (status === 'warning') {
      return 'bg-[#FEF3C6] text-[#E17100]'; // Figma amber
    }
    return 'bg-[#DFF2FE] text-[#0084D1]'; // Figma sky
  };

  return (
    <div className="backdrop-blur-sm">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-[#030712]">Issue Map</h3>
        
        {/* 범례 */}
        <div className="flex items-center gap-4 text-xs">
          {/* CPU Usage */}
          <div className="flex items-center gap-1">
            <span className="text-[#6a7282]">CPU Usage</span>
            <div 
              className="w-8 h-3 rounded-[2px]"
              style={{
                background: 'linear-gradient(90deg, #38bdf8 0%, #34d399 100%)'
              }}
            />
          </div>
          
          {/* 이상 감지 */}
          <div className="flex items-center gap-1">
            <span className="text-[#6a7282]">이상 감지</span>
            <div className="w-3 h-3 rounded-[2px] bg-[#fe9a00]" />
          </div>
          
          {/* 리포트 */}
          <div className="flex items-center gap-1">
            <span className="text-[#6a7282]">리포트</span>
            <div className="w-3 h-3 rounded-[2px] bg-[#ff2056]" />
          </div>
        </div>
      </div>
      
      {/* 히트맵 그리드 (가로 형태: 32열 x 8행) */}
      <div className="flex flex-col gap-[2px] relative">
        {Array.from({ length: 8 }).map((_, row) => (
          <div key={row} className="flex gap-[2px]">
            {Array.from({ length: 32 }).map((_, col) => {
              const index = col * 8 + row;
              const block = blocks[index];
              const color = block ? getBlockColor(block) : '#e5e7eb';
              const isHovered = hoveredBlock === index;
              
              return (
                <div
                  key={col}
                  className="relative"
                  onMouseEnter={() => setHoveredBlock(index)}
                  onMouseLeave={() => setHoveredBlock(null)}
                >
                  <div
                    className={`w-3 h-3 rounded-[1px] transition-all duration-300 cursor-pointer ${
                      isHovered ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent scale-110' : ''
                    }`}
                    style={{ backgroundColor: color }}
                  />
                  
                  {/* 커스텀 툴팁 - Figma 디자인 */}
                  {isHovered && block && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 z-50 pointer-events-none">
                      <div className="relative bg-white rounded-md shadow-[0px_0px_24px_0px_rgba(3,7,18,0.16)] px-2 py-1.5">
                        {/* 서버명 + 배지 */}
                        <div className="flex items-center gap-1.5 mb-1.5 whitespace-nowrap">
                          <img 
                            src="/logos/oracle-logo.svg" 
                            alt="Oracle" 
                            className="w-4 h-4 shrink-0"
                          />
                          <span className="font-medium text-[#030712] text-base leading-tight shrink-0">
                            PROD{block.id}
                          </span>
                          <span className={`px-1 py-0.5 rounded-md text-xs font-medium shrink-0 inline-block ${getStatusBadgeStyle(block.status)}`}>
                            {getStatusLabel(block.status)}
                          </span>
                        </div>
                        
                        {/* CPU 사용률 */}
                        <div className="text-[#6a7282] text-xs font-medium text-center">
                          CPU 사용률: {block.cpuUsage}%
                        </div>
                        
                        {/* 툴팁 화살표 */}
                        <div 
                          className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-2"
                          style={{
                            clipPath: 'polygon(50% 100%, 0 0, 100% 0)',
                            backgroundColor: 'white',
                          }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

