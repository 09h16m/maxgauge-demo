'use client';

import { BlockData } from './Block3D';
import { useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';

interface InstanceDetailProps {
  block: BlockData;
  onBack?: () => void;
}

// ECharts 옵션 생성 함수
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
    animationDuration: 300,
    animationEasing: 'linear',
  };
};

const getLineChartOption = (data: number[], times: string[], color = '#00BCFF') => {
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
      },
    ],
    animation: true,
    animationDuration: 300,
    animationEasing: 'linear',
  };
};

const getScatterChartOption = (data: number[], times: string[], color = '#38bdf8') => {
  // 시간에 따른 scatter 데이터 생성 (시간을 x축 카테고리로 사용)
  const scatterData: number[] = data;
  
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
        data: scatterData,
        type: 'scatter',
        symbolSize: 3.5,
        itemStyle: {
          color: color,
          opacity: 1,
        },
      },
    ],
    animation: true,
    animationDuration: 300,
    animationEasing: 'linear',
  };
};

export default function InstanceDetail({ block, onBack }: InstanceDetailProps) {
  const getStatusLabel = (status: BlockData['status']) => {
    if (status === 'critical') return '이상 탐지';
    if (status === 'warning') return '이상 감지 중';
    return '정상';
  };

  const getStatusColor = (status: BlockData['status']) => {
    if (status === 'critical') return '#fb2c36';
    if (status === 'warning') return '#fe9a00';
    return '#00BCFF';
  };

  const getStatusBackground = (status: BlockData['status']) => {
    if (status === 'critical') {
      // 빨간색 그라데이션
      return 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #ffe2e285 100%)';
    }
    if (status === 'warning') {
      // 노란색 그라데이션
      return 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #fef3c685 100%)';
    }
    // 정상 - 회색 그라데이션
    return 'linear-gradient(180deg, rgba(255, 255, 255, 0) 0%, #f3f4f6 100%)';
  };

  // 더미 메트릭 데이터 (블록 ID 기반으로 일관성 유지)
  const metrics = useMemo(() => ({
    memory: 40 + (block.id % 40),
    disk: 50 + (block.id % 30),
    sessions: 10 + (block.id % 50),
    transactions: 100 + (block.id % 400),
    responseTime: 50 + (block.id % 150),
  }), [block.id]);

  // 현재 시간 포맷팅
  const getCurrentTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  // 시간 레이블 생성 함수
  const generateTimeLabels = (count: number) => {
    const labels: string[] = [];
    const now = new Date();
    for (let i = count - 1; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 3000); // 3초 간격
      const hours = String(time.getHours()).padStart(2, '0');
      const minutes = String(time.getMinutes()).padStart(2, '0');
      const seconds = String(time.getSeconds()).padStart(2, '0');
      labels.push(`${hours}:${minutes}:${seconds}`);
    }
    return labels;
  };

  // 차트 데이터 생성 (실시간 업데이트 시뮬레이션)
  const [cpuData, setCpuData] = useState<number[]>(() => 
    Array.from({ length: 20 }, () => 30 + Math.random() * 50)
  );
  const [sessionData, setSessionData] = useState<number[]>(() => 
    Array.from({ length: 20 }, () => 20 + Math.random() * 60)
  );
  const [sqlTimeData, setSqlTimeData] = useState<number[]>(() => 
    Array.from({ length: 22 }, () => 10 + Math.random() * 80)
  );

  const [cpuTimes, setCpuTimes] = useState<string[]>(() => generateTimeLabels(20));
  const [sessionTimes, setSessionTimes] = useState<string[]>(() => generateTimeLabels(20));
  const [sqlTimes, setSqlTimes] = useState<string[]>(() => generateTimeLabels(22));

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`;
      
      setCpuData(prev => [...prev.slice(1), 30 + Math.random() * 50]);
      setSessionData(prev => [...prev.slice(1), 20 + Math.random() * 60]);
      setSqlTimeData(prev => [...prev.slice(1), 10 + Math.random() * 80]);
      
      setCpuTimes(prev => [...prev.slice(1), timeStr]);
      setSessionTimes(prev => [...prev.slice(1), timeStr]);
      setSqlTimes(prev => [...prev.slice(1), timeStr]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 현상 데이터
  const issues = [
    { text: '시퀀스 객체 이상 확인', time: '2025-10-13 07:31', color: '#FE9A00' },
    { text: '대기시간 증가', time: '2025-10-13 08:14', color: '#FE9A00' },
    { text: 'Active Session 증가', time: '2025-10-13 08:19', color: '#FE9A00' },
    { text: '응답시간 지연', time: '2025-10-13 08:21', color: '#FB2C36' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* 리스트로 돌아가기 버튼 */}
      <div className="flex flex-col gap-2 p-3 pb-2 ">
        <button 
          onClick={onBack}
          className="flex items-center gap-0.5 px-2 h-8 rounded-md hover:bg-gray-50 transition w-fit cursor-pointer"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="#1e2939" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-sm font-medium text-[#1e2939]">리스트로 돌아가기</span>
        </button>
      </div>

      {/* 인스턴스 타이틀 */}
      <div 
        className="flex items-center"
        style={{
          height: '80px',
          background: getStatusBackground(block.status),
          borderBottom: '1px solid #E5E7EB',
          gap: '16px',
        }}
      >
        {/* Oracle Database 아이콘 */}
        <div className="flex-shrink-0 h-full flex items-start overflow-hidden" style={{ paddingLeft: '12px', paddingTop: '4px' }}>
          <img 
            src="/oracle-database.svg" 
            alt="Oracle Database" 
            className="w-[112px] h-[112px]"
          />
        </div>

        {/* 인스턴스 정보 */}
        <div className="flex flex-col justify-center flex-1" style={{ gap: '4px' }}>
          {/* 인스턴스명 */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            <h2 className="text-[20px] font-semibold leading-[1.4] text-[#030712]">
              PRODRAC{block.id}P
            </h2>
          </div>

          {/* 상태 및 시간 */}
          <div className="flex items-center" style={{ gap: '8px' }}>
            {/* 상태 */}
            <div className="flex items-center" style={{ gap: '8px' }}>
              <span 
                className="inline-block w-2 h-2 rounded-full"
                style={{ backgroundColor: getStatusColor(block.status) }}
              />
              <span className="text-[14px] leading-[1.4] text-[#6a7282]">
                {getStatusLabel(block.status)}
              </span>
            </div>

            {/* 구분선 */}
            <div className="w-px h-3 bg-[#E5E7EB]" />

            {/* 시간 */}
            <span className="text-[14px] leading-[1.4] text-[#6a7282]">
              {getCurrentTime()}
            </span>
          </div>
        </div>
      </div>

      {/* Instance Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="flex flex-col gap-6 p-5">
          {/* 현상 */}
          <div className="flex flex-col gap-2">
            <h3 className="text-sm font-medium text-[#030712]">현상</h3>
            <div className="flex flex-col gap-2 p-3 bg-white border border-[#e5e7eb] rounded-md">
              {issues.map((issue, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: issue.color }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  <span className="text-sm text-[#1e2939] flex-1">{issue.text}</span>
                  <span className="text-xs text-[#6a7282]">{issue.time}</span>
                </div>
              ))}
              <div className="flex items-center gap-2 p-1 bg-[#f3f4f6] rounded-md mt-1">
                <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-[#2b7fff]">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.67 4L6 7.33L9.33 4" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="flex items-center gap-1 h-6">
                  <span className="text-sm font-semibold text-[#2b7fff]">2개</span>
                  <span className="text-sm text-[#030712]">추가 이상 감지중</span>
                </div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex flex-col gap-6">
            {/* CPU Usage */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center h-6">
                <span className="text-sm font-medium text-[#030712]">CPU Usage</span>
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
                      option={getAreaChartOption(cpuData, cpuTimes, '#00BCFF')}
                      style={{ height: '84px', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                  <span>{cpuTimes[0] || '00:00:00'}</span>
                  <span>{cpuTimes[Math.floor(cpuTimes.length / 2)] || '00:00:00'}</span>
                  <span>{cpuTimes[cpuTimes.length - 1] || '00:00:00'}</span>
                </div>
              </div>
            </div>

            {/* Active Session */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center h-6">
                <span className="text-sm font-medium text-[#030712]">Active Session (count)</span>
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
                      option={getAreaChartOption(sessionData, sessionTimes, '#00BCFF')}
                      style={{ height: '84px', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                  <span>{sessionTimes[0] || '00:00:00'}</span>
                  <span>{sessionTimes[Math.floor(sessionTimes.length / 2)] || '00:00:00'}</span>
                  <span>{sessionTimes[sessionTimes.length - 1] || '00:00:00'}</span>
                </div>
              </div>
            </div>

            {/* SQL Elapsed Time */}
            <div className="flex flex-col gap-3">
              <div className="flex items-center h-6">
                <span className="text-sm font-medium text-[#030712]">SQL Elapsed Time</span>
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
                      option={getScatterChartOption(sqlTimeData, sqlTimes, '#38bdf8')}
                      style={{ height: '84px', width: '100%' }}
                      opts={{ renderer: 'svg' }}
                    />
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-[#6a7282] pl-10">
                  <span>{sqlTimes[0] || '00:00:00'}</span>
                  <span>{sqlTimes[Math.floor(sqlTimes.length / 2)] || '00:00:00'}</span>
                  <span>{sqlTimes[sqlTimes.length - 1] || '00:00:00'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* 인스턴스 정보 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">인스턴스 정보</h3>
            
            {/* CPU 사용률 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#6a7282]">CPU 사용률</span>
                <span className="font-medium text-[#030712]">{block.cpuUsage}%</span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ 
                    width: `${block.cpuUsage}%`,
                    backgroundColor: getStatusColor(block.status)
                  }}
                />
              </div>
            </div>

            {/* 메모리 사용률 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#6a7282]">메모리 사용률</span>
                <span className="font-medium text-[#030712]">{metrics.memory}%</span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#38bdf8] rounded-full"
                  style={{ width: `${metrics.memory}%` }}
                />
              </div>
            </div>

            {/* 디스크 사용률 */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between text-sm">
                <span className="text-[#6a7282]">디스크 사용률</span>
                <span className="font-medium text-[#030712]">{metrics.disk}%</span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div 
                  className="h-full bg-[#a78bfa] rounded-full"
                  style={{ width: `${metrics.disk}%` }}
                />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* 성능 메트릭 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">성능 메트릭</h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* 활성 세션 */}
              <div className="flex flex-col gap-1 p-3 bg-[#f3f4f6] rounded-lg">
                <span className="text-xs text-[#6a7282]">활성 세션</span>
                <span className="text-xl font-bold text-[#030712]">{metrics.sessions}</span>
              </div>
              
              {/* 초당 트랜잭션 */}
              <div className="flex flex-col gap-1 p-3 bg-[#f3f4f6] rounded-lg">
                <span className="text-xs text-[#6a7282]">TPS</span>
                <span className="text-xl font-bold text-[#030712]">{metrics.transactions}</span>
              </div>
              
              {/* 평균 응답시간 */}
              <div className="flex flex-col gap-1 p-3 bg-[#f3f4f6] rounded-lg">
                <span className="text-xs text-[#6a7282]">응답 시간</span>
                <span className="text-xl font-bold text-[#030712]">{metrics.responseTime}ms</span>
              </div>
              
              {/* 대기 이벤트 */}
              <div className="flex flex-col gap-1 p-3 bg-[#f3f4f6] rounded-lg">
                <span className="text-xs text-[#6a7282]">대기 이벤트</span>
                <span className="text-xl font-bold text-[#030712]">{block.status !== 'normal' ? 3 : 0}</span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* RAC 연결 정보 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">RAC 연결 정보</h3>
            <div className="text-sm text-[#6a7282]">
              {block.connections.length}개의 인스턴스와 연결됨
            </div>
            <div className="flex flex-wrap gap-2">
              {block.connections.map((connId) => (
                <div 
                  key={connId}
                  className="px-2 py-1 bg-[#f3f4f6] rounded text-xs font-medium text-[#030712]"
                >
                  PROD{connId}
                </div>
              ))}
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* Top SQL */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">Top SQL</h3>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1 p-2 bg-[#f3f4f6] rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">SELECT * FROM orders WHERE...</span>
                  <span className="text-xs font-medium text-[#fb2c36]">{(block.cpuUsage * 10).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {metrics.transactions}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-[#f3f4f6] rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">UPDATE users SET status...</span>
                  <span className="text-xs font-medium text-[#fe9a00]">{(block.cpuUsage * 8).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {Math.floor(metrics.transactions * 0.7)}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-[#f3f4f6] rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">INSERT INTO logs VALUES...</span>
                  <span className="text-xs font-medium text-[#34d399]">{(block.cpuUsage * 5).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {Math.floor(metrics.transactions * 0.5)}</span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* 테이블스페이스 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">테이블스페이스</h3>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between text-xs">
                <span className="text-[#6a7282]">SYSTEM</span>
                <span className="font-medium text-[#030712]">2.4GB / 5GB</span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div className="h-full bg-[#38bdf8] rounded-full" style={{ width: '48%' }} />
              </div>
              
              <div className="flex justify-between text-xs mt-1">
                <span className="text-[#6a7282]">USERS</span>
                <span className="font-medium text-[#030712]">8.1GB / 10GB</span>
              </div>
              <div className="w-full h-2 bg-[#e5e7eb] rounded-full overflow-hidden">
                <div className="h-full bg-[#34d399] rounded-full" style={{ width: '81%' }} />
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-[#e5e7eb]" />

          {/* 최근 이벤트 */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">최근 이벤트</h3>
            <div className="flex flex-col gap-2">
              {block.status !== 'normal' && (
                <div className="flex gap-2 p-2 bg-[#fef3c6] rounded">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                    <path d="M8 4V8M8 10.5V11M3 13H13L8 4L3 13Z" stroke="#e17100" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-[#e17100]">CPU 사용률 이상 감지</p>
                    <p className="text-xs text-[#6a7282] mt-0.5">방금 전</p>
                  </div>
                </div>
              )}
              <div className="flex gap-2 p-2 bg-[#f3f4f6] rounded">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
                  <circle cx="8" cy="8" r="6" stroke="#6a7282" strokeWidth="1.5"/>
                  <path d="M8 5V8L10 10" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <div className="flex-1">
                  <p className="text-xs font-medium text-[#030712]">정상 작동 중</p>
                  <p className="text-xs text-[#6a7282] mt-0.5">5분 전</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI 진단 보고서 확인하기 버튼 */}
      <div className="p-5">
        <button 
          className="w-full flex items-center justify-center gap-1 px-2.5 h-12 rounded-md font-semibold text-white text-base"
          style={{
            background: 'linear-gradient(151deg, rgba(0, 188, 255, 1) 0%, rgba(142, 81, 255, 1) 100%)'
          }}
        >
          <span>AI 진단 보고서 확인하기</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M8 15L13 10L8 5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}
