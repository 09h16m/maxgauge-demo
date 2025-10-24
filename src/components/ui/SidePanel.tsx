'use client';

import SidePanelContent from './SidePanelContent';
import InstanceDetail from './InstanceDetail';
import { BlockData } from './Block3D';

interface SidePanelProps {
  selectedBlock?: BlockData | null;
  onBack?: () => void;
}

export default function SidePanel({ selectedBlock, onBack }: SidePanelProps) {
  return (
    <div className="flex flex-col gap-4 items-end p-6 h-full">
      {/* 상단 도구바 - 선택된 블록이 없을 때만 표시 */}
      {!selectedBlock && (
      <div className="flex gap-3 items-center w-full">
        {/* 3D 뷰 아이콘 버튼 */}
        <button className="bg-white flex items-center justify-center rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] w-8 h-8">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2.5L2.5 7.5V12.5L10 17.5L17.5 12.5V7.5L10 2.5Z" stroke="#1e2939" strokeWidth="1.5" strokeLinejoin="round"/>
            <path d="M10 10L2.5 7.5M10 10L17.5 7.5M10 10V17.5" stroke="#1e2939" strokeWidth="1.5" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* 회전 컨트롤 */}
        <div className="flex rounded shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] overflow-hidden">
          <button className="bg-white border-r border-[#e5e7eb] flex items-center justify-center p-2.5 w-8 h-8">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M16.25 10C16.25 13.4518 13.4518 16.25 10 16.25C6.54822 16.25 3.75 13.4518 3.75 10C3.75 6.54822 6.54822 3.75 10 3.75" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 2.5L12.5 5L10 7.5" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          <button className="bg-white flex items-center justify-center p-2.5 w-8 h-8">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3.75 10C3.75 6.54822 6.54822 3.75 10 3.75C13.4518 3.75 16.25 6.54822 16.25 10C16.25 13.4518 13.4518 16.25 10 16.25" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M10 17.5L7.5 15L10 12.5" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* 드롭다운 셀렉트 */}
        <div className="flex-1 bg-white rounded-md shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] h-8">
          <div className="flex items-center gap-0.5 h-full px-2">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M2 8H14M2 12H14" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <div className="flex-1 flex items-center justify-center px-0.5">
              <p className="text-sm text-[#030712] leading-[1.4]">등록순으로 보기</p>
            </div>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M4 6L8 10L12 6" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
      )}

      {/* 메인 패널 (투명 배경 + 블러) */}
      <div 
        className="w-[400px] flex-1 rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] overflow-hidden"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
        }}
      >
        <div className="h-full overflow-y-auto">
          {selectedBlock ? (
            <InstanceDetail block={selectedBlock} onBack={onBack} />
          ) : (
            <SidePanelContent />
          )}
        </div>
      </div>
    </div>
  );
}

