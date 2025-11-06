'use client';

import { useRouter } from 'next/navigation';

interface ReportCardProps {
  id: number;
  server: string;
  time: string;
  metric?: string;
  badge?: string | null;
  selected?: boolean;
  variant?: 'full' | 'simplified';
  onClick?: () => void;
}

export default function ReportCard({ 
  id, 
  server, 
  time, 
  metric, 
  badge, 
  selected = false,
  variant = 'full',
  onClick
}: ReportCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
    router.push(`/report/${id}`);
    }
  };

  // Full version (default)
  if (variant === 'full') {
    return (
      <div
        onClick={handleClick}
        className={`rounded-md overflow-hidden hover:shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] transition cursor-pointer px-4 py-3 ${
          selected 
            ? 'border-[1.5px] border-transparent' 
            : 'border border-gray-200 hover:border-gray-300'
        }`}
        style={selected ? {
          background: 'linear-gradient(white, white) padding-box, linear-gradient(135deg, rgba(0, 188, 255, 1) 0%, rgba(142, 81, 255, 1) 100%) border-box'
        } : { background: 'white' }}
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <img 
                src="/logos/oracle-logo.svg" 
                alt="Oracle" 
                className="w-4 h-4"
              />
              <span className="text-sm font-semibold text-[#030712]">{server}</span>
            </div>
            <div className="flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <circle cx="6" cy="6" r="5" stroke="#6a7282" strokeWidth="1"/>
                <path d="M6 3V6H9" stroke="#6a7282" strokeWidth="1"/>
              </svg>
              <span className="text-[11px] text-[#6a7282]">{time}</span>
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-xs text-[#6a7282]">최초 이상 감지</span>
            <div className="flex items-center gap-1">
              <span className="text-sm text-[#1e2939]">{metric}</span>
              {badge && (
                <span className="bg-[#e5e7eb] rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-medium text-[#1e2939]">
                  {badge}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Simplified version
  return (
    <div
      onClick={handleClick}
      className="rounded-md hover:shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] transition cursor-pointer px-4 py-3 border border-gray-200 hover:border-gray-300 bg-white"
    >
      <div className="flex flex-col gap-1">
        {/* 인스턴스 로고 + 인스턴스명 */}
        <div className="flex items-center gap-2">
          <img 
            src="/logos/oracle-logo.svg" 
            alt="Oracle" 
            className="w-4 h-4"
          />
          <span className="text-sm font-medium text-[#1E2939]">{server}</span>
        </div>
        
        {/* 시간 아이콘 + 발행연월일 */}
        <div className="flex items-center gap-1">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#6a7282" strokeWidth="1"/>
            <path d="M6 3V6H9" stroke="#6a7282" strokeWidth="1"/>
          </svg>
          <span className="text-xs text-[#6A7282]">{time}</span>
        </div>
      </div>
    </div>
  );
}

