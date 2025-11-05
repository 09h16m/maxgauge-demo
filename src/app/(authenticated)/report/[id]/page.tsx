"use client";

import { useState, useMemo, useEffect } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import ReportCard from "@/components/ui/ReportCard";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Tabs from "@/components/ui/Tabs";
import FlowDiagram from "@/components/ui/FlowDiagram";

interface ReportPageProps {
  params: {
    id: string;
  };
}

interface ReportData {
  id: number;
  server: string;
  time: string;
  metric: string;
  badge?: string | null;
}

// 샘플 데이터
const mockReports: ReportData[] = [
  { id: 1, server: "DB-SERVER-01", time: "2025-10-04 07:55", metric: "Active Session" },
  { id: 2, server: "APP-SERVER-02", time: "2025-10-03 18:21", metric: "Total Wait Time", badge: "+1" },
  { id: 3, server: "DB-SERVER-04", time: "2025-10-03 18:21", metric: "Total Wait Time" },
  { id: 4, server: "APP-SERVER-07", time: "2025-10-03 18:21", metric: "Total Wait Time" },
];

// 목차 구조 데이터 (동기화를 위한 단일 소스)
interface TocItem {
  id: string;
  label: string;
  children?: TocItem[];
}

const tableOfContents: TocItem[] = [
  {
    id: 'flow-summary',
    label: '이상 탐지 흐름 요약',
  },
  {
    id: 'total-events',
    label: 'Total Events 이상 탐지',
    children: [
      {
        id: 'top-event-1',
        label: 'Top Event #1 [enq: SQ - Contention]',
        children: [
          { id: 'top-event-1-summary', label: '이벤트 요약' },
          { id: 'top-event-1-phenomenon', label: '현상' },
          { id: 'top-event-1-cause', label: '원인' },
          { id: 'top-event-1-solution', label: '해결방안' },
        ],
      },
      {
        id: 'top-event-2',
        label: 'Top Event #2 [db file sequential read]',
        children: [
          { id: 'top-event-2-summary', label: '이벤트 요약' },
          { id: 'top-event-2-phenomenon', label: '현상' },
          { id: 'top-event-2-cause', label: '원인' },
          { id: 'top-event-2-solution', label: '해결방안' },
        ],
      },
      {
        id: 'top-event-3',
        label: 'Top Event #3 [log file sync]',
        children: [
          { id: 'top-event-3-summary', label: '이벤트 요약' },
          { id: 'top-event-3-phenomenon', label: '현상' },
          { id: 'top-event-3-cause', label: '원인' },
          { id: 'top-event-3-solution', label: '해결방안' },
        ],
      },
    ],
  },
  {
    id: 'sql-elapsed-time',
    label: 'SQL Elapsed Time 이상 탐지',
    children: [
      {
        id: 'top-sql-1',
        label: 'Top SQL #1 [SELECT COUNT(*) FROM SALES...]',
        children: [
          { id: 'top-sql-1-summary', label: '이벤트 요약' },
          { id: 'top-sql-1-phenomenon', label: '현상' },
          { id: 'top-sql-1-cause', label: '원인' },
          { id: 'top-sql-1-solution', label: '해결방안' },
        ],
      },
      {
        id: 'top-sql-2',
        label: 'Top SQL #2 [SELECT c1,c2 FROM SALES ...]',
        children: [
          { id: 'top-sql-2-summary', label: '이벤트 요약' },
          { id: 'top-sql-2-phenomenon', label: '현상' },
          { id: 'top-sql-2-cause', label: '원인' },
          { id: 'top-sql-2-solution', label: '해결방안' },
        ],
      },
      {
        id: 'top-sql-3',
        label: 'Top SQL #3 [SELECT * FROM ORDERS WHERE ...]',
        children: [
          { id: 'top-sql-3-summary', label: '이벤트 요약' },
          { id: 'top-sql-3-phenomenon', label: '현상' },
          { id: 'top-sql-3-cause', label: '원인' },
          { id: 'top-sql-3-solution', label: '해결방안' },
        ],
      },
    ],
  },
];

export default function ReportPage({ params }: ReportPageProps) {
  const [selectedReportId, setSelectedReportId] = useState<number>(
    parseInt(params.id) || mockReports[0].id
  );
  
  // 이상 탐지 흐름 요약 섹션의 뷰 모드 (다이어그램/타임라인)
  const [flowSummaryView, setFlowSummaryView] = useState<'diagram' | 'timeline'>('diagram');
  const [diagramKey, setDiagramKey] = useState(0);
  
  // Top Event #1 Tab 상태
  const [topEvent1Tab, setTopEvent1Tab] = useState<'phenomenon' | 'cause' | 'solution'>('phenomenon');

  // flowSummaryView가 'diagram'으로 변경될 때마다 애니메이션 재실행
  useEffect(() => {
    if (flowSummaryView === 'diagram') {
      setDiagramKey(Date.now());
    }
  }, [flowSummaryView]);
  
  // 2depth 섹션 접기/펼치기 상태 (기본값: 모두 닫힘)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'top-event-1': false,
    'top-event-2': false,
    'top-event-3': false,
    'top-sql-1': false,
    'top-sql-2': false,
    'top-sql-3': false,
  });

  const selectedReport = mockReports.find((r) => r.id === selectedReportId) || mockReports[0];

  // Top 3 Session 테이블 데이터
  const top3SessionData = useMemo(() => [
    { sid: 281, serial: 9123, avgCpu: 72, event: 'enq: SQ - Contention', waitTime: 12.3 },
    { sid: 514, serial: 3221, avgCpu: 65, event: 'enq: SQ - Contention', waitTime: 10.8 },
    { sid: 733, serial: 7782, avgCpu: 58, event: 'enq: SQ - Contention', waitTime: 9.4 },
  ], []);

  const top3SessionColumns: ColumnDef<typeof top3SessionData[0]>[] = useMemo(() => [
    { accessorKey: 'sid', header: 'SID', size: 160, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
    { accessorKey: 'serial', header: 'Serial#', size: 160, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
    { accessorKey: 'avgCpu', header: 'AVG CPU(%)', size: 144, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
    { accessorKey: 'event', header: 'Event', size: 200 },
    { accessorKey: 'waitTime', header: 'Wait Time(s)', size: 144, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
  ], []);

  const top3SessionTable = useReactTable({
    data: top3SessionData,
    columns: top3SessionColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Top 3 SQL 테이블 데이터
  const top3SqlData = useMemo(() => [
    { 
      sqlId: '9G1H3K6RX2VFY', 
      sqlText: 'SELECT COUNT(*) FROM EMP WHERE EMPNO=:B1 AND TYPE=:B2',
      planHash: '1357924680',
      executions: 520,
      waitTime: 69,
      elapsedTime: 5.2,
      elapsedTimePerExec: 0.01
    },
    { 
      sqlId: '4P8ZQ2M7LAK1C', 
      sqlText: 'SELECT c1,c2 FROM SALES WHERE dt BETWEEN :B1 AND :B2',
      planHash: '5678901234',
      executions: 480,
      waitTime: 18,
      elapsedTime: 3.1,
      elapsedTimePerExec: 0.006
    },
    { 
      sqlId: '6N3B7T9QW1D2E', 
      sqlText: 'SELECT * FROM ORDERS WHERE id=:B1',
      planHash: '1928374650',
      executions: 420,
      waitTime: 13,
      elapsedTime: 2.8,
      elapsedTimePerExec: 0.007
    },
  ], []);

  const top3SqlColumns: ColumnDef<typeof top3SqlData[0]>[] = useMemo(() => [
    { accessorKey: 'sqlId', header: 'SQL ID', size: 160 },
    { accessorKey: 'sqlText', header: 'SQL Text', size: 200 },
    { accessorKey: 'planHash', header: 'Plan Hash', size: 144 },
    { accessorKey: 'executions', header: 'Executions', size: 144, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
    { accessorKey: 'waitTime', header: 'Wait Time(%)', size: 144, cell: ({ getValue }) => <div className="text-center">{getValue() as number}</div> },
    { accessorKey: 'elapsedTime', header: 'Elapsed Time(s)', size: 144, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
    { accessorKey: 'elapsedTimePerExec', header: 'Elapsed Time/exec(s)', size: 160, meta: { maxWidth: 160 }, cell: ({ getValue }) => <div className="text-right">{getValue() as number}</div> },
  ], []);

  const top3SqlTable = useReactTable({
    data: top3SqlData,
    columns: top3SqlColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  // Accordion 동작: 같은 그룹(1depth) 내에서 하나만 펼치기
  const toggleSection = (sectionId: string) => {
    const eventSections = ['top-event-1', 'top-event-2', 'top-event-3'];
    const sqlSections = ['top-sql-1', 'top-sql-2', 'top-sql-3'];
    
    setExpandedSections(prev => {
      const newState = { ...prev };
      
      // 같은 그룹의 섹션들 찾기
      const group = eventSections.includes(sectionId) ? eventSections : sqlSections;
      
      // 같은 그룹의 다른 섹션들 닫기
      group.forEach(id => {
        if (id !== sectionId) {
          newState[id] = false;
        }
      });
      
      // 선택된 섹션 토글
      newState[sectionId] = !prev[sectionId];
      
      return newState;
    });
  };

  // 목차 클릭 시 해당 섹션으로 스크롤
  const scrollToSection = (sectionId: string) => {
    const contentArea = document.getElementById('report-content-area');
    const element = document.getElementById(sectionId);
    
    if (contentArea && element) {
      // 컨테이너 기준으로 요소의 상대 위치 계산
      const containerRect = contentArea.getBoundingClientRect();
      const elementRect = element.getBoundingClientRect();
      
      // 현재 스크롤 위치 + 요소의 상대 위치
      const scrollTop = contentArea.scrollTop;
      const elementTop = elementRect.top - containerRect.top + scrollTop;
      
      // 부드럽게 스크롤
      contentArea.scrollTo({
        top: elementTop - 20, // 상단 여백 20px
        behavior: 'smooth'
      });
    }
  };

  // 목차 항목 렌더링 (재귀적) - 3depth는 숨김
  const renderTocItem = (item: TocItem, depth: number = 0) => {
    // 3depth (depth >= 2)는 목차에서 숨김
    if (depth >= 2) {
      return null;
    }

    const paddingClasses = depth === 0 
      ? 'px-[8px]' 
      : depth === 1 
      ? 'pl-[24px] pr-[8px]' 
      : 'pl-[40px] pr-[8px]';

    return (
      <div key={item.id}>
        <button 
          onClick={() => scrollToSection(item.id)}
          className={`${paddingClasses} py-[6px] rounded-[4px] text-left hover:bg-white/50 transition-colors cursor-pointer w-full`}
        >
          <p className="text-[14px] text-[#6a7282] leading-[1.4] overflow-hidden text-ellipsis whitespace-nowrap">
            {item.label}
          </p>
        </button>
        {item.children && depth < 1 && item.children.map((child) => renderTocItem(child, depth + 1))}
      </div>
    );
  };

  return (
    <div className="flex h-[calc(100vh-56px)] w-full">
      {/* Left Side Panel - Report List */}
      <div className="w-[320px] bg-white border-r border-[#e5e7eb] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] font-semibold text-[#030712]">
              이상 탐지 이력
            </h2>
            <button className="w-8 h-8 flex items-center justify-center rounded-[6px] hover:bg-[#f3f4f6]">
              {/* Sidebar toggle icon placeholder */}
              <div className="w-5 h-5 bg-[#030712] rounded"></div>
            </button>
          </div>

          {/* Search Section */}
          <div className="space-y-4">
            <h3 className="text-[16px] font-semibold text-[#030712]">검색</h3>

            {/* Search Input */}
            <div className="bg-[#f3f4f6] rounded-[6px] px-3 py-2 flex items-center gap-2">
              <div className="w-4 h-4 bg-[#99a1af] rounded-full"></div>
              <input
                type="text"
                placeholder="인스턴스/리포트 검색"
                className="flex-1 bg-transparent text-[14px] text-[#6a7282] outline-none placeholder:text-[#6a7282]"
              />
            </div>

            {/* Calendar Placeholder */}
            <div className="border border-[#e5e7eb] rounded-[6px] p-4">
              <div className="text-center text-[16px] font-semibold text-[#030712] mb-3">
                October 2025
              </div>
              <div className="bg-[#f3f4f6] h-[200px] rounded-[6px]"></div>
            </div>
          </div>
        </div>

        {/* Report List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-[16px] font-semibold text-[#030712]">
              이상 탐지 이력
            </span>
            <span className="text-[16px] font-semibold text-[#00bcff]">
              {mockReports.length}
            </span>
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
                selected={report.id === selectedReportId}
                variant="full"
                onClick={() => setSelectedReportId(report.id)}
              />
            ))}
          </div>

          {/* Load More Button */}
          <button className="w-full mt-4 py-2 text-[14px] font-medium text-[#1e2939] hover:bg-[#f3f4f6] rounded-[6px] flex items-center justify-center gap-2">
            <span className="text-[16px]">↓</span>
            더 불러오기
          </button>
        </div>
      </div>

      {/* Right Container - Report Content */}
      <div className="flex flex-col flex-1 bg-gray-100 overflow-hidden">
          {/* Report Header */}
          <div className="flex items-baseline gap-3 px-6 pt-6 pb-4 bg-[#f3f4f6] flex-shrink-0">
              <h1 className="text-[20px] font-semibold text-[#030712]">
                {selectedReport.server} 이상 탐지 보고서
              </h1>
              <span className="text-[14px] text-[#6a7282]">
                {selectedReport.time}
              </span>
          </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Report Content Area */}
          <div className="flex-1 overflow-y-auto" id="report-content-area">
            {/* Report Content Cards */}
            <div className="pt-4 pb-6 pr-4 pl-6 space-y-4">
              {/* 1Depth Section: 이상 탐지 흐름 요약 */}
              <section id="flow-summary" className="bg-white rounded-[8px] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[18px] font-semibold text-[#030712]">
                    이상 탐지 흐름 요약
                  </h2>
                  <SegmentedControl
                    options={[
                      { value: 'diagram', label: '다이어그램' },
                      { value: 'timeline', label: '타임라인' },
                    ]}
                    value={flowSummaryView}
                    onChange={(value) => setFlowSummaryView(value as 'diagram' | 'timeline')}
                  />
                </div>
                {flowSummaryView === 'diagram' ? (
                  <div className="bg-[#f3f4f6] h-[400px] rounded-[6px] overflow-hidden">
                    <FlowDiagram key={diagramKey} />
                  </div>
                ) : (
                  <div className="bg-[#f3f4f6] h-[400px] rounded-[6px] flex items-center justify-center text-[#6a7282]">
                    타임라인 영역
                  </div>
                )}
              </section>

              {/* 1Depth Section: Total Events 이상탐지 */}
              <section id="total-events" className="bg-white rounded-[8px] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-[18px] font-semibold text-[#030712]">
                    Total Events 이상탐지
                  </h2>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] text-[#6a7282] leading-[1.4]">
                      * 분석 리포트는 민감도(Sensitivity) 설정에 따라 생성 주기와 발생 가능성이 조정됩니다.
                    </span>
                    <button className="h-6 px-1 bg-[#f3f4f6] rounded-[6px] flex items-center justify-center gap-[10px] text-[12px] font-medium text-[#1e2939] hover:bg-[#e5e7eb] transition-colors">
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 11.5C9.933 11.5 11.5 9.933 11.5 8C11.5 6.067 9.933 4.5 8 4.5C6.067 4.5 4.5 6.067 4.5 8C4.5 9.933 6.067 11.5 8 11.5Z" stroke="#1E2939" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M8 2V4.5M8 11.5V14M14 8H11.5M4.5 8H2M12.5 3.5L10.5 5.5M5.5 10.5L3.5 12.5M12.5 12.5L10.5 10.5M5.5 5.5L3.5 3.5" stroke="#1E2939" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span className="px-0.5">민감도 변경</span>
                    </button>
                  </div>
                </div>

                {/* Summary Box */}
                <div className="bg-[#f3f4f6] rounded-[6px] p-4 space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-24 flex items-center">
                      <span className="text-[14px] font-semibold text-[#030712]">
                        발생 시각
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] text-[#1e2939]">08:40경,</span>
                      <span className="text-[14px] font-semibold text-[#030712]">Total Events</span>
                      <span className="text-[14px] text-[#1e2939]">가 평소 대비</span>
                      <span className="text-[14px] font-semibold text-[#155dfc]">13초(76%) 증가</span>
                      <span className="text-[14px] text-[#1e2939]">가 확인되었습니다.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 flex items-center">
                      <span className="text-[14px] font-semibold text-[#030712]">
                        Event 영향도
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] text-[#1e2939]">전체</span>
                      <span className="text-[14px] font-semibold text-[#030712]">Wait Time</span>
                      <span className="text-[14px] text-[#1e2939]">중 증감률이 큰 Top 3 Event가</span>
                      <span className="text-[14px] font-semibold text-[#155dfc]">88% 점유</span>
                      <span className="text-[14px] text-[#1e2939]">하고 있습니다.</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 flex items-center">
                      <span className="text-[14px] font-semibold text-[#030712]">
                        Event 분석
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-[14px] font-semibold text-[#030712]">enq: SQ - Contention</span>
                      <span className="text-[14px] text-[#1e2939]">가 분 평균</span>
                      <span className="text-[14px] font-semibold text-[#155dfc]">32개의 세션</span>
                      <span className="text-[14px] text-[#1e2939]">을 대기하고 있습니다.</span>
                    </div>
                  </div>
                </div>

                {/* 2Depth: Top Event #1 */}
                <div id="top-event-1" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-event-1')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-event-1'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-event-1'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top Event #1</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [enq: SQ - Contention]
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#dcfce7] text-[12px] font-medium text-[#00a63e] px-2 py-1 rounded-[6px]">
                      영향도 1.2%
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-event-1'] && (
                    <div className="space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-event-1-summary" className="px-6 pt-6 space-y-4">
                        <h3 className="text-[18px] font-medium text-[#030712]">요약</h3>
                        <div className="space-y-3">
                          {/* 정의 카드 */}
                          <div className="h-[80px] flex items-stretch border border-[#e5e7eb] rounded-[6px] bg-white">
                            <div className="w-[120px] bg-[#DFF2FE] flex items-center justify-center py-2 px-2">
                              <span className="text-[16px] font-semibold text-[#030712]">정의</span>
                            </div>
                            <div className="flex-1 py-4 px-6 space-y-2">
                              <div className="text-[14px] text-[#1E2939] leading-[1.4]">
                                동일 시퀀스 값 동시 요청 시 <span className="font-semibold text-[#155DFC]">Enqueue(SQ)</span> 획득 지연 시 발생하는 대기 이벤트 입니다.
                              </div>
                              <div className="text-[14px] text-[#1E2939] leading-[1.4]">
                                RAC의 경우 ORDER 또는 작은 CACHE 설정은 경합을 유발시킬 수 있습니다.
                              </div>
                            </div>
                          </div>

                          {/* 현상 카드 */}
                          <div className="h-[80px] flex items-stretch border border-[#e5e7eb] rounded-[6px] bg-white">
                            <div className="w-[120px] bg-[#EDE9FE] flex items-center justify-center py-2 px-2">
                              <span className="text-[16px] font-semibold text-[#030712]">현상</span>
                            </div>
                            <div className="flex-1 py-4 px-6 flex items-center">
                              <div className="text-[14px] text-[#1E2939] leading-[1.4]">
                                분 평균 대기 세션 <span className="font-semibold text-[#155DFC]">32개</span>, 분 당 <span className="font-semibold text-[#155DFC]">323회</span> 발생하였습니다.
                              </div>
                            </div>
                          </div>

                          {/* 해결 방안 카드 */}
                          <div className="h-[80px] flex items-stretch border border-[#e5e7eb] rounded-[6px] bg-white">
                            <div className="w-[120px] bg-[#FCE7F3] flex items-center justify-center py-2 px-2">
                              <span className="text-[16px] font-semibold text-[#030712]">해결 방안</span>
                            </div>
                            <div className="flex-1 py-4 px-6 space-y-2">
                              <div className="text-[14px] text-[#1E2939] leading-[1.4]">
                                <span className="font-semibold text-[#155DFC]">시퀀스 캐시 사용/확대</span>, <span className="font-semibold text-[#155DFC]">(RAC) 순서 보장 해제</span>, <span className="font-semibold text-[#155DFC]">정상적인 호출 횟수 검토(최근 1주일 추이)</span> 확인을 추천드리며,
                              </div>
                              <div className="text-[14px] text-[#1E2939] leading-[1.4]">
                                자세한 내용은 <span className="font-semibold text-[#030712]">해결 방안</span> 탭을 참조하시기 바랍니다.
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tab 영역: 현상/원인/해결방안 */}
                      <div className="px-6 pb-6">
                        <Tabs
                          tabs={[
                            {
                              value: 'phenomenon',
                              label: '현상',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M2 4H14M2 8H14M2 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              ),
                            },
                            {
                              value: 'cause',
                              label: '원인',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M8 2L10 6L14 7L11 10L11.5 14L8 12L4.5 14L5 10L2 7L6 6L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ),
                            },
                            {
                              value: 'solution',
                              label: '해결방안',
                              icon: (
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                  <path d="M8 2L9.5 5.5L13.5 6L10.5 8.5L11.5 12.5L8 10.5L4.5 12.5L5.5 8.5L2.5 6L6.5 5.5L8 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              ),
                            },
                          ]}
                          value={topEvent1Tab}
                          onChange={(value) => setTopEvent1Tab(value as 'phenomenon' | 'cause' | 'solution')}
                        />
                        
                        {/* Tab 컨텐츠 */}
                        <div className="mt-4">
                          {topEvent1Tab === 'phenomenon' && (
                            <div id="top-event-1-phenomenon" className="pt-3 space-y-8">
                              {/* Top 3 Session 테이블 */}
                              <div className="space-y-3">
                                <h4 className="text-[16px] font-semibold text-[#030712]">Top 3 Session</h4>
                                <div className="bg-white border border-[#d1d5dc] rounded-[6px] overflow-hidden">
                                  <table className="w-full" style={{ tableLayout: 'fixed' }}>
                                    <thead>
                                      {top3SessionTable.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                          {headerGroup.headers.map((header, headerIndex, headers) => {
                                            const maxWidth = (header.column.columnDef.meta as any)?.maxWidth;
                                            const columnSize = header.getSize();
                                            const width = maxWidth ? `${maxWidth}px` : `${columnSize}px`;
                                            return (
                                              <th
                                                key={header.id}
                                                className={`bg-[#f3f4f6] border-b border-[#e5e7eb] ${headerIndex !== headers.length - 1 ? 'border-r border-[#e5e7eb]' : ''} px-3 py-3 text-[14px] font-semibold text-[#030712] text-center`}
                                                style={{ width: width }}
                                              >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                              </th>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </thead>
                                    <tbody>
                                      {top3SessionTable.getRowModel().rows.map((row, index, rows) => (
                                        <tr 
                                          key={row.id} 
                                          className={`${index !== rows.length - 1 ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb]`}
                                        >
                                          {row.getVisibleCells().map((cell, cellIndex, cells) => (
                                            <td
                                              key={cell.id}
                                              className={`px-3 py-3 text-[14px] text-[#030712] bg-white ${cellIndex !== cells.length - 1 ? 'border-r border-[#e5e7eb]' : ''}`}
                                            >
                                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>

                              {/* Top 3 SQL 테이블 */}
                              <div className="space-y-3">
                                <h4 className="text-[16px] font-semibold text-[#030712]">Top 3 SQL</h4>
                                <div className="bg-white border border-[#d1d5dc] rounded-[6px] overflow-hidden">
                                  <table className="w-full" style={{ tableLayout: 'fixed' }}>
                                    <thead>
                                      {top3SqlTable.getHeaderGroups().map((headerGroup) => (
                                        <tr key={headerGroup.id}>
                                          {headerGroup.headers.map((header, headerIndex, headers) => {
                                            const maxWidth = (header.column.columnDef.meta as any)?.maxWidth;
                                            const columnSize = header.getSize();
                                            const width = maxWidth ? `${maxWidth}px` : `${columnSize}px`;
                                            return (
                                              <th
                                                key={header.id}
                                                className={`bg-[#f3f4f6] border-b border-[#e5e7eb] ${headerIndex !== headers.length - 1 ? 'border-r border-[#e5e7eb]' : ''} px-3 py-3 text-[14px] font-semibold text-[#030712] text-center`}
                                                style={{ width: width }}
                                              >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                              </th>
                                            );
                                          })}
                                        </tr>
                                      ))}
                                    </thead>
                                    <tbody>
                                      {top3SqlTable.getRowModel().rows.map((row, index, rows) => (
                                        <tr 
                                          key={row.id} 
                                          className={`${index !== rows.length - 1 ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb]`}
                                        >
                                          {row.getVisibleCells().map((cell, cellIndex, cells) => (
                                            <td
                                              key={cell.id}
                                              className={`px-3 py-3 text-[14px] text-[#030712] bg-white ${cellIndex !== cells.length - 1 ? 'border-r border-[#e5e7eb]' : ''}`}
                                            >
                                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                          {topEvent1Tab === 'cause' && (
                            <div id="top-event-1-cause" className="p-6 flex items-center justify-center text-[#6a7282] min-h-[200px]">
                              원인 내용 영역
                            </div>
                          )}
                          {topEvent1Tab === 'solution' && (
                            <div id="top-event-1-solution" className="p-6 flex items-center justify-center text-[#6a7282] min-h-[200px]">
                              해결방안 내용 영역
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2Depth: Top Event #2 */}
                <div id="top-event-2" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-event-2')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-event-2'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-event-2'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top Event #2</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [db file sequential read]
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#dcfce7] text-[12px] font-medium text-[#00a63e] px-2 py-1 rounded-[6px]">
                      영향도 0.8%
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-event-2'] && (
                    <div className="p-6 space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-event-2-summary" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">이벤트 요약</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          이벤트 요약 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 현상 */}
                      <div id="top-event-2-phenomenon" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">현상</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          현상 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 원인 */}
                      <div id="top-event-2-cause" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">원인</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          원인 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 해결방안 */}
                      <div id="top-event-2-solution" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">해결방안</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          해결방안 내용 영역
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2Depth: Top Event #3 */}
                <div id="top-event-3" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-event-3')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-event-3'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-event-3'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top Event #3</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [log file sync]
                        </span>
                      </div>
                    </div>
                    <div className="bg-[#dcfce7] text-[12px] font-medium text-[#00a63e] px-2 py-1 rounded-[6px]">
                      영향도 0.5%
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-event-3'] && (
                    <div className="p-6 space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-event-3-summary" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">이벤트 요약</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          이벤트 요약 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 현상 */}
                      <div id="top-event-3-phenomenon" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">현상</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          현상 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 원인 */}
                      <div id="top-event-3-cause" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">원인</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          원인 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 해결방안 */}
                      <div id="top-event-3-solution" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">해결방안</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          해결방안 내용 영역
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>

              {/* 1Depth Section: SQL Elapsed Time 이상 탐지 */}
              <section id="sql-elapsed-time" className="bg-white rounded-[8px] p-6 space-y-6">
                <h2 className="text-[18px] font-semibold text-[#030712]">
                  SQL Elapsed Time 이상 탐지
                </h2>
                <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[150px] flex items-center justify-center text-[#6a7282]">
                  SQL Elapsed Time 요약 내용 영역
                </div>

                {/* 2Depth: Top SQL #1 */}
                <div id="top-sql-1" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-sql-1')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-sql-1'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-sql-1'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top SQL #1</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [SELECT COUNT(*) FROM SALES...]
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-sql-1'] && (
                    <div className="p-6 space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-sql-1-summary" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">이벤트 요약</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          이벤트 요약 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 현상 */}
                      <div id="top-sql-1-phenomenon" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">현상</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          현상 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 원인 */}
                      <div id="top-sql-1-cause" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">원인</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          원인 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 해결방안 */}
                      <div id="top-sql-1-solution" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">해결방안</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          해결방안 내용 영역
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2Depth: Top SQL #2 */}
                <div id="top-sql-2" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-sql-2')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-sql-2'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-sql-2'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top SQL #2</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [SELECT c1,c2 FROM SALES ...]
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-sql-2'] && (
                    <div className="p-6 space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-sql-2-summary" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">이벤트 요약</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          이벤트 요약 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 현상 */}
                      <div id="top-sql-2-phenomenon" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">현상</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          현상 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 원인 */}
                      <div id="top-sql-2-cause" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">원인</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          원인 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 해결방안 */}
                      <div id="top-sql-2-solution" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">해결방안</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          해결방안 내용 영역
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 2Depth: Top SQL #3 */}
                <div id="top-sql-3" className="border border-[#e5e7eb] rounded-[6px] overflow-hidden">
                  {/* 헤더 - 클릭 가능 */}
                  <button
                    onClick={() => toggleSection('top-sql-3')}
                    className={`w-full flex items-center justify-between px-[16px] py-[12px] ${expandedSections['top-sql-3'] ? 'border-b border-[#e5e7eb]' : ''} hover:bg-[#f9fafb] transition-colors`}
                  >
                    <div className="flex items-center gap-[8px]">
                      <div className="w-8 h-8 flex items-center justify-center rounded-[6px]">
                        <svg 
                          width="20" 
                          height="20" 
                          viewBox="0 0 20 20" 
                          fill="none"
                          className={`transition-transform ${expandedSections['top-sql-3'] ? 'rotate-180' : ''}`}
                        >
                          <path 
                            d="M5 7.5L10 12.5L15 7.5" 
                            stroke="#1e2939" 
                            strokeWidth="1.5" 
                            strokeLinecap="round" 
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div className="flex items-center gap-[8px]">
                        <span className="text-[16px] text-[#1e2939]">Top SQL #3</span>
                        <span className="text-[16px] font-semibold text-[#00a6f4]">
                          [SELECT * FROM ORDERS WHERE ...]
                        </span>
                      </div>
                    </div>
                  </button>

                  {/* 내용 - 조건부 렌더링 */}
                  {expandedSections['top-sql-3'] && (
                    <div className="p-6 space-y-6">
                      {/* 3Depth: 이벤트 요약 */}
                      <div id="top-sql-3-summary" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">이벤트 요약</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          이벤트 요약 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 현상 */}
                      <div id="top-sql-3-phenomenon" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">현상</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          현상 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 원인 */}
                      <div id="top-sql-3-cause" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">원인</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          원인 내용 영역
                        </div>
                      </div>

                      {/* 3Depth: 해결방안 */}
                      <div id="top-sql-3-solution" className="space-y-3">
                        <h3 className="text-[16px] font-semibold text-[#030712]">해결방안</h3>
                        <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[100px] flex items-center justify-center text-[#6a7282]">
                          해결방안 내용 영역
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>

           {/* Right Index/TOC - Fixed */}
           <div className="w-[240px] pt-[12px] pb-[24px] pl-[12px] pr-[24px] overflow-y-auto">
             <div className="flex flex-col gap-[4px] sticky top-0">
               {tableOfContents.map((item) => renderTocItem(item))}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}

