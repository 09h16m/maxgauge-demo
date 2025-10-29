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
      {/* 이상 탐지 이력 */}
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between h-7">
          <div className="flex items-center gap-2 font-semibold text-base">
            <span className="text-gray-900">이상 탐지 이력</span>
            <span className="text-sky-500">4</span>
          </div>
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3662 3.11528C14.6666 2.95723 15.0265 2.96246 15.3223 3.12895L18.165 4.72856L18.2744 4.79985C18.516 4.98097 18.6647 5.26385 18.6738 5.57035L18.751 8.16703L21.0225 9.54008C21.322 9.72112 21.5048 10.0456 21.5049 10.3955V13.6006C21.5049 13.9511 21.3216 14.2761 21.0215 14.4571L18.751 15.8252L18.6719 18.4239C18.6611 18.7731 18.4682 19.0917 18.1641 19.2637L15.3242 20.8702C15.0281 21.0377 14.6673 21.0432 14.3662 20.8848L11.998 19.6387L9.63086 20.8848C9.33049 21.0428 8.97057 21.0376 8.6748 20.8711L5.83203 19.2715C5.52661 19.0996 5.33365 18.7801 5.32324 18.4297L5.24512 15.8321L2.97363 14.459C2.67392 14.278 2.4903 13.9537 2.49023 13.6036V10.3985C2.49023 10.0481 2.6736 9.72304 2.97363 9.54203L5.24414 8.17289L5.32422 5.57524L5.33691 5.44535C5.38523 5.14816 5.56586 4.8858 5.83203 4.73539L8.67285 3.12895L8.78711 3.07426C9.05855 2.96336 9.3676 2.97676 9.63086 3.11528L11.998 4.36039L14.3662 3.11528ZM12.4639 6.37602C12.1725 6.52914 11.8245 6.52919 11.5332 6.37602L9.18262 5.13871L7.30566 6.19926L7.22656 8.77836C7.21612 9.11772 7.0339 9.4292 6.74316 9.60453L4.49023 10.9629V13.0391L6.74609 14.4024L6.85059 14.4737C7.08023 14.6555 7.21969 14.9315 7.22852 15.2286L7.30469 17.8047L9.18066 18.8614L11.5332 17.6241L11.6445 17.5743C11.9104 17.4735 12.2088 17.49 12.4639 17.6241L14.8145 18.8604L16.6895 17.7998L16.7686 15.2207L16.7812 15.0948C16.8271 14.8056 16.9976 14.548 17.252 14.3946L19.5049 13.0362V10.959L17.251 9.5977C16.9603 9.42208 16.7786 9.111 16.7686 8.77153L16.6914 6.19438L14.8154 5.13774L12.4639 6.37602ZM13.999 12C13.999 10.8956 13.1034 10.0003 11.999 10C10.8945 10 9.99902 10.8955 9.99902 12C9.99902 13.1046 10.8945 14 11.999 14C13.1034 13.9998 13.999 13.1045 13.999 12ZM15.999 12C15.999 14.209 14.208 15.9998 11.999 16C9.78988 16 7.99902 14.2092 7.99902 12C7.99902 9.7909 9.78988 8.00004 11.999 8.00004C14.208 8.00028 15.999 9.79105 15.999 12Z" fill="#9ca3af"/>
            </svg>
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
                  <span className="text-xs text-[#6a7282]">최초 이상 감지</span>
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
          <button className="w-7 h-7 rounded-md flex items-center justify-center hover:bg-gray-100 transition-colors">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14.3662 3.11528C14.6666 2.95723 15.0265 2.96246 15.3223 3.12895L18.165 4.72856L18.2744 4.79985C18.516 4.98097 18.6647 5.26385 18.6738 5.57035L18.751 8.16703L21.0225 9.54008C21.322 9.72112 21.5048 10.0456 21.5049 10.3955V13.6006C21.5049 13.9511 21.3216 14.2761 21.0215 14.4571L18.751 15.8252L18.6719 18.4239C18.6611 18.7731 18.4682 19.0917 18.1641 19.2637L15.3242 20.8702C15.0281 21.0377 14.6673 21.0432 14.3662 20.8848L11.998 19.6387L9.63086 20.8848C9.33049 21.0428 8.97057 21.0376 8.6748 20.8711L5.83203 19.2715C5.52661 19.0996 5.33365 18.7801 5.32324 18.4297L5.24512 15.8321L2.97363 14.459C2.67392 14.278 2.4903 13.9537 2.49023 13.6036V10.3985C2.49023 10.0481 2.6736 9.72304 2.97363 9.54203L5.24414 8.17289L5.32422 5.57524L5.33691 5.44535C5.38523 5.14816 5.56586 4.8858 5.83203 4.73539L8.67285 3.12895L8.78711 3.07426C9.05855 2.96336 9.3676 2.97676 9.63086 3.11528L11.998 4.36039L14.3662 3.11528ZM12.4639 6.37602C12.1725 6.52914 11.8245 6.52919 11.5332 6.37602L9.18262 5.13871L7.30566 6.19926L7.22656 8.77836C7.21612 9.11772 7.0339 9.4292 6.74316 9.60453L4.49023 10.9629V13.0391L6.74609 14.4024L6.85059 14.4737C7.08023 14.6555 7.21969 14.9315 7.22852 15.2286L7.30469 17.8047L9.18066 18.8614L11.5332 17.6241L11.6445 17.5743C11.9104 17.4735 12.2088 17.49 12.4639 17.6241L14.8145 18.8604L16.6895 17.7998L16.7686 15.2207L16.7812 15.0948C16.8271 14.8056 16.9976 14.548 17.252 14.3946L19.5049 13.0362V10.959L17.251 9.5977C16.9603 9.42208 16.7786 9.111 16.7686 8.77153L16.6914 6.19438L14.8154 5.13774L12.4639 6.37602ZM13.999 12C13.999 10.8956 13.1034 10.0003 11.999 10C10.8945 10 9.99902 10.8955 9.99902 12C9.99902 13.1046 10.8945 14 11.999 14C13.1034 13.9998 13.999 13.1045 13.999 12ZM15.999 12C15.999 14.209 14.208 15.9998 11.999 16C9.78988 16 7.99902 14.2092 7.99902 12C7.99902 9.7909 9.78988 8.00004 11.999 8.00004C14.208 8.00028 15.999 9.79105 15.999 12Z" fill="#9ca3af"/>
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

