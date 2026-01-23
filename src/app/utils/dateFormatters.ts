/**
 * Date formatting utilities for consistent date display across the app
 * All formats follow Argentine conventions (es-AR)
 */

/**
 * Format date as DD/MM/YYYY
 * Used for: Fecha de registro, Fecha de factura, etc.
 */
export function formatDateDDMMYYYY(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${day}/${month}/${year}`;
}

/**
 * Format date as MM/YYYY
 * Used for: Mes de servicio
 */
export function formatMonthYear(date: Date | string | null | undefined): string {
  if (!date) return '-';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '-';
  
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  
  return `${month}/${year}`;
}

/**
 * Parse a "YYYY-MM" or "MM/YYYY" string to a formatted MM/YYYY string
 * Handles various input formats for mes de servicio
 */
export function formatMesServicio(value: string | null | undefined): string {
  if (!value) return '-';
  
  // If already in MM/YYYY format, return as is
  if (/^\d{2}\/\d{4}$/.test(value)) {
    return value;
  }
  
  // If in YYYY-MM format (from date inputs)
  if (/^\d{4}-\d{2}$/.test(value)) {
    const [year, month] = value.split('-');
    return `${month}/${year}`;
  }
  
  // If in YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value);
    if (!isNaN(date.getTime())) {
      return formatMonthYear(date);
    }
  }
  
  // Try to parse as date
  const date = new Date(value);
  if (!isNaN(date.getTime())) {
    return formatMonthYear(date);
  }
  
  return value;
}
