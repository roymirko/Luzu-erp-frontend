"use client";

import * as React from "react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { CalendarIcon } from "lucide-react";
import { cn } from "./utils";
import { Calendar } from "./calendar";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Label } from "./label";
import { useTheme } from "../../contexts/ThemeContext";

interface FormDatePickerProps {
  label: string;
  value: string; // YYYY-MM-DD format
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  isDark?: boolean;
  placeholder?: string;
}

export function FormDatePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  error,
  isDark: isDarkProp,
  placeholder = "Seleccionar fecha",
}: FormDatePickerProps) {
  const { isDark: themeIsDark } = useTheme();
  const isDark = isDarkProp ?? themeIsDark;
  const [open, setOpen] = React.useState(false);

  // Parse value to Date object
  const selectedDate = value ? new Date(value + "T00:00:00") : undefined;

  // Format date for display (DD/MM/YYYY)
  const displayValue = selectedDate
    ? format(selectedDate, "dd/MM/yyyy", { locale: es })
    : "";

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      // Convert to YYYY-MM-DD format for the value
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      onChange(`${year}-${month}-${day}`);
    } else {
      onChange("");
    }
    setOpen(false);
  };

  const labelClass = cn(
    "flex items-center gap-1 text-sm font-semibold",
    isDark ? "text-gray-400" : "text-[#374151]"
  );

  return (
    <div className="space-y-1">
      <Label className={labelClass}>
        {label}
        {required && <span className="text-red-500">*</span>}
      </Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            onClick={(e) => {
              e.stopPropagation();
              if (!disabled) setOpen(true);
            }}
            className={cn(
              "flex items-center w-full justify-start text-left font-normal h-10 px-3 rounded-md border text-sm",
              isDark
                ? "bg-[#141414] border-gray-800 text-white hover:bg-[#1e1e1e]"
                : "bg-white border-[#d1d5db] text-gray-900 hover:bg-gray-50",
              !displayValue && (isDark ? "text-gray-600" : "text-[#d1d5db]"),
              error && "border-red-500",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4 flex-shrink-0" />
            {displayValue || placeholder}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className={cn(
            "w-auto p-0",
            isDark ? "bg-[#1e1e1e] border-gray-700" : "bg-white"
          )}
          align="start"
        >
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={handleSelect}
            defaultMonth={selectedDate || new Date()}
            locale={es}
            className={cn(
              isDark && "[&_.rdp-day]:text-white [&_.rdp-caption_label]:text-white [&_.rdp-head_cell]:text-gray-400 [&_.rdp-button:hover]:bg-gray-700 [&_.rdp-day_selected]:bg-[#0070ff] [&_.rdp-day_today]:bg-gray-700"
            )}
          />
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
