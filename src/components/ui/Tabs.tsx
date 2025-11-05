"use client";

interface TabsProps {
  tabs: { value: string; label: string; icon?: React.ReactNode }[];
  value: string;
  onChange: (value: string) => void;
}

export default function Tabs({ tabs, value, onChange }: TabsProps) {
  return (
    <div className="flex items-center border-b border-[#e5e7eb]">
      {tabs.map((tab) => {
        const isSelected = value === tab.value;
        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={`
              flex items-center justify-center gap-2
              pl-3 pr-3.5 h-[40px]
              text-[16px] font-semibold leading-[1.4]
              transition-colors
              relative
              ${isSelected ? 'text-[#030712]' : 'text-[#6a7282] hover:text-[#030712]'}
            `}
          >
            {tab.icon && (
              <div className="w-4 h-4 flex items-center justify-center flex-shrink-0">
                {tab.icon}
              </div>
            )}
            <span>{tab.label}</span>
            {isSelected && (
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#030712]" />
            )}
          </button>
        );
      })}
    </div>
  );
}
