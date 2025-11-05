"use client";

interface SegmentedControlProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}

export default function SegmentedControl({
  options,
  value,
  onChange,
}: SegmentedControlProps) {
  return (
    <div className="bg-[#f3f4f6] rounded-sm p-[2px] flex items-center justify-center">
      <div className="flex items-center gap-1">
        {options.map((option) => {
          const isSelected = value === option.value;
          return (
            <button
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`
                px-3 py-1.5 rounded-sm
                text-[14px] font-medium leading-[1.4]
                transition-all duration-200
                flex items-center justify-center
                flex-1 min-w-0
                whitespace-nowrap
                ${
                  isSelected
                    ? "bg-white text-[#030712] shadow-[0px_0px_16px_0px_rgba(3,7,18,0.08)]"
                    : "text-[#6a7282] hover:text-[#030712]"
                }
              `}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
