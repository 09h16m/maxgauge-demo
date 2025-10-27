'use client';

import SidePanelContent from './SidePanelContent';
import InstanceDetail from './InstanceDetail';
import { BlockData } from './Block3D';

interface SidePanelProps {
  selectedBlock?: BlockData | null;
  onBack?: () => void;
  onResetCamera?: () => void;
}

export default function SidePanel({ selectedBlock, onBack, onResetCamera }: SidePanelProps) {
  return (
    <div className="flex flex-col gap-4 items-end p-6 h-full">
      {/* 상단 도구바 - 선택된 블록이 없을 때만 표시 */}
      {!selectedBlock && (
      <div className="flex gap-3 items-center w-full">
        {/* 3D 뷰 아이콘 버튼 */}
        <button 
          onClick={onResetCamera}
          className="bg-white flex items-center justify-center rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] w-8 h-8 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <img 
            src="/logos/view-in-ar.svg" 
            alt="3D View Reset" 
            className="w-5 h-5"
          />
        </button>


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

