import * as React from "react";
import { useRef, useEffect, useState } from "react";
import { cn } from "./utils";
import { useTheme } from "../../contexts/ThemeContext";

interface FilterToggleOption {
  value: string;
  label: string;
}

interface FilterToggleProps {
  options: FilterToggleOption[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function FilterToggle({ options, value, onChange, className }: FilterToggleProps) {
  const { isDark } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({ width: 0, left: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    
    const selectedIndex = options.findIndex(opt => opt.value === value);
    const buttons = containerRef.current.querySelectorAll('button');
    
    if (buttons[selectedIndex]) {
      const button = buttons[selectedIndex] as HTMLButtonElement;
      setSliderStyle({
        width: button.offsetWidth,
        left: button.offsetLeft,
      });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex rounded-lg p-1",
        isDark ? "bg-[#2a2a2a]" : "bg-[#F3F5FF]",
        className
      )}
      role="tablist"
    >
      <div
        className={cn(
          "absolute bg-white h-[calc(100%-8px)] top-1 rounded-md shadow-sm transition-all duration-300 ease-in-out"
        )}
        style={{ width: sliderStyle.width, left: sliderStyle.left }}
        aria-hidden="true"
      />

      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          role="tab"
          aria-selected={value === option.value}
          className={cn(
            "relative px-4 py-2 rounded-md transition-all duration-200 z-10 text-sm whitespace-nowrap",
            value === option.value
              ? "text-[#2f2f2f] font-medium"
              : isDark
                ? "text-gray-400 hover:text-gray-300"
                : "text-gray-600 hover:text-gray-700"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
