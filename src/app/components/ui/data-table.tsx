import * as React from "react";
import { cn } from "./utils";
import { useTheme } from "../../contexts/ThemeContext";

interface DataTableProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTable({ children, className }: DataTableProps) {
  const { isDark } = useTheme();

  return (
    <div
      className={cn(
        "rounded-lg border overflow-hidden",
        isDark ? "border-gray-800" : "border-gray-200",
        className
      )}
    >
      <div className="overflow-x-auto">
        <table className="w-full">{children}</table>
      </div>
    </div>
  );
}

interface DataTableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHead({ children, className }: DataTableHeadProps) {
  const { isDark } = useTheme();

  return (
    <thead className={cn(isDark ? "bg-[#1e1e1e]" : "bg-[#fcfcfd]", className)}>
      {children}
    </thead>
  );
}

interface DataTableHeaderCellProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableHeaderCell({ children, className }: DataTableHeaderCellProps) {
  const { isDark } = useTheme();

  return (
    <th
      className={cn(
        "px-6 py-3 text-left text-xs font-bold whitespace-nowrap border-b",
        isDark ? "text-gray-400 border-gray-800" : "text-[#667085] border-[#eaecf0]",
        className
      )}
    >
      {children}
    </th>
  );
}

interface DataTableBodyProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableBody({ children, className }: DataTableBodyProps) {
  return <tbody className={className}>{children}</tbody>;
}

interface DataTableRowProps {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function DataTableRow({ children, onClick, className }: DataTableRowProps) {
  const { isDark } = useTheme();

  return (
    <tr
      onClick={onClick}
      className={cn(
        isDark ? "bg-[#141414] hover:bg-[#1a1a1a]" : "bg-white hover:bg-gray-50",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </tr>
  );
}

interface DataTableCellProps {
  children: React.ReactNode;
  muted?: boolean;
  className?: string;
}

export function DataTableCell({ children, muted = false, className }: DataTableCellProps) {
  const { isDark } = useTheme();

  return (
    <td
      className={cn(
        "px-6 py-3 text-sm whitespace-nowrap border-b",
        isDark ? "border-gray-800" : "border-[#eaecf0]",
        muted
          ? isDark
            ? "text-gray-400"
            : "text-[#667085]"
          : isDark
            ? "text-white"
            : "text-[#1d1d1d]",
        className
      )}
    >
      {children}
    </td>
  );
}

interface DataTableEmptyProps {
  colSpan: number;
  children: React.ReactNode;
}

export function DataTableEmpty({ colSpan, children }: DataTableEmptyProps) {
  const { isDark } = useTheme();

  return (
    <tr>
      <td
        colSpan={colSpan}
        className={cn(
          "px-6 py-12 text-center text-sm",
          isDark ? "text-gray-500 bg-[#141414]" : "text-gray-500 bg-white"
        )}
      >
        {children}
      </td>
    </tr>
  );
}
