'use client';

interface BlockStatsProps {
  critical: number;
  warning: number;
  total: number;
}

export default function BlockStats({ critical, warning, total }: BlockStatsProps) {
  return (
    <div className="flex flex-col gap-8">
      {/* 이상 탐지 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[#6a7282] font-medium leading-[1.4]">
          이상 탐지
        </p>
        <p className="text-[40px] text-[#fb2c36] font-medium leading-[1.1]">
          {critical}
        </p>
      </div>

      {/* 이상 감지 중 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[#6a7282] font-medium leading-[1.4]">
          이상 감지 중
        </p>
        <p className="text-[40px] text-[#fe9a00] font-medium leading-[1.1]">
          {warning}
        </p>
      </div>

      {/* 전체 */}
      <div className="flex flex-col gap-1">
        <p className="text-sm text-[#6a7282] font-medium leading-[1.4]">
          전체
        </p>
        <p className="text-[40px] text-[#6a7282] font-medium leading-[1.1]">
          {total}
        </p>
      </div>
    </div>
  );
}

