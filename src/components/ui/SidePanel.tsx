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
    <div className="flex flex-col items-end p-6 h-full">
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

