'use client';

import { useState, useMemo, useEffect } from 'react';

interface CalendarMonth {
  year: number;
  month: number; // 0-indexed
}

const getInitialMonth = (selectedDate?: string | null): CalendarMonth => {
  if (selectedDate) {
    const [year, month] = selectedDate.split('-');
    return {
      year: Number(year),
      month: Number(month) - 1,
    };
  }

  if (typeof window !== 'undefined') {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }

  // 서버 렌더링 시의 기본값 (데모 기준 2025년 11월)
  const fallback = new Date('2025-11-01T00:00:00');
  return { year: fallback.getFullYear(), month: fallback.getMonth() };
};

interface ReportCalendarProps {
  reportDates: string[]; // "2025-10-06" 형식의 날짜 배열
  selectedDate?: string | null;
  onDateSelect?: (date: string | null) => void;
}

const ReportCalendar = ({ reportDates, selectedDate, onDateSelect }: ReportCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState<CalendarMonth>(() => getInitialMonth(selectedDate));

  // 리포트가 발행된 날짜를 Set으로 변환 (빠른 검색)
  const reportDatesSet = useMemo(() => {
    return new Set(
      reportDates.map((dateStr) => {
        const [datePart] = dateStr.split(' ');
        return datePart;
      })
    );
  }, [reportDates]);

  useEffect(() => {
    if (selectedDate) {
      setCurrentMonth(getInitialMonth(selectedDate));
      return;
    }

    if (typeof window !== 'undefined') {
      setCurrentMonth((prev) => {
        const now = new Date();
        if (prev.year === now.getFullYear() && prev.month === now.getMonth()) {
          return prev;
        }
        return { year: now.getFullYear(), month: now.getMonth() };
      });
    }
  }, [selectedDate]);

  const { year, month } = currentMonth;

  // 해당 월의 첫날과 마지막날
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // 달력 시작 요일 (0 = 일요일)
  const startDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // 날짜 선택 핸들러
  const handleDateClick = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    
    if (onDateSelect) {
      // 같은 날짜를 다시 클릭하면 선택 해제
      if (selectedDate === dateStr) {
        onDateSelect(null);
      } else {
        onDateSelect(dateStr);
      }
    }
  };

  // 이전 달로 이동
  const goToPreviousMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  // 다음 달로 이동
  const goToNextMonth = () => {
    setCurrentMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // 달력 그리드 생성
  const renderCalendar = () => {
    const days = [];
    
    // 빈 칸 채우기 (이전 달 날짜)
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="aspect-square" />);
    }

    // 현재 달 날짜
    for (let day = 1; day <= daysInMonth; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const hasReport = reportDatesSet.has(dateStr);
      const isSelected = selectedDate === dateStr;

      days.push(
        <button
          key={day}
          type="button"
          aria-pressed={isSelected}
          onClick={() => handleDateClick(day)}
          className={`relative flex flex-col items-center justify-center w-9 h-9 rounded-full text-[14px] transition-colors ${
            isSelected
              ? 'border border-[#ef4444] text-[#ef4444] font-semibold bg-white shadow-[0_0_0_4px_rgba(248,113,113,0.15)]'
              : 'text-[#030712] hover:bg-[#f3f4f6]'
          }`}
        >
          <span>{day}</span>
          {hasReport && (
            <div
              className={`absolute bottom-0.5 w-1.5 h-1.5 rounded-full ${
                isSelected ? 'bg-[#ef4444]' : 'bg-[#ef4444]'
              }`}
            />
          )}
        </button>
      );
    }

    return days;
  };

  const monthNames = [
    '1월', '2월', '3월', '4월', '5월', '6월',
    '7월', '8월', '9월', '10월', '11월', '12월'
  ];

  return (
    <div className="w-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={goToPreviousMonth}
          className="w-8 h-8 flex items-center justify-center rounded-[4px] hover:bg-[#f3f4f6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10 12L6 8L10 4" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
        <span className="text-[14px] font-semibold text-[#030712]">
          {year}년 {monthNames[month]}
        </span>
        <button
          onClick={goToNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-[4px] hover:bg-[#f3f4f6] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M6 12L10 8L6 4" stroke="#6a7282" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
          <div
            key={day}
            className={`text-center text-[12px] font-medium ${
              index === 0 ? 'text-red-500' : index === 6 ? 'text-blue-500' : 'text-[#6a7282]'
            }`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {renderCalendar()}
      </div>
    </div>
  );
};

export default ReportCalendar;

