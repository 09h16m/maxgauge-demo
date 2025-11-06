"use client";

import ReportCard from "@/components/ui/ReportCard";
import { mockReports } from "@/data/reportData";

export default function ReportListPage() {
  return (
    <div className="flex h-[calc(100vh-56px)] w-full justify-center bg-[#F3F4F6]">
      <div className="flex h-full w-full max-w-[420px] flex-col overflow-hidden border border-[#e5e7eb] bg-white">
        <div className="px-6 py-6">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-[20px] font-semibold text-[#030712]">이상 탐지 이력</h1>
            <button className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#f3f4f6]">
              <div className="w-5 h-5 bg-[#030712] rounded" />
            </button>
          </div>

          <div className="space-y-4">
            <h2 className="text-[16px] font-semibold text-[#030712]">검색</h2>
            <div className="flex items-center gap-2 rounded-[6px] bg-[#f3f4f6] px-3 py-2">
              <div className="h-4 w-4 rounded-full bg-[#99a1af]" />
              <input
                type="text"
                placeholder="인스턴스/리포트 검색"
                className="flex-1 bg-transparent text-[14px] text-[#6a7282] outline-none placeholder:text-[#6a7282]"
              />
            </div>

            <div className="rounded-[6px] border border-[#e5e7eb] p-4">
              <div className="mb-3 text-center text-[16px] font-semibold text-[#030712]">
                October 2025
              </div>
              <div className="h-[200px] rounded-[6px] bg-[#f3f4f6]" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-[16px] font-semibold text-[#030712]">이상 탐지 이력</span>
            <span className="text-[16px] font-semibold text-[#00bcff]">{mockReports.length}</span>
          </div>

          <div className="space-y-2">
            {mockReports.map((report) => (
              <ReportCard
                key={report.id}
                id={report.id}
                server={report.server}
                time={report.time}
                metric={report.metric}
                badge={report.badge}
                variant="full"
              />
            ))}
          </div>

          <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[6px] py-2 text-[14px] font-medium text-[#1e2939] hover:bg-[#f3f4f6]">
            <span className="text-[16px]">↓</span>
            더 불러오기
          </button>
        </div>
      </div>
    </div>
  );
}



