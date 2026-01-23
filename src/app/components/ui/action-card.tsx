import * as React from "react";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { cn } from "./utils";
import { useTheme } from "../../contexts/ThemeContext";

interface ActionCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  className?: string;
}

export function ActionCard({ title, description, icon: Icon, onClick, className }: ActionCardProps) {
  const { isDark } = useTheme();

  return (
    <div
      onClick={onClick}
      className={cn(
        "p-4 border rounded-lg hover:border-[#fb2c36] transition-all cursor-pointer group inline-flex items-center gap-3 w-[320px]",
        isDark
          ? "bg-[#1e1e1e] border-gray-800"
          : "bg-white border-gray-200",
        className
      )}
    >
      <div className="bg-[#fb2c36]/20 p-2.5 rounded-lg group-hover:bg-[#fb2c36]/30 transition-colors">
        <Icon className="h-5 w-5 text-[#fb2c36]" />
      </div>
      <div>
        <h3 className={cn("font-medium", isDark ? "text-white" : "text-gray-900")}>
          {title}
        </h3>
        <p className={cn("text-xs", isDark ? "text-gray-500" : "text-gray-600")}>
          {description}
        </p>
      </div>
      <ChevronRight
        className={cn(
          "h-4 w-4 ml-auto group-hover:text-[#fb2c36] transition-colors",
          isDark ? "text-gray-600" : "text-gray-400"
        )}
      />
    </div>
  );
}
