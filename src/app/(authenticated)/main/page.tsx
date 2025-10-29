"use client";

import { useRouter } from "next/navigation";
import { Clock, Database, TrendingUp, Eye, Calendar as CalendarIcon, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactECharts from 'echarts-for-react';
import GNB from "@/components/layout/GNB";
import { FlickeringGrid } from "@/components/ui/shadcn-io/flickering-grid";
import { Calendar } from "@/components/ui/calendar";

export default function MainPage() {
  const router = useRouter();

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
    { server: 'DB-SERVER-01', time: '2025-10-04 07:55' },
    { server: 'DB-SERVER-01', time: '2025-10-04 07:55' },
    { server: 'DB-SERVER-01', time: '2025-10-04 07:55' },
    { server: 'DB-SERVER-01', time: '2025-10-04 07:55' },
    { server: 'DB-SERVER-01', time: '2025-10-04 07:55' },
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
        <div className="flex items-center justify-center gap-6 w-full max-w-6xl h-[320px]">
          
          {/* MaxGauge AI 위젯 (왼쪽 큰 위젯) */}
          <div className="bg-white border border-white/60 rounded-2xl shadow-[0px_0px_20px_0px_rgba(3,7,18,0.08),0px_0px_1px_0px_rgba(3,7,18,0.5)] flex items-stretch w-[640px] h-[320px]">
            
            {/* MaxGauge 위젯 */}
            <div 
              className="w-[320px] h-full flex flex-col items-center justify-center gap-3 p-6 relative flex-shrink-0 overflow-hidden rounded-l-2xl"
              style={{
                background: `radial-gradient(circle at 50% 100%, rgba(0, 82, 252, 1) 0%, rgba(0, 185, 252, 0.8) 34%, rgba(216, 240, 252, 0.6) 76%, rgba(255, 255, 255, 0) 100%)`,
              }}
            >
              {/* 배경 이미지 */}
              <div className="absolute inset-0 w-full h-full overflow-hidden">
                <img 
                  src="/widget-bg-1.png" 
                  alt="Widget Background" 
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Ripple 효과 제거됨 */}
              
              {/* 상태 텍스트 */}
              <div className="relative z-10 text-center">
                <h3 className="text-5xl font-bold text-white mb-2" style={{ textShadow: '0px 1px 8px 0px rgba(0, 82, 252, 0.25)' }}>
                  정상
                </h3>
              </div>
              
              {/* MAX AI 텍스트 - 위쪽 중앙에 절대 위치 */}
              <p className="absolute top-6 left-1/2 transform -translate-x-1/2 text-sm text-white font-medium z-10">MAX AI</p>
            </div>

            {/* 이상 탐지 이력 */}
            <div className="flex flex-col w-[320px] min-w-[320px] flex-shrink-0 h-full rounded-r-2xl overflow-hidden">
              {/* 고정 타이틀 */}
              <div className="px-6 pt-6 pb-4 flex-shrink-0">
                <h3 className="text-base font-semibold text-gray-900">이상 탐지 이력</h3>
              </div>
              
              {/* 스크롤 가능한 리스트 */}
              <div className="flex flex-col gap-2 px-6 pb-6 overflow-y-auto flex-1">
                {anomalyReports.map((report, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-md p-3 hover:shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] hover:border-gray-300 transition cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <img 
                        src="/logos/oracle-logo.svg" 
                        alt="Oracle" 
                        className="w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">{report.server}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-xs text-gray-600">{report.time}</span>
                    </div>
                  </div>
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

            {/* Calendar 위젯 */}
            <div className="bg-white border border-white/60 rounded-2xl shadow-[0px_0px_20px_0px_rgba(3,7,18,0.08),0px_0px_1px_0px_rgba(3,7,18,0.5)] p-6 w-[320px] h-[320px] flex flex-col items-center gap-5">
              
              {/* 실제 Calendar 컴포넌트 */}
              <div className="flex-1 w-full">
                <Calendar
                  mode="single"
                  className="w-full"
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4",
                    caption: "flex justify-between items-center pt-1 relative w-full",
                    caption_label: "text-sm font-medium",
                    nav: "flex items-center space-x-1",
                    nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                    nav_button_previous: "relative",
                    nav_button_next: "relative",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: "text-gray-500 rounded-md w-9 font-normal text-xs",
                    row: "flex w-full mt-2",
                    cell: "h-9 w-9 text-center text-sm p-0 relative",
                    day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 rounded",
                    day_selected: "bg-blue-500 text-white hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white",
                    day_today: "bg-gray-100 text-gray-900",
                    day_outside: "text-gray-400 opacity-50",
                    day_disabled: "text-gray-400 opacity-50",
                    day_hidden: "invisible",
                  }}
                />
              </div>
            </div>

          </div>
        </div>
      </motion.div>
      </div>
  );
}