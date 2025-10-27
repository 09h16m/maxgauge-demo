'use client';

import BlockGrid from "@/components/ui/BlockGrid";
import Block3D, { BlockData } from "@/components/ui/Block3D";
import BlockStats from "@/components/ui/BlockStats";
import SidePanel from "@/components/ui/SidePanel";
import IssueMap from "@/components/ui/IssueMap";
import { useState, useEffect, useRef } from "react";

export default function MaxGaugeAIPage() {
  const [blockStats, setBlockStats] = useState({ critical: 0, warning: 0, total: 256 });
  const [blocks, setBlocks] = useState<BlockData[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<number | null>(null);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedSort, setSelectedSort] = useState('기본 설정 배열로 보기');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const sortOptions = [
    '기본 설정 배열로 보기',
    '즐겨찾기 순으로 보기',
    '그룹 별로 보기'
  ];

  const handleBlocksChange = (blocks: BlockData[]) => {
    const critical = blocks.filter(b => b.status === 'critical').length;
    const warning = blocks.filter(b => b.status === 'warning').length;
    setBlockStats({ critical, warning, total: blocks.length });
    setBlocks(blocks);
  };

  const handleBlockSelect = (blockId: number | null) => {
    setSelectedBlockId(blockId);
  };

  const handleResetCamera = () => {
    // window 객체에 저장된 리셋 함수 호출
    if ((window as any).__resetBlock3DCamera) {
      (window as any).__resetBlock3DCamera();
    }
  };

  const selectedBlock = selectedBlockId !== null ? blocks.find(b => b.id === selectedBlockId) : null;

  // Search 창 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isSearchExpanded &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsSearchExpanded(false);
      }
    };

    if (isSearchExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSearchExpanded]);

  // Dropdown 바깥 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isDropdownOpen &&
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  return (
    <div 
      className="relative w-full overflow-hidden bg-[#f3f4f6]"
      style={{
        height: 'calc(100vh - 56px)',
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
          onResetCamera={handleResetCamera}
        />
      </div>

      {/* 좌측 상단 드롭다운 셀렉트 */}
      <div className="absolute top-6 left-6 z-50" ref={dropdownRef}>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="bg-white rounded-md shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] h-8 w-[240px] flex items-center gap-2 px-2 hover:bg-gray-50 transition-colors"
          >
            <img src="/List.svg" alt="List" className="w-4 h-4" />
            <div className="flex-1 flex items-center justify-start">
              <p className="text-sm text-[#030712] leading-[1.4]">{selectedSort}</p>
            </div>
            <img src="/chevron-down.svg" alt="Chevron Down" className="w-4 h-4" />
          </button>

          {/* Dropdown 메뉴 */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 p-1 w-[240px] bg-white rounded-md shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] overflow-hidden">
              {sortOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setSelectedSort(option);
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full px-2 h-8 flex items-center text-left text-sm text-[#030712] hover:bg-gray-50 transition-colors ${
                    selectedSort === option ? 'font-medium' : 'font-normal'
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 좌측 상단 상태 표시 */}
      <div className="absolute top-22 left-6 z-10">
        <BlockStats 
          critical={blockStats.critical}
          warning={blockStats.warning}
          total={blockStats.total}
        />
      </div>

      {/* 좌측 하단 Issue Map */}
      <div className="absolute bottom-8 left-6 z-10">
        <IssueMap blocks={blocks} />
      </div>

      {/* 우측 사이드 패널 */}
      <div className="absolute top-0 right-0 bottom-0 z-10">
        <SidePanel 
          selectedBlock={selectedBlock} 
          onBack={() => setSelectedBlockId(null)}
        />
      </div>

      {/* Search 버튼과 Legend - 사이드 패널 좌측 상단 고정 */}
      <div className="absolute top-6 z-20 flex items-center gap-3" style={{ right: '448px' }}>
        {/* Search 버튼/검색창 */}
        <div 
          ref={searchContainerRef}
          className={`bg-white rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] h-8 flex items-center transition-all duration-300 overflow-hidden ${
            isSearchExpanded ? 'w-[240px]' : 'w-8'
          }`}
        >
          <button 
            onClick={() => setIsSearchExpanded(!isSearchExpanded)}
            className="flex items-center justify-center w-8 h-8 shrink-0 hover:bg-gray-50 rounded-md transition-colors cursor-pointer"
          >
            <img 
              src="/search.svg" 
              alt="Search" 
              className="w-5 h-5"
            />
          </button>
          
          {isSearchExpanded && (
            <input
              type="text"
              placeholder="인스턴스명으로 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 h-full px-2 text-sm text-[#030712] placeholder:text-[#6A7282] focus:outline-none"
              autoFocus
            />
          )}
        </div>

        {/* Legend */}
        <div className="bg-white h-8 rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] px-3 py-1.5 flex items-center gap-3">
          {/* CPU Usage */}
          <div className="flex items-center gap-1.5">
            <div 
              className="w-8 h-3 rounded-[2px]"
              style={{
                background: 'linear-gradient(-90deg, rgba(0, 188, 125, 1) 0%, rgba(116, 212, 255, 1) 43%, rgba(209, 213, 220, 1) 86%)'
              }}
            />
            <span className="text-xs font-medium text-[#1E2939]">CPU Usage</span>
          </div>

          {/* 이상 감지 중 */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-[2px] bg-[#FE9A00]" />
            <span className="text-xs font-medium text-[#1E2939]">이상 감지 중</span>
          </div>

          {/* 이상 탐지 */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-[2px] bg-[#FB2C36]" />
            <span className="text-xs font-medium text-[#1E2939]">이상 탐지</span>
          </div>
        </div>
      </div>

      {/* 3D 뷰 아이콘 버튼 - 사이드 패널 좌측 하단 고정 */}
      <div className="absolute bottom-6 z-20" style={{ right: '448px' }}>
        <button 
          onClick={handleResetCamera}
          className="bg-white flex items-center justify-center rounded-md shadow-[0px_0px_20px_0px_rgba(3,7,18,0.12)] w-8 h-8 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          <img 
            src="/logos/view-in-ar.svg" 
            alt="3D View Reset" 
            className="w-5 h-5"
          />
        </button>
      </div>
    </div>
  );
}


