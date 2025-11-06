"use client";

import { useState, useMemo, useEffect, use, useCallback } from "react";
import { useReactTable, getCoreRowModel, flexRender, ColumnDef } from "@tanstack/react-table";
import SegmentedControl from "@/components/ui/SegmentedControl";
import Tabs from "@/components/ui/Tabs";
import FlowDiagram from "@/components/ui/FlowDiagram";
import FlowTimeline from "@/components/ui/FlowTimeline";
import ReactECharts from 'echarts-for-react';
import FadeInUp from "@/components/reveal/FadeInUp";
import { motion } from "framer-motion";
import TypingText from "@/components/ui/typing-text";
import { mockReports, ReportData } from "@/data/reportData";
import ReportCard from "@/components/ui/ReportCard";
import ReportCalendar from "@/components/ui/ReportCalendar";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

interface ReportPageProps {
  params: Promise<{
    id: string;
  }>;
}

// 차트 옵션 생성 함수 (InstanceDetail과 동일한 스타일)
const getAreaChartOption = (data: number[], times: string[], color = '#00BCFF') => {
  return {
    grid: {
      left: 0,
      right: 0,
      top: 10,
      bottom: 0,
      containLabel: false,
    },
    xAxis: {
      type: 'category',
      data: times,
      show: false,
      boundaryGap: false,
    },
    yAxis: {
      type: 'value',
      show: false,
      min: 0,
      max: 100,
    },
    series: [
      {
        data: data,
        type: 'line',
        smooth: 0.1,
        symbol: 'none',
        lineStyle: {
          color: color,
          width: 1.5,
        },
        itemStyle: {
          color: color,
        },
        areaStyle: {
          color: '#38bdf820', // Sky-400 with 20% opacity
        },
      },
    ],
    animation: true,
    animationDuration: 2000,
    animationDurationUpdate: 2000, // 데이터 변경 시에도 애니메이션 재생
    animationEasing: 'cubicOut',
    animationDelay: (idx: number) => idx * 30, // 각 데이터 포인트마다 30ms씩 딜레이
  };
};

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
  const { id } = use(params);
  const parsedId = Number(id);
  const reportId = Number.isNaN(parsedId) ? id : String(parsedId);
  const report = mockReports.find((r) => r.id === reportId || r.server === reportId) ?? {
    id: String(reportId ?? "unknown"),
    server: String(reportId ?? "Unknown Instance"),
    time: new Date().toISOString().replace('T', ' ').slice(0, 16),
    metric: "Active Session",
  };

  if (!report) {
    return (
      <div className="flex h-[calc(100vh-56px)] w-full items-center justify-center bg-[#F3F4F6]">
        <p className="text-sm text-[#6a7282]">리포트를 찾을 수 없습니다.</p>
      </div>
    );
  }

  const reportIdentifier = report.id || report.server;

  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const getSeedFromString = (value: string) => {
    let hash = 0;
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash << 5) - hash + value.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) + 1;
  };

  const reportSeed = getSeedFromString(reportIdentifier);
  
  // 사이드 패널 표시 상태
  const [isSidePanelOpen, setIsSidePanelOpen] = useState(true);

  // 날짜 필터 상태 (URL 쿼리와 동기화)
  const [selectedFilterDate, setSelectedFilterDateState] = useState<string | null>(searchParams.get('date'));

  useEffect(() => {
    setSelectedFilterDateState(searchParams.get('date'));
  }, [searchParams]);

  const handleFilterDateChange = useCallback((date: string | null) => {
    setSelectedFilterDateState(date);
    const params = new URLSearchParams(searchParams.toString());
    if (date) {
      params.set('date', date);
    } else {
      params.delete('date');
    }

    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  const handleReportNavigation = useCallback((targetId: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedFilterDate) {
      params.set('date', selectedFilterDate);
    } else {
      params.delete('date');
    }

    const query = params.toString();
    const destination = `/report/${encodeURIComponent(targetId)}` + (query ? `?${query}` : '');
    router.push(destination);
  }, [router, searchParams, selectedFilterDate]);

  // 이상 탐지 흐름 요약 섹션의 뷰 모드 (다이어그램/타임라인)
  const [flowSummaryView, setFlowSummaryView] = useState<'diagram' | 'timeline'>('diagram');
  const [diagramKey, setDiagramKey] = useState(0);
  
  // Top Event #1 Tab 상태
  const [topEvent1Tab, setTopEvent1Tab] = useState<'phenomenon' | 'cause' | 'solution'>('phenomenon');

  // 리포트 날짜 목록 생성 (달력에서 빨간 점 표시용)
  const reportDates = useMemo(() => {
    return mockReports.map(report => report.time);
  }, []);

  // 날짜별로 필터링된 리포트 목록
  const filteredReports = useMemo(() => {
    if (!selectedFilterDate) {
      return mockReports;
    }
    return mockReports.filter(report => {
      const [reportDate] = report.time.split(' ');
      return reportDate === selectedFilterDate;
    });
  }, [selectedFilterDate]);

  // flowSummaryView가 'diagram'으로 변경될 때마다 애니메이션 재실행
  useEffect(() => {
    if (flowSummaryView === 'diagram') {
      setDiagramKey(Date.now());
    }
  }, [flowSummaryView]);
  
  // 리포트가 변경될 때 확장된 섹션과 탭 상태 초기화 및 다이어그램 재생성
  useEffect(() => {
    setExpandedSections({
      'top-event-1': false,
      'top-event-2': false,
      'top-event-3': false,
      'top-sql-1': false,
      'top-sql-2': false,
      'top-sql-3': false,
    });
    setTopEvent1Tab('phenomenon');
    setFlowSummaryView('diagram');
    // 리포트가 변경되면 다이어그램도 다시 그리기
    setDiagramKey(Date.now());
    // 리포트 변경 시 콘텐츠 영역을 맨 위로 스크롤
    const contentArea = document.getElementById('report-content-area');
    if (contentArea) {
      contentArea.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [reportIdentifier]);
  
  // 2depth 섹션 접기/펼치기 상태 (기본값: 모두 닫힘)
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'top-event-1': false,
    'top-event-2': false,
    'top-event-3': false,
    'top-sql-1': false,
    'top-sql-2': false,
    'top-sql-3': false,
  });

  // 리포트 ID를 시드로 사용하여 일관된 랜덤 데이터 생성
  const getSeededRandom = (seed: number) => {
    let value = seed;
    return () => {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  };

  // 차트 데이터 생성 (리포트 ID에 따라 다른 데이터)
  const chartTimes = useMemo(() => {
    const times: string[] = [];
    for (let i = 23; i >= 0; i--) {
      const hour = String(Math.floor(i / 2)).padStart(2, '0');
      const minute = i % 2 === 0 ? '00' : '30';
      times.push(`${hour}:${minute}`);
    }
    return times;
  }, []);

  const waitCountData = useMemo(() => {
    const random = getSeededRandom(reportSeed * 100);
    return Array.from({ length: 24 }, () => Math.floor(random() * 50) + 20);
  }, [reportSeed]);

  const avgWaitingSessionData = useMemo(() => {
    const random = getSeededRandom(reportSeed * 200);
    return Array.from({ length: 24 }, () => Math.floor(random() * 40) + 15);
  }, [reportSeed]);

  const avgWaitTimeData = useMemo(() => {
    const random = getSeededRandom(reportSeed * 300);
    return Array.from({ length: 24 }, () => Math.floor(random() * 20) + 5);
  }, [reportSeed]);

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

  // Top 3 SQL 테이블 데이터 (리포트 ID에 따라 다른 데이터)
  const top3SqlData = useMemo(() => {
    const random = getSeededRandom(reportSeed * 500);
    const sqlIds = [
      `9G${reportSeed}H3K6RX2VFY`,
      `4P${reportSeed}ZQ2M7LAK1C`,
      `6N${reportSeed}B7T9QW1D2E`
    ];
    const sqlTexts = [
      'SELECT COUNT(*) FROM EMP WHERE EMPNO=:B1 AND TYPE=:B2',
      'SELECT c1,c2 FROM SALES WHERE dt BETWEEN :B1 AND :B2',
      'SELECT * FROM ORDERS WHERE id=:B1'
    ];
    const planHashes = [
      `13579${reportSeed}4680`,
      `56789${reportSeed}1234`,
      `19283${reportSeed}4650`
    ];
    
    return [
      { 
        sqlId: sqlIds[0], 
        sqlText: sqlTexts[0],
        planHash: planHashes[0],
        executions: 500 + Math.floor(random() * 100),
        waitTime: 60 + Math.floor(random() * 20),
        elapsedTime: 4.5 + random() * 2,
        elapsedTimePerExec: 0.008 + random() * 0.005
      },
      { 
        sqlId: sqlIds[1], 
        sqlText: sqlTexts[1],
        planHash: planHashes[1],
        executions: 450 + Math.floor(random() * 100),
        waitTime: 50 + Math.floor(random() * 20),
        elapsedTime: 3.5 + random() * 2,
        elapsedTimePerExec: 0.005 + random() * 0.005
      },
      { 
        sqlId: sqlIds[2], 
        sqlText: sqlTexts[2],
        planHash: planHashes[2],
        executions: 400 + Math.floor(random() * 100),
        waitTime: 40 + Math.floor(random() * 20),
        elapsedTime: 2.5 + random() * 2,
        elapsedTimePerExec: 0.006 + random() * 0.004
      },
    ];
  }, [reportSeed]);

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
    // 2depth 메뉴 항목이면 아코디언 펼치기
    const eventSections = ['top-event-1', 'top-event-2', 'top-event-3'];
    const sqlSections = ['top-sql-1', 'top-sql-2', 'top-sql-3'];
    const accordionSections = [...eventSections, ...sqlSections];
    
    if (accordionSections.includes(sectionId)) {
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
        
        // 선택된 섹션 열기
        newState[sectionId] = true;
        
        return newState;
      });
    }
    
    const contentArea = document.getElementById('report-content-area');
    const element = document.getElementById(sectionId);
    
    if (contentArea && element) {
      // 아코디언이 펼쳐지는 시간을 고려하여 약간의 딜레이 추가
      setTimeout(() => {
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
      }, accordionSections.includes(sectionId) ? 100 : 0);
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
    <div className="flex h-[calc(100vh-56px)] w-full bg-[#F3F4F6]">
        {/* Left Side Panel */}
        <motion.div
          initial={false}
          animate={{
            width: isSidePanelOpen ? 360 : 0,
            opacity: isSidePanelOpen ? 1 : 0,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.46, 0.45, 0.94],
          }}
          className="bg-white border-r border-[#e5e7eb] flex flex-col overflow-hidden flex-shrink-0"
        >
          {isSidePanelOpen && (
            <>
              {/* Panel Header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 flex-shrink-0">
                <h2 className="text-[20px] font-semibold text-[#030712]">이상 탐지 이력</h2>
                <button 
                  onClick={() => setIsSidePanelOpen(false)}
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center hover:bg-[#f3f4f6] transition-colors"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.25 18.5H20V5.5H9.25V18.5ZM4 18.5H7.25V5.5H4V18.5ZM22 18.75C22 19.7165 21.2165 20.5 20.25 20.5H3.75C2.7835 20.5 2 19.7165 2 18.75V5.25C2 4.2835 2.7835 3.5 3.75 3.5H20.25C21.2165 3.5 22 4.2835 22 5.25V18.75Z" fill="#6a7282"/>
                  </svg>
                </button>
              </div>

              {/* Calendar */}
              <div className="px-6 pb-6 flex-shrink-0 border-b border-[#e5e7eb]">
                <ReportCalendar
                  reportDates={reportDates}
                  selectedDate={selectedFilterDate}
                  onDateSelect={handleFilterDateChange}
                />
              </div>

              {/* Report Count */}
              <div className="px-6 py-4 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[16px] font-semibold text-[#030712]">발행된 리포트</span>
                    <span className="text-[16px] font-semibold text-[#00bcff]">{filteredReports.length}</span>
                  </div>
                  {selectedFilterDate && (
                    <button
                      onClick={() => handleFilterDateChange(null)}
                      className="text-[12px] text-[#6a7282] hover:text-[#030712] transition-colors"
                    >
                      전체 보기
                    </button>
                  )}
                </div>
              </div>

              {/* Report Cards List */}
              <div className="flex-1 overflow-y-auto px-6 pb-6">
                {filteredReports.length > 0 ? (
                  <>
                    <div className="space-y-2">
                      {filteredReports.map((reportItem) => (
                        <ReportCard
                          key={reportItem.id}
                          id={reportItem.id}
                          server={reportItem.server}
                          time={reportItem.time}
                          metric={reportItem.metric}
                          badge={reportItem.badge}
                        selected={reportItem.id === reportIdentifier}
                        onClick={() => handleReportNavigation(reportItem.id)}
                        />
                      ))}
                    </div>

                    {/* Load More Button - only show when not filtered */}
                    {!selectedFilterDate && (
                      <button className="mt-4 flex w-full items-center justify-center gap-2 rounded-[6px] py-2 text-[14px] font-medium text-[#1e2939] hover:bg-[#f3f4f6] transition-colors">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M8 3.33334V12.6667M3.33334 8H12.6667" stroke="#1E2939" strokeWidth="1.33" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span>더 불러오기</span>
                      </button>
                    )}
                  </>
                ) : (
                  <div className="flex items-center justify-center py-12">
                    <p className="text-[14px] text-[#6a7282]">해당 날짜에 발행된 리포트가 없습니다.</p>
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>

        {/* Report Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Report Header */}
          <div className="flex items-center gap-3 px-6 pt-6 pb-4  flex-shrink-0">
              {/* Sidebar Toggle Button (when panel is closed) */}
              {!isSidePanelOpen && (
                <button
                  onClick={() => setIsSidePanelOpen(true)}
                  className="w-8 h-8 rounded-[6px] flex items-center justify-center hover:bg-white transition-colors flex-shrink-0"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.25 18.5H20V5.5H9.25V18.5ZM4 18.5H7.25V5.5H4V18.5ZM22 18.75C22 19.7165 21.2165 20.5 20.25 20.5H3.75C2.7835 20.5 2 19.7165 2 18.75V5.25C2 4.2835 2.7835 3.5 3.75 3.5H20.25C21.2165 3.5 22 4.2835 22 5.25V18.75Z" fill="#6a7282"/>
                  </svg>
                </button>
              )}
              <div className="flex items-baseline gap-3">
                <h1 className="text-[20px] font-semibold text-[#030712]">
                  {report.server} 이상 탐지 보고서
                </h1>
                <span className="text-[14px] text-[#6a7282]">
                  {report.time}
                </span>
              </div>
          </div>
        <div className="flex-1 flex overflow-hidden">
          {/* Report Content Area */}
          <div className="flex-1 overflow-y-auto" id="report-content-area">
            {/* Report Content Cards */}
            <div className="pt-4 pb-6 pr-4 pl-6 space-y-4">
              {/* 1Depth Section: 이상 탐지 흐름 요약 */}
              <FadeInUp delay={0.1}>
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
                  <FlowTimeline />
                )}
              </section>
              </FadeInUp>

              {/* 1Depth Section: Total Events 이상탐지 */}
              <FadeInUp delay={0.7}>
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
                      <TypingText
                        text="08:40경, Total Events가 평소 대비 13초(76%) 증가가 확인되었습니다."
                        typingSpeed={30}
                        showCursor={false}
                        loop={false}
                        className="text-[14px]"
                        variableSpeed={{ min: 10, max: 60 }}
                        highlightPatterns={[
                          { pattern: /13초\(76%\) 증가/, style: 'font-bold text-blue-500' }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 flex items-center">
                      <span className="text-[14px] font-semibold text-[#030712]">
                        Event 영향도
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TypingText
                        text="전체 Wait Time 중 증감률이 큰 Top 3 Event가 88% 점유하고 있습니다."
                        typingSpeed={30}
                        showCursor={false}
                        loop={false}
                        className="text-[14px]"
                        variableSpeed={{ min: 5, max: 40 }}
                        initialDelay={500}
                        highlightPatterns={[
                          { pattern: /88% 점유/, style: 'font-bold text-blue-500' }
                        ]}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 flex items-center">
                      <span className="text-[14px] font-semibold text-[#030712]">
                        Event 분석
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <TypingText
                        text="enq: SQ - Contention가 분 평균 32개의 세션을 대기하고 있습니다."
                        typingSpeed={30}
                        showCursor={false}
                        loop={false}
                        className="text-[14px]"
                        variableSpeed={{ min: 5, max: 40 }}
                        initialDelay={1000}
                        highlightPatterns={[
                          { pattern: /32개의 세션/, style: 'font-bold text-blue-500' }
                        ]}
                      />
                    </div>
                  </div>
                </div>

                {/* 차트 3개 (가로 배치) */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Wait Count 차트 */}
                  <div className="flex flex-col gap-3 border border-[#e5e7eb] rounded-[6px] bg-white p-4">
                    <div className="flex items-center h-6">
                      <span className="text-sm font-medium text-[#030712]">Wait Count</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 h-[84px]">
                        <div className="flex flex-col justify-between text-right text-[11px] text-[#6a7282] w-8">
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                          <span>0</span>
                        </div>
                        <div className="flex-1">
                          <ReactECharts
                            key={`wait-count-${reportIdentifier}`}
                            option={getAreaChartOption(waitCountData, chartTimes, '#00BCFF')}
                            style={{ height: '84px', width: '100%' }}
                            opts={{ renderer: 'svg' }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                        <span>{chartTimes[0] || '00:00'}</span>
                        <span>{chartTimes[Math.floor(chartTimes.length / 2)] || '12:00'}</span>
                        <span>{chartTimes[chartTimes.length - 1] || '23:30'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AVG Waiting Session 차트 */}
                  <div className="flex flex-col gap-3 border border-[#e5e7eb] rounded-[6px] bg-white p-4">
                    <div className="flex items-center h-6">
                      <span className="text-sm font-medium text-[#030712]">AVG Waiting Session</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 h-[84px]">
                        <div className="flex flex-col justify-between text-right text-[11px] text-[#6a7282] w-8">
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                          <span>0</span>
                        </div>
                        <div className="flex-1">
                          <ReactECharts
                            key={`avg-waiting-session-${reportIdentifier}`}
                            option={getAreaChartOption(avgWaitingSessionData, chartTimes, '#00BCFF')}
                            style={{ height: '84px', width: '100%' }}
                            opts={{ renderer: 'svg' }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                        <span>{chartTimes[0] || '00:00'}</span>
                        <span>{chartTimes[Math.floor(chartTimes.length / 2)] || '12:00'}</span>
                        <span>{chartTimes[chartTimes.length - 1] || '23:30'}</span>
                      </div>
                    </div>
                  </div>

                  {/* AVG Wait Time 차트 */}
                  <div className="flex flex-col gap-3 border border-[#e5e7eb] rounded-[6px] bg-white p-4">
                    <div className="flex items-center h-6">
                      <span className="text-sm font-medium text-[#030712]">AVG Wait Time</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2 h-[84px]">
                        <div className="flex flex-col justify-between text-right text-[11px] text-[#6a7282] w-8">
                          <span>100</span>
                          <span>75</span>
                          <span>50</span>
                          <span>25</span>
                          <span>0</span>
                        </div>
                        <div className="flex-1">
                          <ReactECharts
                            key={`avg-wait-time-${reportIdentifier}`}
                            option={getAreaChartOption(avgWaitTimeData, chartTimes, '#00BCFF')}
                            style={{ height: '84px', width: '100%' }}
                            opts={{ renderer: 'svg' }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                        <span>{chartTimes[0] || '00:00'}</span>
                        <span>{chartTimes[Math.floor(chartTimes.length / 2)] || '12:00'}</span>
                        <span>{chartTimes[chartTimes.length - 1] || '23:30'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2Depth: Top Event #1 */}
                <div id="top-event-1" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-event-1'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-event-1'] ? "auto" : 0,
                      opacity: expandedSections['top-event-1'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={topEvent1Tab === 'phenomenon' ? 'text-pink-400' : 'text-gray-600'}>
                                  <path d="M7.425 9.47505L11.15 3.40005C11.25 3.23338 11.375 3.11255 11.525 3.03755C11.675 2.96255 11.8333 2.92505 12 2.92505C12.1667 2.92505 12.325 2.96255 12.475 3.03755C12.625 3.11255 12.75 3.23338 12.85 3.40005L16.575 9.47505C16.675 9.64172 16.725 9.81672 16.725 10C16.725 10.1834 16.6833 10.35 16.6 10.5C16.5167 10.65 16.4 10.7709 16.25 10.8625C16.1 10.9542 15.925 11 15.725 11H8.275C8.075 11 7.9 10.9542 7.75 10.8625C7.6 10.7709 7.48333 10.65 7.4 10.5C7.31667 10.35 7.275 10.1834 7.275 10C7.275 9.81672 7.325 9.64172 7.425 9.47505ZM17.5 22C16.25 22 15.1875 21.5625 14.3125 20.6875C13.4375 19.8125 13 18.75 13 17.5C13 16.25 13.4375 15.1875 14.3125 14.3125C15.1875 13.4375 16.25 13 17.5 13C18.75 13 19.8125 13.4375 20.6875 14.3125C21.5625 15.1875 22 16.25 22 17.5C22 18.75 21.5625 19.8125 20.6875 20.6875C19.8125 21.5625 18.75 22 17.5 22ZM3 20.5V14.5C3 14.2167 3.09583 13.9792 3.2875 13.7875C3.47917 13.5959 3.71667 13.5 4 13.5H10C10.2833 13.5 10.5208 13.5959 10.7125 13.7875C10.9042 13.9792 11 14.2167 11 14.5V20.5C11 20.7834 10.9042 21.0209 10.7125 21.2125C10.5208 21.4042 10.2833 21.5 10 21.5H4C3.71667 21.5 3.47917 21.4042 3.2875 21.2125C3.09583 21.0209 3 20.7834 3 20.5ZM17.5 20C18.2 20 18.7917 19.7584 19.275 19.275C19.7583 18.7917 20 18.2 20 17.5C20 16.8 19.7583 16.2084 19.275 15.725C18.7917 15.2417 18.2 15 17.5 15C16.8 15 16.2083 15.2417 15.725 15.725C15.2417 16.2084 15 16.8 15 17.5C15 18.2 15.2417 18.7917 15.725 19.275C16.2083 19.7584 16.8 20 17.5 20ZM5 19.5H9V15.5H5V19.5ZM10.05 9.00005H13.95L12 5.85005L10.05 9.00005Z" fill="currentColor"/>
                                </svg>
                              ),
                            },
                            {
                              value: 'cause',
                              label: '원인',
                              icon: (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={topEvent1Tab === 'cause' ? 'text-indigo-400' : 'text-gray-600'}>
                                  <path d="M16.4 21L15 19.6L16.575 18L15 16.425L16.4 15L18 16.6L19.575 15L21 16.425L19.4 18L21 19.6L19.575 21L18 19.425L16.4 21ZM6 19C6.28333 19 6.52083 18.9042 6.7125 18.7125C6.90417 18.5208 7 18.2833 7 18C7 17.7167 6.90417 17.4792 6.7125 17.2875C6.52083 17.0958 6.28333 17 6 17C5.71667 17 5.47917 17.0958 5.2875 17.2875C5.09583 17.4792 5 17.7167 5 18C5 18.2833 5.09583 18.5208 5.2875 18.7125C5.47917 18.9042 5.71667 19 6 19ZM6 21C5.16667 21 4.45833 20.7083 3.875 20.125C3.29167 19.5417 3 18.8333 3 18C3 17.1667 3.29167 16.4583 3.875 15.875C4.45833 15.2917 5.16667 15 6 15C6.61667 15 7.17917 15.1708 7.6875 15.5125C8.19583 15.8542 8.56667 16.3167 8.8 16.9C9.45 16.7167 9.97917 16.3583 10.3875 15.825C10.7958 15.2917 11 14.6833 11 14V10C11 8.61667 11.4875 7.4375 12.4625 6.4625C13.4375 5.4875 14.6167 5 16 5H17.15L15.575 3.425L17 2L21 6L17 10L15.575 8.6L17.15 7H16C15.1667 7 14.4583 7.29167 13.875 7.875C13.2917 8.45833 13 9.16667 13 10V14C13 15.2167 12.6083 16.2875 11.825 17.2125C11.0417 18.1375 10.05 18.7083 8.85 18.925C8.65 19.5417 8.2875 20.0417 7.7625 20.425C7.2375 20.8083 6.65 21 6 21ZM4.4 9L3 7.6L4.575 6L3 4.425L4.4 3L6 4.6L7.575 3L9 4.425L7.4 6L9 7.6L7.575 9L6 7.425L4.4 9Z" fill="currentColor"/>
                                </svg>
                              ),
                            },
                            {
                              value: 'solution',
                              label: '해결방안',
                              icon: (
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={topEvent1Tab === 'solution' ? 'text-purple-400' : 'text-gray-600'}>
                                  <path d="M12 22C11.45 22 10.9792 21.8042 10.5875 21.4125C10.1958 21.0208 10 20.55 10 20H14C14 20.55 13.8042 21.0208 13.4125 21.4125C13.0208 21.8042 12.55 22 12 22ZM8 19V17H16V19H8ZM8.25 16C7.1 15.3167 6.1875 14.4 5.5125 13.25C4.8375 12.1 4.5 10.85 4.5 9.5C4.5 7.41667 5.22917 5.64583 6.6875 4.1875C8.14583 2.72917 9.91667 2 12 2C14.0833 2 15.8542 2.72917 17.3125 4.1875C18.7708 5.64583 19.5 7.41667 19.5 9.5C19.5 10.85 19.1625 12.1 18.4875 13.25C17.8125 14.4 16.9 15.3167 15.75 16H8.25ZM8.85 14H15.15C15.9 13.4667 16.4792 12.8083 16.8875 12.025C17.2958 11.2417 17.5 10.4 17.5 9.5C17.5 7.96667 16.9667 6.66667 15.9 5.6C14.8333 4.53333 13.5333 4 12 4C10.4667 4 9.16667 4.53333 8.1 5.6C7.03333 6.66667 6.5 7.96667 6.5 9.5C6.5 10.4 6.70417 11.2417 7.1125 12.025C7.52083 12.8083 8.1 13.4667 8.85 14Z" fill="currentColor"/>
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
                                            type ColumnMeta = { maxWidth?: number };
                                            const maxWidth = (header.column.columnDef.meta as ColumnMeta | undefined)?.maxWidth;
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
                                            type ColumnMeta = { maxWidth?: number };
                                            const maxWidth = (header.column.columnDef.meta as ColumnMeta | undefined)?.maxWidth;
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
                  </motion.div>
                </div>

                {/* 2Depth: Top Event #2 */}
                <div id="top-event-2" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-event-2'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-event-2'] ? "auto" : 0,
                      opacity: expandedSections['top-event-2'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                  </motion.div>
                </div>

                {/* 2Depth: Top Event #3 */}
                <div id="top-event-3" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-event-3'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-event-3'] ? "auto" : 0,
                      opacity: expandedSections['top-event-3'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                  </motion.div>
                </div>
              </section>
              </FadeInUp>

              {/* 1Depth Section: SQL Elapsed Time 이상 탐지 */}
              <FadeInUp delay={0.1}>
                <section id="sql-elapsed-time" className="bg-white rounded-[8px] p-6 space-y-6">
                <h2 className="text-[18px] font-semibold text-[#030712]">
                  SQL Elapsed Time 이상 탐지
                </h2>
                <div className="bg-[#f3f4f6] rounded-[6px] p-4 min-h-[150px] flex items-center justify-center text-[#6a7282]">
                  SQL Elapsed Time 요약 내용 영역
                </div>

                {/* 2Depth: Top SQL #1 */}
                <div id="top-sql-1" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-sql-1'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-sql-1'] ? "auto" : 0,
                      opacity: expandedSections['top-sql-1'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                  </motion.div>
                </div>

                {/* 2Depth: Top SQL #2 */}
                <div id="top-sql-2" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-sql-2'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-sql-2'] ? "auto" : 0,
                      opacity: expandedSections['top-sql-2'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                  </motion.div>
                </div>

                {/* 2Depth: Top SQL #3 */}
                <div id="top-sql-3" className={`border rounded-[6px] overflow-hidden transition-colors ${expandedSections['top-sql-3'] ? 'border-sky-500' : 'border-[#e5e7eb]'}`}>
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
                  <motion.div
                    layout={false}
                    animate={{ 
                      height: expandedSections['top-sql-3'] ? "auto" : 0,
                      opacity: expandedSections['top-sql-3'] ? 1 : 0
                    }}
                    transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
                    style={{ 
                      overflow: "hidden"
                    }}
                  >
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
                  </motion.div>
                </div>
              </section>
              </FadeInUp>
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

