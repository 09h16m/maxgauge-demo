"use client";

import { useRouter } from "next/navigation";
import { Clock, Database, TrendingUp, Eye, Calendar, ChevronDown } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ReactECharts from 'echarts-for-react';

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

  // 최근 방문 메뉴
  const recentMenus = [
    { name: "MaxGauge AI", icon: "🔧", path: "/maxgauge-ai" },
    { name: "Root Finder", icon: "🔍", path: "/root-finder" },
    { name: "Memory Analysis", icon: "🧠", path: "/oracle" },
    { name: "Oracle Alertlog", icon: "📊", path: "/oracle" },
    { name: "Access Pattern", icon: "📈", path: "/oracle" },
  ];

  // 차트 데이터 상태
  const [chartData, setChartData] = useState([20, 8, 3, 66, 38, 8, 48, 7, 23, 2, 1, 29]);
  const [timeLabels, setTimeLabels] = useState(() => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 4000);
      return time.toTimeString().slice(0, 8);
    });
  });

  // 3초마다 차트 데이터 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      const newValue = Math.floor(Math.random() * 100);
      setChartData(prev => [...prev.slice(1), newValue]);
      
      const now = new Date();
      const newTime = now.toTimeString().slice(0, 8);
      setTimeLabels(prev => [...prev.slice(1), newTime]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative h-screen overflow-hidden bg-white">
      {/* 배경 그라데이션 */}
      <div 
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle at 50% 100%, rgba(205, 233, 254, 1) 0%, rgba(205, 233, 254, 0) 100%)`,
        }}
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-16 p-8"
      >
        {/* 헤더 섹션 */}
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-5xl font-medium text-black">Hello, Exem</h1>
          <p className="text-lg font-medium text-gray-600">지금 바로 주요 알림과 상태를 확인해보세요.</p>
        </div>

        {/* 메인 컨텐츠 */}
        <div className="flex flex-col items-center gap-6 w-full max-w-6xl">
          
          {/* Alert Menu */}
          <div className="flex items-start gap-6">
            
            {/* Alarm 위젯 */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 w-[380px] h-[342px] flex flex-col">
              {/* 차트 섹션 */}
              <div className="flex-1 mb-5">
                <ReactECharts
                  option={{
                    grid: {
                      left: 40,
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
                      axisLabel: {
                        color: '#6a7282',
                        fontSize: 11,
                        align: 'right',
                      },
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
                    <div className="flex flex-col gap-3 flex-1">
                      <span className="px-1 text-[#6a7282]">Instance</span>
                      {alarmData.map((row, i) => (
                        <span key={i} className="px-1 text-[#1e2939] truncate">{row.instance}</span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 w-20">
                      <span className="px-1 text-[#6a7282]">Name</span>
                      {alarmData.map((row, i) => (
                        <span key={i} className="px-1 text-[#1e2939] truncate">{row.name}</span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 w-10">
                      <span className="px-1 text-[#6a7282]">Value</span>
                      {alarmData.map((row, i) => (
                        <span key={i} className="px-1 text-[#1e2939] text-right truncate">{row.value}</span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-3 w-14">
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
                    <div className="flex flex-col gap-3 w-17">
                      <span className="px-1 text-[#6a7282] text-center">Time</span>
                      {alarmData.map((row, i) => (
                        <span key={i} className="px-1 text-[#6a7282] truncate">{row.time}</span>
                      ))}
                    </div>
                  </div>
              </div>
            </div>

            {/* MaxGauge AI 위젯 */}
            <div className="bg-white border border-gray-200 rounded-2xl flex items-center w-[666px] h-[342px] overflow-hidden">
              
              {/* 캘린더 섹션 */}
              <div className="w-full flex flex-col items-center gap-6 p-8 flex-1">
                {/* 헤더 */}
                <div className="flex items-center justify-between w-full">
                  <span className="text-base font-semibold text-black">October 2025</span>
                  <div className="flex items-center gap-2">
                    <button className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100">
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
                
                {/* 캘린더 그리드 */}
                <div className="flex flex-col items-center gap-1.5">
                  {/* 요일 헤더 */}
                  <div className="flex gap-1.5">
                    {['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map((day, i) => (
                      <div key={day} className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                        i === 0 || i === 2 || i === 3 || i === 6 ? 'bg-gray-100' : ''
                      }`}>
                        <span className={`text-xs ${i === 0 || i === 2 || i === 3 || i === 6 ? 'font-semibold' : ''}`}>
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 첫 번째 주 */}
                  <div className="flex gap-1.5">
                    {[1, 2, 3, 4].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                          day === 1 || day === 3 ? 'bg-gray-100' : 
                          day === 2 ? 'bg-yellow-200' : 'bg-white'
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-800">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* 두 번째 주 */}
                  <div className="flex gap-1.5">
                    {[5, 6, 7, 8, 9, 10, 11].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                          day === 5 || day === 9 ? 'bg-gray-100' : 
                          [6, 7, 8, 10, 11].includes(day) ? 'bg-yellow-200' : 'bg-white'
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-800">{day}</span>
                      </div>
                    ))}
                  </div>

                  {/* 세 번째 주 */}
                  <div className="flex gap-1.5">
                    {[12, 13, 14, 15, 16, 17, 18].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-8 flex items-center justify-center text-xs rounded relative ${
                          day === 13 || day === 15 ? 'bg-gray-100' : 
                          [12, 14, 16, 17, 18].includes(day) ? 'bg-yellow-200' : 'bg-white'
                        }`}
                      >
                        <span className="text-xs font-medium text-gray-800">{day}</span>
                        {day === 16 && (
                          <div className="absolute w-1 h-1 bg-red-500 rounded-full bottom-0.5"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* 네 번째 주 */}
                  <div className="flex gap-1.5">
                    {[19, 20, 21, 22, 23, 24, 25].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                          [20, 22, 23, 24, 25].includes(day) ? 'bg-gray-100' : 'bg-white'
                        }`}
                      >
                        <span className={`text-xs ${[20, 22, 23, 24, 25].includes(day) ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* 다섯 번째 주 */}
                  <div className="flex gap-1.5">
                    {[26, 27, 28, 29, 30, 31].map((day) => (
                      <div
                        key={day}
                        className={`w-8 h-8 flex items-center justify-center text-xs rounded ${
                          [26, 28, 29, 30].includes(day) ? 'bg-gray-100' : 'bg-white'
                        }`}
                      >
                        <span className={`text-xs ${[26, 28, 29, 30].includes(day) ? 'font-semibold' : 'font-medium'} text-gray-800`}>
                          {day}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* MaxGauge 위젯 */}
              <div 
                className="w-full h-[342px] flex items-center justify-center"
                style={{
                  background: `radial-gradient(circle at 50% 100%, rgba(0, 82, 252, 1) 0%, rgba(0, 185, 252, 0.9) 34%, rgba(216, 240, 252, 0.6) 76%, rgba(255, 255, 255, 0) 100%)`,
                }}
              >
                <div className="text-center">
                  <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-white font-semibold text-lg">MaxGauge AI</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Menu */}
          <div className="flex bg-white border border-gray-200 rounded-2xl p-4 w-full">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-500" />
              <span className="text-base font-semibold text-black">최근 방문 메뉴</span>
            </div>
            
            <div className="flex gap-3">
              {recentMenus.map((menu, index) => (
                <button
                  key={index}
                  onClick={() => router.push(menu.path)}
                  className="flex items-center gap-1.5 bg-gray-100 rounded-md px-2 py-2 hover:bg-gray-200 transition-colors"
                >
                  <span className="text-lg">{menu.icon}</span>
                  <span className="text-sm text-black">{menu.name}</span>
                </button>
              ))}
            </div>
          </div>

        </div>
      </motion.div>
    </div>
  );
}