/**
 * Format a number as currency (es-AR locale).
 * Supports optional currency code and string/number input.
 */
export function formatCurrency(val: number | string, moneda: string = 'ARS'): string {
  const num = typeof val === 'string' ? parseFloat(val) : val;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda,
    minimumFractionDigits: 0,
  }).format(num);
}
