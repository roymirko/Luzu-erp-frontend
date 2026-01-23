import * as React from "react";
import { Input } from "./input";
import { cn } from "./utils";

interface CurrencyInputProps {
  value: number | string;
  onChange: (value: number) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

export function CurrencyInput({
  value,
  onChange,
  placeholder = "$0",
  disabled = false,
  className,
}: CurrencyInputProps) {
  const formatDisplay = (val: number | string): string => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num) || num === 0) return "";
    return new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const parseValue = (formattedValue: string): number => {
    const numericString = formattedValue.replace(/[^0-9]/g, "");
    return parseInt(numericString, 10) || 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value;
    const numericValue = parseValue(rawValue);
    onChange(numericValue);
  };

  return (
    <Input
      type="text"
      inputMode="numeric"
      value={formatDisplay(value)}
      onChange={handleChange}
      placeholder={placeholder}
      disabled={disabled}
      className={cn(className)}
    />
  );
}
