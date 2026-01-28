import * as React from "react";
import { cn } from "./utils";

type StatusVariant = "success" | "warning" | "error" | "neutral" | "info";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

// Figma-based styles matching Estados de Formulario design
const variantStyles: Record<StatusVariant, { bg: string; border: string; text: string; dot: string }> = {
  success: {
    bg: "bg-[#DCFCE7]",
    border: "border-[#22C55E]",
    text: "text-[#15803D]",
    dot: "bg-[#22C55E]",
  },
  warning: {
    bg: "bg-[#FEF3C7]",
    border: "border-[#F59E0B]",
    text: "text-[#B45309]",
    dot: "bg-[#F59E0B]",
  },
  error: {
    bg: "bg-[#FEE2E2]",
    border: "border-[#EF4444]",
    text: "text-[#DC2626]",
    dot: "bg-[#EF4444]",
  },
  neutral: {
    bg: "bg-[#E5E7EB]",
    border: "border-[#E5E7EB]",
    text: "text-[#6B7280]",
    dot: "bg-[#6B7280]",
  },
  info: {
    bg: "bg-[#DBEAFE]",
    border: "border-[#3B82F6]",
    text: "text-[#1D4ED8]",
    dot: "bg-[#3B82F6]",
  },
};

export function StatusBadge({ label, variant = "neutral", className }: StatusBadgeProps) {
  const styles = variantStyles[variant];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full border text-xs font-medium whitespace-nowrap",
        styles.bg,
        styles.border,
        styles.text,
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full flex-shrink-0", styles.dot)} />
      {label}
    </span>
  );
}
