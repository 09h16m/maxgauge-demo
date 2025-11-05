"use client";

interface TimelineEvent {
  title: string;
  server: string;
  time: string;
  type: 'normal' | 'warning';
}

const timelineEvents: TimelineEvent[] = [
  { title: 'SQL Plan 변경 감지', server: 'DB-SERVER-01', time: '2025-09-01 07:30', type: 'normal' },
  { title: 'SQL Elapsed Time 증가', server: 'DB-SERVER-01', time: '2025-09-01 07:30', type: 'normal' },
  { title: 'Active Sessions 증가', server: 'DB-SERVER-01', time: '2025-09-01 07:30', type: 'warning' },
  { title: 'CPU(%) 증가', server: 'DB-SERVER-01', time: '2025-09-01 07:30', type: 'normal' },
  { title: 'Total Wait Time 증가', server: 'DB-SERVER-01', time: '2025-09-01 07:30', type: 'warning' },
];

export default function FlowTimeline() {
  return (
    <div className="w-full h-[400px] bg-white rounded-[6px] p-8 flex items-center">
      <div className="w-full">
        {/* Timeline line and dots */}
        <div className="relative">
          {/* Line segments */}
          <div className="absolute top-6 left-0 right-0 h-1 flex">
            {timelineEvents.map((event, index) => {
              if (index === timelineEvents.length - 1) return null;
              const nextEvent = timelineEvents[index + 1];
              const isWarning = event.type === 'warning' || nextEvent.type === 'warning';
              
              return (
                <div
                  key={index}
                  className={`h-1 flex-1 ${isWarning ? 'bg-[#ef4444]' : 'bg-[#eab308]'}`}
                />
              );
            })}
          </div>

          {/* Timeline dots and labels */}
          <div className="relative flex justify-between">
            {timelineEvents.map((event, index) => (
              <div key={index} className="flex flex-col items-center" style={{ flex: 1 }}>
                {/* Dot */}
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center z-10 ${
                    event.type === 'warning'
                      ? 'bg-[#ef4444] shadow-lg shadow-red-200'
                      : 'bg-[#eab308] shadow-lg shadow-yellow-200'
                  }`}
                />
                
                {/* Event info */}
                <div className="mt-4 text-center max-w-[180px]">
                  <div className="text-sm font-semibold text-[#030712] mb-1">
                    {event.title}
                  </div>
                  <div className="text-xs text-[#6a7282]">
                    {event.server}
                  </div>
                  <div className="text-xs text-[#6a7282]">
                    {event.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
