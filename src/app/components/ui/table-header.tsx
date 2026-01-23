import * as React from "react";
import { Search } from "lucide-react";
import { cn } from "./utils";
import { Input } from "./input";
import { useTheme } from "../../contexts/ThemeContext";

interface TableHeaderProps {
  title: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  className?: string;
}

export function TableHeader({
  title,
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  children,
  className,
}: TableHeaderProps) {
  const { isDark } = useTheme();

  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <h2 className={cn("text-lg font-semibold", isDark ? "text-white" : "text-gray-900")}>
        {title}
      </h2>

      <div className="flex items-center gap-3">
        {onSearchChange && (
          <div className="relative w-64">
            <Search
              className={cn(
                "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4",
                isDark ? "text-gray-500" : "text-gray-400"
              )}
            />
            <Input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className={cn(
                "pl-10",
                isDark
                  ? "bg-[#1e1e1e] border-gray-800 text-white placeholder:text-gray-600 focus:border-[#fb2c36]"
                  : "bg-white border-gray-300 text-gray-900 placeholder:text-gray-400 focus:border-[#fb2c36]"
              )}
            />
          </div>
        )}
        {children}
      </div>
    </div>
  );
}
