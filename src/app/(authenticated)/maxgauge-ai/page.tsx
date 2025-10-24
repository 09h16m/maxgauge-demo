'use client';

import BlockGrid from "@/components/ui/BlockGrid";
import Block3D, { BlockData } from "@/components/ui/Block3D";
import BlockStats from "@/components/ui/BlockStats";
import SidePanel from "@/components/ui/SidePanel";
import IssueMap from "@/components/ui/IssueMap";
import { useState } from "react";

export default function MaxGaugeAIPage() {
  const [blockStats, setBlockStats] = useState({ critical: 0, warning: 0, total: 256 });
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);

  const handleBlocksChange = (blocks: BlockData[]) => {
    const critical = blocks.filter(b => b.status === 'critical').length;
    const warning = blocks.filter(b => b.status === 'warning').length;
    setBlockStats({ critical, warning, total: blocks.length });
    setBlocks(blocks);
  };

  const handleBlockSelect = (blockId: number | null) => {
    setSelectedBlockId(blockId);
  };

  const selectedBlock = selectedBlockId !== null ? blocks.find(b => b.id === selectedBlockId) : null;

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#f3f4f6]"
      style={{
        height: 'calc(100vh - 64px)',
        backgroundImage: `
          url('data:image/svg+xml;utf8,<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="0.3"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(9.15 64.85 -115.29 16.267 115 -90)"><stop stop-color="rgba(116,212,255,1)" offset="0"/><stop stop-color="rgba(164,244,207,0.1)" offset="0.5"/><stop stop-color="rgba(243,244,246,0)" offset="1"/></radialGradient></defs></svg>'),
          url('data:image/svg+xml;utf8,<svg viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none"><rect x="0" y="0" height="100%" width="100%" fill="url(%23grad)" opacity="0.3"/><defs><radialGradient id="grad" gradientUnits="userSpaceOnUse" cx="0" cy="0" r="10" gradientTransform="matrix(-29.6 -65.55 116.53 -52.622 1394 1080)"><stop stop-color="rgba(164,198,255,1)" offset="0"/><stop stop-color="rgba(196,179,255,0.2)" offset="0.5"/><stop stop-color="rgba(243,244,246,0)" offset="1"/></radialGradient></defs></svg>')
        `
      }}
    >
      {/* Block3D 배경 */}
      <div className="absolute inset-0">
        <Block3D 
          onBlocksChange={handleBlocksChange} 
          onBlockSelect={handleBlockSelect}
          selectedBlockId={selectedBlockId}
        />
      </div>

      {/* 좌측 상단 상태 표시 */}
      <div className="absolute top-8 left-8 z-10">
        <BlockStats 
          critical={blockStats.critical}
          warning={blockStats.warning}
          total={blockStats.total}
        />
      </div>

      {/* 좌측 하단 Issue Map */}
      <div className="absolute bottom-8 left-8 z-10">
        <IssueMap blocks={blocks} />
      </div>

      {/* 우측 사이드 패널 */}
      <div className="absolute top-0 right-0 bottom-0 z-10">
        <SidePanel 
          selectedBlock={selectedBlock} 
          onBack={() => setSelectedBlockId(null)}
        />
      </div>
    </div>
  );
}


