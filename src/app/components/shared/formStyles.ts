import { cn } from '@/app/components/ui/utils';

/**
 * Shared form styles for gastos formularios (Programacion, Experience, GastoCard).
 */
export const formStyles = (isDark: boolean) => ({
  label: cn(
    'flex items-center gap-1 text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]',
  ),
  input: cn(
    'h-[32px] transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ),
  selectTrigger: cn(
    'h-[32px] w-full transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white'
      : 'bg-white border-[#d1d5db] text-gray-900',
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ),
  disabledSelect: cn(
    'h-[32px] w-full transition-colors text-sm',
    isDark
      ? 'bg-[#1e1e1e] border-gray-800 text-gray-400'
      : 'bg-[#f3f4f6] border-[#d1d5db] text-gray-600',
    'cursor-not-allowed',
  ),
  textarea: cn(
    'min-h-[72px] resize-none transition-colors text-sm',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
    'disabled:opacity-60 disabled:cursor-not-allowed',
  ),
});

/**
 * Shared form styles for dialog forms (DialogAdminComprobante, DialogIngresoAdmin, etc.).
 */
export const dialogFormStyles = (isDark: boolean) => ({
  label: cn(
    'text-sm font-semibold',
    isDark ? 'text-gray-400' : 'text-[#374151]',
  ),
  input: cn(
    'h-9',
    isDark
      ? 'bg-[#141414] border-gray-800 text-white placeholder:text-gray-600'
      : 'bg-white border-[#d1d5db] text-gray-900 placeholder:text-[#d1d5db]',
  ),
});
