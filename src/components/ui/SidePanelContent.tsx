'use client';

import { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';

export default function SidePanelContent() {
  // 샘플 데이터
  const reports = [
    { id: 1, server: 'PRODRAC3P', time: '2025-10-06 12:39', metric: 'SQL Elapsed Time', badge: '+3', selected: true },
    { id: 2, server: 'DB-SERVER-01', time: '2025-10-04 07:55', metric: 'Active Session', badge: null, selected: false },
    { id: 3, server: 'APP-SERVER-02', time: '2025-10-03 18:21', metric: 'Total Wait Time', badge: '+1', selected: false },
    { id: 4, server: 'PROD05', time: '2025-10-03 18:21', metric: 'SQL Elapsed Time', badge: null, selected: false },
    { id: 5, server: 'APP-SERVER-07', time: '2025-10-02 09:21', metric: 'Active Session', badge: null, selected: false },
  ];

  const alarmData = [
    { instance: 'DB-SERVER-01', name: 'CPU', value: '67.56', level: 'Warning', time: '13 14:56:04' },
    { instance: 'APP-SERVER-02', name: 'Disk Usage', value: '85.28', level: 'Critical', time: '13 14:56:04' },
    { instance: 'PROD5', name: 'Active Session', value: '54', level: 'Warning', time: '13 14:56:04' },
    { instance: 'DB-SERVER-01', name: 'CPU', value: '100', level: 'Critical', time: '13 14:56:04' },
    { instance: 'PROD5', name: 'Disk Usage', value: '71.05', level: 'Warning', time: '13 14:56:04' },
    { instance: 'APP-SERVER-02', name: 'Active Session', value: '33', level: 'Warning', time: '13 14:56:04' },
    { instance: 'DB-SERVER-01', name: 'CPU', value: '91.29', level: 'Critical', time: '13 14:56:04' },
  ];

  // 초기 시간 계산 함수
  const generateInitialTime = () => {
    const now = new Date();
    return Array.from({ length: 12 }, (_, i) => {
      const time = new Date(now.getTime() - (11 - i) * 4000);
      return time.toTimeString().slice(0, 8);
    });
  };

  // 차트 데이터를 state로 관리
  const [chartData, setChartData] = useState([20, 8, 3, 66, 38, 8, 48, 7, 23, 2, 1, 29]);
  const [timeLabels, setTimeLabels] = useState(generateInitialTime);

  // 3초마다 새로운 데이터 포인트 추가 (왼쪽으로 시프트)
  useEffect(() => {
    const interval = setInterval(() => {
      // 새로운 랜덤 값 생성 (오른쪽에 추가될 값)
      const newValue = Math.floor(Math.random() * 100);
      
      // 기존 데이터를 왼쪽으로 시프트하고 새 값을 오른쪽에 추가
      setChartData(prev => [...prev.slice(1), newValue]);

      // 새로운 시간 계산 (현재 시간)
      const now = new Date();
      const newTime = now.toTimeString().slice(0, 8);
      
      // 시간 라벨도 왼쪽으로 시프트하고 새 시간을 오른쪽에 추가
      setTimeLabels(prev => [...prev.slice(1), newTime]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* 이상 감지 이력 */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between h-7">
          <div className="flex items-center gap-2 font-semibold text-base">
            <span className="text-[#030712]">이상 감지 이력</span>
            <span className="text-[#00bcff]">4</span>
          </div>
          <button className="flex items-center gap-0.5 h-7 px-1.5 rounded-md">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 6L8 11L13 6" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" transform="rotate(180 8 8.5)"/>
            </svg>
            <span className="text-sm font-medium text-[#6a7282]">생성일</span>
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {reports.map(report => (
            <div
              key={report.id}
              className={`rounded-md overflow-hidden hover:shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)] transition cursor-pointer px-4 py-3 ${
                report.selected 
                  ? 'border-[1.5px] border-transparent' 
                  : 'border border-gray-200 hover:border-gray-300'
              }`}
              style={report.selected ? {
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
                    <span className="text-sm font-semibold text-[#030712]">{report.server}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5" stroke="#6a7282" strokeWidth="1"/>
                      <path d="M6 3V6H9" stroke="#6a7282" strokeWidth="1"/>
                    </svg>
                    <span className="text-[11px] text-[#6a7282]">{report.time}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-xs text-[#6a7282]">최초 이상감지</span>
                  <div className="flex items-center gap-1">
                    <span className="text-sm text-[#1e2939]">{report.metric}</span>
                    {report.badge && (
                      <span className="bg-[#e5e7eb] rounded-full px-1 min-w-[20px] h-5 flex items-center justify-center text-xs font-medium text-[#1e2939]">
                        {report.badge}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 사용자 지정 알람 */}
      <div className="flex flex-col gap-3 flex-1 min-h-0 p-5">
        <div className="flex items-center justify-between h-7">
          <span className="font-semibold text-base text-[#030712]">사용자 지정 알람</span>
          <button className="w-7 h-7 rounded-md flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 6V10M10 14H10.01M19 10C19 14.9706 14.9706 19 10 19C5.02944 19 1 14.9706 1 10C1 5.02944 5.02944 1 10 1C14.9706 1 19 5.02944 19 10Z" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* 차트 */}
        <div className="h-[104px]">
          <ReactECharts
            option={{
              grid: {
                left: 32,
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
                  formatter: (value: string) => value,
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
            style={{ height: '104px', width: '100%' }}
            opts={{ renderer: 'svg' }}
          />
        </div>

        {/* 테이블 */}
        <div className="flex-1 min-h-0 bg-white border border-[#e5e7eb] rounded-md overflow-hidden">
          <div className="p-3 h-full overflow-auto">
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
      </div>
    </div>
  );
}

