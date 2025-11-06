"use client";

import { useRouter } from "next/navigation";
import { Clock, Database, TrendingUp, Eye, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import ReactECharts from 'echarts-for-react';
import GNB from "@/components/layout/GNB";
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";
import { Tooltip } from "@/components/ui/tooltip";
import CircularOrbAnimation from "@/components/ui/CircularOrbAnimation";
import ReportCard from "@/components/ui/ReportCard";

export default function MainPage() {
  const router = useRouter();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // 스크롤 이벤트 감지
  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      setIsScrolling(true);
      
      // 스크롤이 멈춘 후 1초 뒤에 스크롤바 숨기기
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      scrollTimeoutRef.current = setTimeout(() => {
        setIsScrolling(false);
      }, 1000);
    };

    scrollContainer.addEventListener('scroll', handleScroll);
    scrollContainer.addEventListener('wheel', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
      scrollContainer.removeEventListener('wheel', handleScroll);
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, []);

  // 알람 데이터
  const alarmData = [
    { instance: 'DB-SERVER-01', name: 'CPU', value: '67.56', level: 'Warning', time: '13 14:56:04' },
    { instance: 'APP-SERVER-02', name: 'Disk Usage', value: '85.28', level: 'Critical', time: '13 14:56:04' },
    { instance: 'PROD5', name: 'Active Session', value: '54', level: 'Warning', time: '13 14:56:04' },
    { instance: 'DB-SERVER-01', name: 'CPU', value: '100', level: 'Critical', time: '13 14:56:04' },
    { instance: 'PROD5', name: 'Disk Usage', value: '71.05', level: 'Warning', time: '13 14:56:04' },
  ];

  // 이상 탐지 이력 데이터
  const anomalyReports = [
    { server: 'DB-SERVER-01', time: '2025-10-06 12:39' },
    { server: 'DB-SERVER-02', time: '2025-10-05 08:21' },
    { server: 'DB-SERVER-03', time: '2025-10-04 18:21' },
    { server: 'DB-SERVER-04', time: '2025-10-03 15:42' },
    { server: 'APP-SERVER-02', time: '2025-10-02 09:12' },
  ];

  // 차트 데이터 상태
  const [chartData, setChartData] = useState([20, 8, 3, 51, 33, 12, 42, 7, 19, 23, 2, 1, 29]);
  const [timeLabels, setTimeLabels] = useState(() => {
    const now = new Date();
    return Array.from({ length: 13 }, (_, i) => {
      const time = new Date(now.getTime() - (12 - i) * 4000);
      return time.toTimeString().slice(0, 5);
    });
  });

  // 3초마다 차트 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 100);
      setChartData(prev => [...prev.slice(1), newValue]);
      
      const now = new Date();
      const newTime = now.toTimeString().slice(0, 5);
      setTimeLabels(prev => [...prev.slice(1), newTime]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {/* GNB - border 없는 버전 */}
      <GNB variant="without-border" />
      
      {/* 배경 그라데이션 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 110%, rgba(254, 233, 244, 1) 6%, rgba(229, 233, 249, 1) 25%, rgba(205, 233, 254, 1) 33%, rgba(255, 255, 255, 1) 70%)`,
        }}
      />
      
      {/* Flickering Grid 배경 */}
      <div className="absolute inset-0 z-5">
        <FlickeringGrid
          className="w-full h-full"
          squareSize={6}
          gridGap={10}
          flickerChance={0.6}
          color="rgb(255, 255, 255)"
          maxOpacity={0.4}
        />
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full h-[calc(100vh-56px)] flex flex-col items-center justify-center gap-16 p-8"
      >
        {/* 헤더 섹션 */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-medium text-black">Hello, Exem</h1>
          <p className="text-lg font-medium text-gray-600">지금 바로 주요 알림과 상태를 확인해보세요.</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-6 w-full max-w-6xl h-[320px]">
          
          {/* MaxGauge AI 위젯 (왼쪽 큰 위젯) */}
          <div className="bg-white border border-white/60 rounded-2xl shadow-[0px_0px_20px_0px_rgba(3,7,18,0.08),0px_0px_1px_0px_rgba(3,7,18,0.5)] flex items-stretch w-[640px] h-[320px]">
            
            {/* MaxGauge 위젯 with Circular Orb Animation */}
            <div 
              className="w-[320px] h-full relative flex-shrink-0 rounded-l-2xl cursor-pointer hover:opacity-90 transition-opacity"
              onClick={() => router.push('/maxgauge-ai')}
            >
              <div className="w-full h-full flex flex-col items-center justify-center gap-3 p-6 relative">
                {/* MAX AI 텍스트 - 위쪽 중앙에 절대 위치 */}
                <p className="absolute top-6 left-1/2 transform -translate-x-1/2 text-sm text-sky-400 font-medium z-20">MAX AI</p>
                
                {/* 원형 오브 애니메이션 */}
                <CircularOrbAnimation size={220}>
                  <h3 className="text-2xl font-medium text-white">
                    NORMAL
                  </h3>
                </CircularOrbAnimation>
              </div>
            </div>

            {/* 이상 탐지 이력 */}
            <div className="flex flex-col w-[320px] min-w-[320px] flex-shrink-0 h-full rounded-r-2xl overflow-hidden">
              {/* 고정 타이틀 */}
              <div className="px-6 pt-6 pb-4 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-900">이상 탐지 이력</h3>
              </div>
              
              {/* 스크롤 가능한 리스트 */}
              <div 
                ref={scrollContainerRef}
                className={`flex flex-col gap-2 px-6 pb-6 overflow-y-auto flex-1 scrollbar-hide-on-idle ${isScrolling ? 'scrolling' : ''}`}
              >
                {anomalyReports.map((report, index) => (
                  <ReportCard
                    key={`${report.server}-${index}`}
                    id={report.server}
                    server={report.server}
                    time={report.time}
                    variant="simplified"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* 오른쪽 위젯들 */}
          <div className="flex gap-6">
            
            {/* Alarm 위젯 */}
            <div className="bg-white border border-white/60 rounded-2xl shadow-[0px_0px_20px_0px_rgba(3,7,18,0.08),0px_0px_1px_0px_rgba(3,7,18,0.5)] p-6 w-[400px] h-[320px] flex flex-col gap-1">
              <h3 className="text-base font-semibold text-black">사용자 지정 알람</h3>
              
              {/* 차트 섹션 */}
              <div className="flex-1 mb-4">
                <ReactECharts
                  option={{
                    grid: {
                      left: 0,
                      right: 0,
                      top: 7,
                      bottom: 20,
                    },
                    xAxis: {
                      type: 'category',
                      data: timeLabels,
                      axisLine: { show: false },
                      axisTick: { show: false },
                      axisLabel: {
                        color: '#6a7282',
                        fontSize: 11,
                        interval: 2,
                      },
                      splitLine: { show: false },
                    },
                    yAxis: {
                      type: 'value',
                      min: 0,
                      max: 100,
                      interval: 25,
                      axisLine: { show: false },
                      axisTick: { show: false },
                      axisLabel: { show: false },
                      splitLine: {
                        lineStyle: {
                          color: '#f3f4f6',
                          width: 1,
                        },
                      },
                    },
                    series: [
                      {
                        data: chartData,
                        type: 'bar',
                        barWidth: 14,
                        itemStyle: {
                          color: '#00bcff',
                          borderRadius: [2, 2, 0, 0],
                        },
                      },
                    ],
                    animation: false,
                  }}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'svg' }}
                />
              </div>

              {/* 테이블 섹션 */}
              <div className="bg-white overflow-hidden">
                <div className="flex text-[11px]">
                  <div className="flex flex-col gap-2 flex-1">
                    <span className="px-1 text-[#6a7282]">Instance</span>
                    {alarmData.map((row, i) => (
                      <span key={i} className="px-1 text-[#1e2939] truncate">{row.instance}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 w-20">
                    <span className="px-1 text-[#6a7282]">Name</span>
                    {alarmData.map((row, i) => (
                      <span key={i} className="px-1 text-[#1e2939] truncate">{row.name}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 w-10">
                    <span className="px-1 text-[#6a7282]">Value</span>
                    {alarmData.map((row, i) => (
                      <span key={i} className="px-1 text-[#1e2939] text-right truncate">{row.value}</span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 w-14">
                    <span className="px-1 text-[#6a7282] text-center">Level</span>
                    {alarmData.map((row, i) => (
                      <span
                        key={i}
                        className={`px-1 font-medium text-center truncate ${
                          row.level === 'Warning' ? 'text-[#fe9a00]' : 'text-[#fb2c36]'
                        }`}
                      >
                        {row.level}
                      </span>
                    ))}
                  </div>
                  <div className="flex flex-col gap-2 w-17">
                    <span className="px-1 text-[#6a7282] text-center">Time</span>
                    {alarmData.map((row, i) => (
                      <span key={i} className="px-1 text-[#6a7282] truncate">{row.time}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 추천 메뉴 */}
        <div className="bg-white border border-white/60 rounded-2xl shadow-[0px_0px_20px_0px_rgba(3,7,18,0.08),0px_0px_1px_0px_rgba(3,7,18,0.5)] flex items-center gap-6 px-6 py-3 w-full max-w-6xl">
          {/* 제목 */}
          <h2 className="text-base font-semibold text-gray-900 whitespace-nowrap">추천 메뉴</h2>
          
          {/* 메뉴 아이템들 */}
          <div className="flex gap-3 flex-1">
            {/* MaxGauge AI */}
            <button className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1">
              <img src="/tools-symbol.svg" alt="Tools" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">MaxGauge AI</span>
            </button>
            
            {/* Root Finder */}
            <button className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1">
              <img src="/rootfinder-symbol.svg" alt="Root Finder" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">Root Finder</span>
            </button>
            
            {/* Memory Analysis */}
            <button className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1">
              <img src="/logos/oracle-logo.svg" alt="Oracle" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">Memory Analysis</span>
            </button>
            
            {/* Oracle Alertlog */}
            <button className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1">
              <img src="/logos/oracle-logo.svg" alt="Oracle" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">Oracle Alertlog</span>
            </button>
            
            {/* Access Pattern */}
            <button className="flex items-center justify-center gap-2 px-2 py-2 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors flex-1">
              <img src="/logos/oracle-logo.svg" alt="Oracle" className="w-5 h-5" />
              <span className="text-sm font-medium text-gray-900">Access Pattern</span>
            </button>
          </div>
        </div>
        </div>
      </motion.div>
      </div>
  );
}