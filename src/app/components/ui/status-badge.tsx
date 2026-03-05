import * as React from "react";
import { cn } from "./utils";

type StatusVariant = "success" | "warning" | "error" | "neutral" | "info" | "pending-factura";

interface StatusBadgeProps {
  label: string;
  variant?: StatusVariant;
  className?: string;
}

// Figma-based styles matching Estados de Pago (Pendiente/Pagado/Factura)
const variantStyles: Record<StatusVariant, { bg: string; border: string; text: string; dot: string }> = {
  success: {
    bg: "bg-[#ecffe9]",
    border: "border-[#118f00]",
    text: "text-[#118f00]",
    dot: "bg-[#118f00]",
  },
  warning: {
    bg: "bg-[#fffae8]",
    border: "border-[#f76517]",
    text: "text-[#f76517]",
    dot: "bg-[#f76517]",
  },
  error: {
    bg: "bg-[#ffebef]",
    border: "border-[#ea173e]",
    text: "text-[#ea173e]",
    dot: "bg-[#ea173e]",
  },
  neutral: {
    bg: "bg-[#E5E7EB]",
    border: "border-[#9CA3AF]",
    text: "text-[#6B7280]",
    dot: "bg-[#6B7280]",
  },
  info: {
    bg: "bg-[#DBEAFE]",
    border: "border-[#3B82F6]",
    text: "text-[#1D4ED8]",
    dot: "bg-[#3B82F6]",
  },
  "pending-factura": {
    bg: "bg-[#fffae8]",
    border: "border-[#8f6e00]",
    text: "text-[#8f6e00]",
    dot: "bg-[#8f6e00]",
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
