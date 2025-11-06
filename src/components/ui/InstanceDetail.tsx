'use client';

import { BlockData } from './Block3D';
import { useMemo, useState, useEffect } from 'react';
import ReactECharts from 'echarts-for-react';
import ReportCard from './ReportCard';

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

  // 선택한 인스턴스에 대한 이상 탐지 이력 데이터
  const instanceReports = useMemo(() => {
    const serverName = `PRODRAC${block.id}P`;
    // 같은 인스턴스에 대한 여러 이상 탐지 이벤트를 시뮬레이션
    // 실제로는 각 이벤트가 다른 시간에 발생했지만, 모두 같은 인스턴스의 이벤트
    return [
      { id: serverName, server: serverName, time: '2025-10-06 12:39', metric: 'SQL Elapsed Time', badge: '+3', selected: true },
      { id: serverName, server: serverName, time: '2025-10-04 07:55', metric: 'Active Session', badge: null, selected: false },
      { id: serverName, server: serverName, time: '2025-10-03 18:21', metric: 'Total Wait Time', badge: '+1', selected: false },
      { id: serverName, server: serverName, time: '2025-10-02 14:10', metric: 'Buffer Busy Wait', badge: null, selected: false },
    ];
  }, [block.id]);

  // 표시할 리포트 개수 상태 (초기값 2개)
  const [visibleReportsCount, setVisibleReportsCount] = useState(2);

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
          {/* 이상 탐지 이력 */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between h-7">
              <div className="flex items-center gap-2 font-semibold text-base">
                <span className="text-gray-900">이상 탐지 이력</span>
                <span className="text-sky-500">{instanceReports.length}</span>
              </div>
              <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M14.3662 3.11528C14.6666 2.95723 15.0265 2.96246 15.3223 3.12895L18.165 4.72856L18.2744 4.79985C18.516 4.98097 18.6647 5.26385 18.6738 5.57035L18.751 8.16703L21.0225 9.54008C21.322 9.72112 21.5048 10.0456 21.5049 10.3955V13.6006C21.5049 13.9511 21.3216 14.2761 21.0215 14.4571L18.751 15.8252L18.6719 18.4239C18.6611 18.7731 18.4682 19.0917 18.1641 19.2637L15.3242 20.8702C15.0281 21.0377 14.6673 21.0432 14.3662 20.8848L11.998 19.6387L9.63086 20.8848C9.33049 21.0428 8.97057 21.0376 8.6748 20.8711L5.83203 19.2715C5.52661 19.0996 5.33365 18.7801 5.32324 18.4297L5.24512 15.8321L2.97363 14.459C2.67392 14.278 2.4903 13.9537 2.49023 13.6036V10.3985C2.49023 10.0481 2.6736 9.72304 2.97363 9.54203L5.24414 8.17289L5.32422 5.57524L5.33691 5.44535C5.38523 5.14816 5.56586 4.8858 5.83203 4.73539L8.67285 3.12895L8.78711 3.07426C9.05855 2.96336 9.3676 2.97676 9.63086 3.11528L11.998 4.36039L14.3662 3.11528ZM12.4639 6.37602C12.1725 6.52914 11.8245 6.52919 11.5332 6.37602L9.18262 5.13871L7.30566 6.19926L7.22656 8.77836C7.21612 9.11772 7.0339 9.4292 6.74316 9.60453L4.49023 10.9629V13.0391L6.74609 14.4024L6.85059 14.4737C7.08023 14.6555 7.21969 14.9315 7.22852 15.2286L7.30469 17.8047L9.18066 18.8614L11.5332 17.6241L11.6445 17.5743C11.9104 17.4735 12.2088 17.49 12.4639 17.6241L14.8145 18.8604L16.6895 17.7998L16.7686 15.2207L16.7812 15.0948C16.8271 14.8056 16.9976 14.548 17.252 14.3946L19.5049 13.0362V10.959L17.251 9.5977C16.9603 9.42208 16.7786 9.111 16.7686 8.77153L16.6914 6.19438L14.8154 5.13774L12.4639 6.37602ZM13.999 12C13.999 10.8956 13.1034 10.0003 11.999 10C10.8945 10 9.99902 10.8955 9.99902 12C9.99902 13.1046 10.8945 14 11.999 14C13.1034 13.9998 13.999 13.1045 13.999 12ZM15.999 12C15.999 14.209 14.208 15.9998 11.999 16C9.78988 16 7.99902 14.2092 7.99902 12C7.99902 9.7909 9.78988 8.00004 11.999 8.00004C14.208 8.00028 15.999 9.79105 15.999 12Z" fill="#9ca3af"/>
                </svg>
              </button>
            </div>

            <div className="flex flex-col gap-2">
              {instanceReports.slice(0, visibleReportsCount).map((report, index) => (
                <ReportCard
                  key={`${report.server}-${index}`}
                  id={report.id}
                  server={report.server}
                  time={report.time}
                  metric={report.metric}
                  badge={report.badge}
                  selected={report.selected}
                />
              ))}
              
              {/* 더 불러오기 버튼 */}
              {visibleReportsCount < instanceReports.length && (
                <button
                  onClick={() => setVisibleReportsCount(instanceReports.length)}
                  className="flex items-center justify-center gap-2 h-10 px-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  <img src="/plus.svg" alt="Plus" className="w-4 h-4" />
                  <span className="text-sm font-medium text-[#030712]">더 불러오기</span>
                </button>
              )}
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
          <div className="h-px bg-gray-200" />


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
          <div className="h-px bg-gray-200" />

          {/* Top SQL */}
          <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-[#030712]">Top SQL</h3>
            <div className="flex flex-col gap-2">
              <div className="flex flex-col gap-1 p-2 bg-gray-100 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">SELECT * FROM orders WHERE...</span>
                  <span className="text-xs font-medium text-[#fb2c36]">{(block.cpuUsage * 10).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {metrics.transactions}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-gray-100 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">UPDATE users SET status...</span>
                  <span className="text-xs font-medium text-[#fe9a00]">{(block.cpuUsage * 8).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {Math.floor(metrics.transactions * 0.7)}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 bg-gray-100 rounded">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-mono text-[#030712] flex-1">INSERT INTO logs VALUES...</span>
                  <span className="text-xs font-medium text-[#34d399]">{(block.cpuUsage * 5).toFixed(1)}ms</span>
                </div>
                <span className="text-xs text-[#6a7282]">실행 횟수: {Math.floor(metrics.transactions * 0.5)}</span>
              </div>
            </div>
          </div>

          {/* 구분선 */}
          <div className="h-px bg-gray-200" />

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
    </div>
  );
}
