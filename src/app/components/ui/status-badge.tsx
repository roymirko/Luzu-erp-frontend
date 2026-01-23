import * as React from "react";
import { cn } from "./utils";
import { useTheme } from "../../contexts/ThemeContext";

type StatusVariant = "success" | "warning" | "error" | "neutral" | "info";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

const variantStyles: Record<StatusVariant, string> = {
  success: "bg-green-400",
  warning: "bg-yellow-400",
  error: "bg-red-400",
  neutral: "bg-gray-400",
  info: "bg-blue-400",
};

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps) {
  const { isDark } = useTheme();

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className={cn("h-2.5 w-2.5 rounded-full", variantStyles[variant])} />
      <span className={isDark ? "text-gray-300" : "text-gray-700"}>{label}</span>
    </span>
  );
}
