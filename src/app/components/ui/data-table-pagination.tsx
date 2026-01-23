import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "./utils";
import { Button } from "./button";
import { useTheme } from "../../contexts/ThemeContext";

interface DataTablePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

export function DataTablePagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
}: DataTablePaginationProps) {
  const { isDark } = useTheme();

  if (totalPages <= 1) return null;

  const getPageNumbers = (): (number | "...")[] => {
    const pages: (number | "...")[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 4) pages.push("...");
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 3) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePrevPage = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNextPage = () => onPageChange(Math.min(totalPages, currentPage + 1));

  return (
    <div className={cn("flex items-center justify-center py-4", className)}>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevPage}
          disabled={currentPage === 1}
          className={cn(
            isDark
              ? "border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-1">
          {getPageNumbers().map((page, index) =>
            page === "..." ? (
              <span
                key={`ellipsis-${index}`}
                className={cn("px-2", isDark ? "text-gray-600" : "text-gray-400")}
              >
                ...
              </span>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(page)}
                className={cn(
                  "min-w-[32px]",
                  currentPage === page
                    ? "bg-[#fb2c36] text-white hover:bg-[#fb2c36]/90"
                    : isDark
                      ? "border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                {page}
              </Button>
            )
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={currentPage === totalPages}
          className={cn(
            isDark
              ? "border-gray-800 text-gray-400 hover:bg-[#1e1e1e] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              : "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
          )}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
